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
      let dataset = profiles.webIdProfile;

      // Manually find alternative profile documents to supplement getProfileAll
      const altProfiles = new Set([...profiles.altProfileAll]);
      if (webIdThing) {
        getUrlAll(webIdThing, NAMESPACES.FOAF + "isPrimaryTopicOf").forEach(url => altProfiles.add(url));
        getUrlAll(webIdThing, NAMESPACES.RDFS + "seeAlso").forEach(url => altProfiles.add(url));
      }
      
      // Remove webId from alts to avoid circularity/infinite loops if it's there
      altProfiles.delete(webId);

      if (altProfiles.size > 0) {
        // Try each alternative profile until we find one that is reachable or potentially writable
        for (const altUrl of altProfiles) {
          try {
            dataset = await getSolidDataset(altUrl, {fetch: auth.session.fetch});
            targetUrl = altUrl;
            console.log(`Using existing alternative profile document for update: ${targetUrl}`);
            break; 
          } catch (e: any) {
            // If it's a 404, we can still use it as a target! We'll just start with an empty dataset.
            if (e.statusCode === 404) {
              dataset = createSolidDataset();
              targetUrl = altUrl;
              console.log(`Using new alternative profile document for update: ${targetUrl}`);
              break;
            }
            console.warn(`Could not fetch alternative profile document ${altUrl}, trying next`, e);
          }
        }
      }

      let profileThing = getThing(dataset, webId);

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
