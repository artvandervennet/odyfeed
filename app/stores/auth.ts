import {defineStore} from 'pinia';
import {useSolidAuth} from '~/composables/useSolidAuth';
import {ref, computed} from 'vue';
import {getProfileAll, getThing, getUrl, getUrlAll, getStringNoLocale, getSolidDataset, getSourceUrl} from '@inrupt/solid-client';
import {NAMESPACES} from '~~/shared/constants';

export const useAuthStore = defineStore('auth', () => {
	const {solidLogin, handleRedirect, isLoggedIn, session} = useSolidAuth();

	const user = computed(() => session.info)
	const profile = ref<any>(null);

	async function fetchProfile() {
		if (!session.info.isLoggedIn || !session.info.webId) return;

		try {
			const webId = session.info.webId;
			const profiles = await getProfileAll(webId, {fetch: session.fetch});

			// Combine info from all profile documents
			const profileData: any = {id: webId};

			const datasets = [profiles.webIdProfile, ...profiles.altProfileAll];
			const processedUrls = new Set<string>();
			datasets.forEach(ds => {
				const url = getSourceUrl(ds);
				if (url) processedUrls.add(url);
			});

			// Manually find alternative profile documents to supplement getProfileAll
			const altUrls = new Set<string>();
			const webIdThing = getThing(profiles.webIdProfile, webId);
			if (webIdThing) {
				getUrlAll(webIdThing, NAMESPACES.FOAF + "isPrimaryTopicOf").forEach(url => altUrls.add(url));
				getUrlAll(webIdThing, NAMESPACES.RDFS + "seeAlso").forEach(url => altUrls.add(url));
			}

			// Fetch alternative profiles discovered (like from seeAlso or isPrimaryTopicOf)
			for (const altUrl of altUrls) {
				if (altUrl === webId || processedUrls.has(altUrl)) continue;
				try {
					const altDataset = await getSolidDataset(altUrl, {fetch: session.fetch});
					datasets.push(altDataset);
					processedUrls.add(altUrl);
				} catch (e) {
					console.warn(`Could not fetch alternative profile at ${altUrl}:`, e);
				}
			}

			for (const dataset of datasets) {
				// Try to find the thing for the WebID, or common variations (with fragment)
				let thing = getThing(dataset, webId);
				if (!thing) {
					// Try with common fragments if not found
					const variations = [webId + "#me", webId + "#id", webId + "#main"];
					for (const v of variations) {
						thing = getThing(dataset, v);
						if (thing) break;
					}
				}
				
				if (!thing) continue;

				// Extract properties using multiple possible namespaces/formats
				const inbox = getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "#inbox") ||
					getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "/inbox") ||
					getUrl(thing, "http://www.w3.org/ns/ldp#inbox");
				if (inbox) profileData.inbox = inbox;

				const outbox = getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "#outbox") ||
					getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "/outbox");
				if (outbox) profileData.outbox = outbox;

				const preferredUsername = getStringNoLocale(thing, NAMESPACES.ACTIVITYSTREAMS + "#preferredUsername") ||
					getStringNoLocale(thing, NAMESPACES.ACTIVITYSTREAMS + "/preferredUsername") ||
					getStringNoLocale(thing, "http://xmlns.com/foaf/0.1/nick");
				if (preferredUsername) profileData.preferredUsername = preferredUsername;

				const name = getStringNoLocale(thing, NAMESPACES.ACTIVITYSTREAMS + "#name") ||
					getStringNoLocale(thing, NAMESPACES.ACTIVITYSTREAMS + "/name") ||
					getStringNoLocale(thing, NAMESPACES.FOAF + "name") ||
					getStringNoLocale(thing, "http://www.w3.org/2000/01/rdf-schema#label");
				if (name) profileData.name = name;

				const icon = getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "#icon") ||
					getUrl(thing, NAMESPACES.ACTIVITYSTREAMS + "#image") ||
					getUrl(thing, NAMESPACES.FOAF + "img") ||
					getUrl(thing, NAMESPACES.FOAF + "depiction");
				if (icon) profileData.icon = icon;
			}

			profile.value = profileData;
			console.log("Fetched and merged profile:", profile.value);
		} catch (e) {
			console.error("Failed to fetch profile:", e);
		}
	}

	const inbox = computed(() => profile.value?.inbox || profile.value?.['as:inbox']);
	const outbox = computed(() => profile.value?.outbox || profile.value?.['as:outbox']);
	const preferredUsername = computed(() => profile.value?.preferredUsername || profile.value?.['as:preferredUsername']);
	const name = computed(() => profile.value?.name || profile.value?.['as:name'] || profile.value?.['foaf:name'] || preferredUsername.value);
	const avatar = computed(() => {
		const icon = profile.value?.icon || profile.value?.['as:icon'];
		if (typeof icon === 'string') return icon;
		return icon?.url || icon?.['as:url'] || profile.value?.image || profile.value?.['as:image'];
	});

	return {
		solidLogin,
		handleRedirect,
		isLoggedIn,
		session,
		user,
		profile,
		fetchProfile,
		inbox,
		outbox,
		preferredUsername,
		name,
		avatar,
	};
});
