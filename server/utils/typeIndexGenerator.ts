import { NAMESPACES } from "~~/shared/constants"

export interface TypeIndexRegistration {
	forClass: string
	instanceContainer?: string
	instance?: string
}

const generateTypeIndexHeader = function (): string {
	return `@prefix solid: <${NAMESPACES.SOLID}>.
@prefix rdf: <${NAMESPACES.RDF}>.
@prefix as: <${NAMESPACES.ACTIVITYSTREAMS}>.
@prefix foaf: <${NAMESPACES.FOAF}>.

`
}

export const generatePublicTypeIndex = function (
	podUrl: string,
	registrations: TypeIndexRegistration[]
): string {
	const header = generateTypeIndexHeader()
	const indexUrl = `${podUrl}settings/publicTypeIndex.ttl`

	let content = `${header}<>
    a solid:TypeIndex, solid:ListedDocument;
    solid:forClass solid:TypeIndex.

`

	registrations.forEach((reg, index) => {
		const registrationId = `#registration${index}`
		content += `<${registrationId}>
    a solid:TypeRegistration;
    solid:forClass <${reg.forClass}>;
`

		if (reg.instanceContainer) {
			content += `    solid:instanceContainer <${reg.instanceContainer}>.\n`
		} else if (reg.instance) {
			content += `    solid:instance <${reg.instance}>.\n`
		}

		content += '\n'
	})

	return content
}

export const generatePrivateTypeIndex = function (
	podUrl: string,
	registrations: TypeIndexRegistration[]
): string {
	const header = generateTypeIndexHeader()
	const indexUrl = `${podUrl}settings/privateTypeIndex.ttl`

	let content = `${header}<>
    a solid:TypeIndex, solid:UnlistedDocument;
    solid:forClass solid:TypeIndex.

`

	registrations.forEach((reg, index) => {
		const registrationId = `#registration${index}`
		content += `<${registrationId}>
    a solid:TypeRegistration;
    solid:forClass <${reg.forClass}>;
`

		if (reg.instanceContainer) {
			content += `    solid:instanceContainer <${reg.instanceContainer}>.\n`
		} else if (reg.instance) {
			content += `    solid:instance <${reg.instance}>.\n`
		}

		content += '\n'
	})

	return content
}

export const generateProfileCard = function (
	webId: string,
	podUrl: string,
	actorData: {
		name: string
		preferredUsername: string
		summary?: string
		inbox: string
		outbox: string
		followers?: string
		following?: string
		icon?: { url: string }
		image?: { url: string }
	}
): string {
	const header = `@prefix foaf: <${NAMESPACES.FOAF}>.
@prefix solid: <${NAMESPACES.SOLID}>.
@prefix as: <${NAMESPACES.ACTIVITYSTREAMS}>.
@prefix rdf: <${NAMESPACES.RDF}>.

`

	let content = `${header}<#me>
    a foaf:Person, as:Person;
    foaf:name "${actorData.name}";
    foaf:nick "${actorData.preferredUsername}";
`

	if (actorData.summary) {
		content += `    as:summary "${actorData.summary}";\n`
	}

	content += `    as:inbox <${actorData.inbox}>;
    as:outbox <${actorData.outbox}>;
`

	if (actorData.followers) {
		content += `    as:followers <${actorData.followers}>;\n`
	}

	if (actorData.following) {
		content += `    as:following <${actorData.following}>;\n`
	}

	if (actorData.icon) {
		content += `    foaf:img <${actorData.icon.url}>;\n`
	}

	if (actorData.image) {
		content += `    foaf:depiction <${actorData.image.url}>;\n`
	}

	content += `    solid:publicTypeIndex <${podUrl}settings/publicTypeIndex.ttl>;
    solid:privateTypeIndex <${podUrl}settings/privateTypeIndex.ttl>.
`

	return content
}
