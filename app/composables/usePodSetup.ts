import {ref} from 'vue';
import {useAuthStore} from '~/stores/auth';
import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  getProfileAll,
  getSolidDataset,
  getThing,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
  getSourceUrl,
  type SolidDataset,
} from '@inrupt/solid-client';
import {NAMESPACES} from '~~/shared/constants';

export function usePodSetup() {
  const auth = useAuthStore();
  const isSettingUp = ref(false);
  const error = ref<string | null>(null);

  async function setupPod(data: { name: string, handle: string }) {
    if (!auth.isLoggedIn || !auth.user?.webId) {
      error.value = "You must be logged in to set up your Pod.";
      return false;
    }

    isSettingUp.value = true;
    error.value = null;

    try {
      const webId = auth.user.webId;
      
      // Discover all profile documents and storage. 
      // This is important for Inrupt Pods where the WebID is read-only.
      const profiles = await getProfileAll(webId, { fetch: auth.session.fetch });
      const webIdThing = getThing(profiles.webIdProfile, webId);

      // Determine pod base. Prefer storage property if available.
      let podBase = "";
      const storage = webIdThing ? getUrl(webIdThing, "http://www.w3.org/ns/pim/space#storage") : null;
      
      if (storage) {
        podBase = storage;
      } else {
        const webIdUrl = new URL(webId);
        const isFragment = !!webIdUrl.hash;
        webIdUrl.hash = '';
        podBase = webIdUrl.toString();
        if (isFragment) {
          // If it was a fragment, use the directory of the profile document
          podBase = podBase.substring(0, podBase.lastIndexOf('/') + 1);
        } else {
          // If it was not a fragment (like in ActivityPods), use it as a base
          if (!podBase.endsWith('/')) podBase += '/';
        }
      }
      
      if (!podBase.endsWith('/')) podBase += '/';
      
      const inboxUrl = `${podBase}inbox/`;
      const outboxUrl = `${podBase}outbox/`;

      // 1. Create inbox container (if it doesn't exist)
      try {
        await createContainerAt(inboxUrl, { fetch: auth.session.fetch });
      } catch (e: any) {
        // If it already exists, that's fine (409 Conflict is common for existing containers)
        if (e.statusCode !== 409) {
          console.warn("Could not create inbox container, it might already exist:", e);
        }
      }

      // 2. Create outbox container (if it doesn't exist)
      try {
        await createContainerAt(outboxUrl, { fetch: auth.session.fetch });
      } catch (e: any) {
        if (e.statusCode !== 409) {
          console.warn("Could not create outbox container, it might already exist:", e);
        }
      }

      // 3. Update Profile
      // Determine which document to update.
      // We prefer any alternative profile document if it exists, as it's more likely to be writable than the WebID itself.
      let targetUrl = webId;
      let dataset: SolidDataset = profiles.webIdProfile;

      // Create a list of candidate documents to try
      const candidates: { url: string; dataset?: SolidDataset }[] = [];
      
      // 1. Existing alternative profiles (already fetched)
      profiles.altProfileAll.forEach(ds => {
        const url = getSourceUrl(ds);
        if (url && url !== webId) {
          candidates.push({ url, dataset: ds });
        }
      });
      
      // 2. Discovered alternative profile URLs
      if (webIdThing) {
        const discoveredUrls = new Set<string>();
        getUrlAll(webIdThing, NAMESPACES.FOAF + "isPrimaryTopicOf").forEach(url => discoveredUrls.add(url));
        getUrlAll(webIdThing, NAMESPACES.RDFS + "seeAlso").forEach(url => discoveredUrls.add(url));
        
        discoveredUrls.forEach(url => {
          if (url !== webId && !candidates.some(c => c.url === url)) {
            candidates.push({ url });
          }
        });
      }

      for (const candidate of candidates) {
        try {
          if (candidate.dataset) {
            dataset = candidate.dataset;
          } else {
            dataset = await getSolidDataset(candidate.url, { fetch: auth.session.fetch });
          }
          targetUrl = candidate.url;
          console.log(`Using alternative profile document for update: ${targetUrl}`);
          break; 
        } catch (e: any) {
          // If it's a 404 and we don't have a dataset yet, we can use it as a target with an empty dataset
          if (e.statusCode === 404 && !candidate.dataset) {
            dataset = createSolidDataset();
            targetUrl = candidate.url;
            console.log(`Using new alternative profile document for update: ${targetUrl}`);
            break;
          }
          console.warn(`Could not use alternative profile document ${candidate.url}, trying next`, e);
        }
      }

      // Try to find the thing for the WebID, or common variations (with fragment)
      let profileThing = getThing(dataset, webId);
      if (!profileThing) {
        // Try with common fragments if not found
        const variations = [webId + "#me", webId + "#id", webId + "#main"];
        for (const v of variations) {
          profileThing = getThing(dataset, v);
          if (profileThing) {
            console.log(`Found profile thing with variation: ${v}`);
            break;
          }
        }
      }

      if (!profileThing) {
        profileThing = buildThing({ url: webId }).build();
      }

      let profileBuilder = buildThing(profileThing)
        .setUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", NAMESPACES.ACTIVITYSTREAMS + "#Person")
        .setUrl(NAMESPACES.ACTIVITYSTREAMS + "#inbox", inboxUrl)
        .setUrl(NAMESPACES.ACTIVITYSTREAMS + "#outbox", outboxUrl)
        .setStringNoLocale(NAMESPACES.ACTIVITYSTREAMS + "#name", data.name)
        .setStringNoLocale(NAMESPACES.ACTIVITYSTREAMS + "#preferredUsername", data.handle)
        .setUrl(NAMESPACES.ACTIVITYSTREAMS + "#url", webId)
        // Also add FOAF name for compatibility
        .setStringNoLocale(NAMESPACES.FOAF + "name", data.name);

      dataset = setThing(dataset, profileBuilder.build());

      await saveSolidDatasetAt(targetUrl, dataset, { fetch: auth.session.fetch });

      return true;
    } catch (e: any) {
      console.error("Error setting up Pod:", e);
      error.value = e.message || "Failed to set up Pod. Please check your Pod permissions.";
      return false;
    } finally {
      isSettingUp.value = false;
    }
  }

  return {
    setupPod,
    isSettingUp,
    error
  };
}
