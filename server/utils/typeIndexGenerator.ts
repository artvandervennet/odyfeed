import { NAMESPACES } from "~~/shared/constants"
import { Parser } from "n3"

export interface TypeIndexRegistration {
	forClass: string
	instanceContainer?: string
	instance?: string
}

interface ParsedProfileData {
	prefixes: Map<string, string>
	documentMetadata: Array<{ subject: string; predicate: string; object: string }>
	profileTriples: Array<{ subject: string; predicate: string; object: string }>
	otherTriples: Array<{ subject: string; predicate: string; object: string }>
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

const parseExistingProfileCard = function (turtleContent: string, webId: string): ParsedProfileData {
	const parser = new Parser()
	const quads = parser.parse(turtleContent)

	const prefixes = new Map<string, string>()
	const documentMetadata: Array<{ subject: string; predicate: string; object: string }> = []
	const profileTriples: Array<{ subject: string; predicate: string; object: string }> = []
	const otherTriples: Array<{ subject: string; predicate: string; object: string }> = []

	// Extract prefixes safely
	const parserPrefixes = (parser as any)._prefixes
	if (parserPrefixes && typeof parserPrefixes === 'object') {
		for (const [prefix, uri] of Object.entries(parserPrefixes)) {
			if (typeof uri === 'string') {
				prefixes.set(prefix, uri)
			}
		}
	}

	// ActivityStreams predicates that we'll override
	const activityStreamsPredicates = new Set([
		`${NAMESPACES.ACTIVITYSTREAMS}inbox`,
		`${NAMESPACES.ACTIVITYSTREAMS}outbox`,
		`${NAMESPACES.ACTIVITYSTREAMS}followers`,
		`${NAMESPACES.ACTIVITYSTREAMS}following`,
		`${NAMESPACES.ACTIVITYSTREAMS}summary`,
		`${NAMESPACES.FOAF}name`,
		`${NAMESPACES.FOAF}nick`,
		`${NAMESPACES.FOAF}img`,
		`${NAMESPACES.FOAF}depiction`,
	])

	for (const quad of quads) {
		const triple = {
			subject: quad.subject.value,
			predicate: quad.predicate.value,
			object: quad.object.value,
		}

		// Categorize triples
		if (quad.subject.value === '' || quad.predicate.value.includes('PersonalProfileDocument') ||
		    quad.predicate.value.includes('primaryTopic') || quad.predicate.value.includes('maker')) {
			// Document-level metadata (e.g., foaf:PersonalProfileDocument)
			documentMetadata.push(triple)
		} else if (quad.subject.value.endsWith('#me') || quad.subject.value === webId) {
			// Profile triples - only keep non-ActivityStreams ones
			if (!activityStreamsPredicates.has(quad.predicate.value)) {
				profileTriples.push(triple)
			}
		} else {
			// Other triples
			otherTriples.push(triple)
		}
	}

	return { prefixes, documentMetadata, profileTriples, otherTriples }
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
	},
	existingProfileContent?: string | null
): string {
	let parsedData: ParsedProfileData | null = null

	// Parse existing profile if provided
	if (existingProfileContent) {
		try {
			parsedData = parseExistingProfileCard(existingProfileContent, webId)
		} catch (error) {
			console.error('Failed to parse existing profile card:', error)
		}
	}

	// Build prefixes - merge existing with required ones
	const requiredPrefixes = new Map([
		['foaf', NAMESPACES.FOAF],
		['solid', NAMESPACES.SOLID],
		['as', NAMESPACES.ACTIVITYSTREAMS],
		['rdf', NAMESPACES.RDF],
	])

	// Add additional prefixes from existing profile
	if (parsedData?.prefixes) {
		for (const [prefix, uri] of parsedData.prefixes) {
			if (!requiredPrefixes.has(prefix) && uri) {
				requiredPrefixes.set(prefix, uri)
			}
		}
	}

	// Build header with all prefixes
	let header = ''
	for (const [prefix, uri] of requiredPrefixes) {
		header += `@prefix ${prefix}: <${uri}>.\n`
	}
	header += '\n'

	// Add document-level metadata if exists (foaf:PersonalProfileDocument, etc.)
	let documentSection = ''
	if (parsedData?.documentMetadata && parsedData.documentMetadata.length > 0) {
		const docMetadataBySubject = new Map<string, Array<{ predicate: string; object: string }>>()

		for (const triple of parsedData.documentMetadata) {
			if (!docMetadataBySubject.has(triple.subject)) {
				docMetadataBySubject.set(triple.subject, [])
			}
			docMetadataBySubject.get(triple.subject)!.push({
				predicate: triple.predicate,
				object: triple.object,
			})
		}

		for (const [subject, predicates] of docMetadataBySubject) {
			if (subject === '') {
				documentSection += '<>\n'
			} else {
				documentSection += `<${subject}>\n`
			}

			predicates.forEach((p, idx) => {
				const isLast = idx === predicates.length - 1
				const predShort = shortenUri(p.predicate, requiredPrefixes)
				const objShort = p.object.startsWith('http') ? `<${p.object}>` : p.object
				documentSection += `    ${predShort} ${objShort}${isLast ? '.\n' : ';\n'}`
			})

			documentSection += '\n'
		}
	}

	// Build profile (#me) section
	let content = `<#me>\n`
	content += `    a foaf:Person, as:Person;\n`
	content += `    foaf:name "${actorData.name}";\n`
	content += `    foaf:nick "${actorData.preferredUsername}";\n`

	if (actorData.summary) {
		content += `    as:summary "${actorData.summary}";\n`
	}

	content += `    as:inbox <${actorData.inbox}>;\n`
	content += `    as:outbox <${actorData.outbox}>;\n`

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

	// Add preserved profile triples from existing profile
	if (parsedData?.profileTriples && parsedData.profileTriples.length > 0) {
		for (const triple of parsedData.profileTriples) {
			const predShort = shortenUri(triple.predicate, requiredPrefixes)
			const objShort = triple.object.startsWith('http') ? `<${triple.object}>` :
			                triple.object.startsWith('"') ? triple.object : `"${triple.object}"`
			content += `    ${predShort} ${objShort};\n`
		}
	}

	// Always end with type indices
	content += `    solid:publicTypeIndex <${podUrl}settings/publicTypeIndex.ttl>;\n`
	content += `    solid:privateTypeIndex <${podUrl}settings/privateTypeIndex.ttl>.\n`

	return header + documentSection + content
}

const shortenUri = function (uri: string, prefixes: Map<string, string>): string {
	for (const [prefix, namespace] of prefixes) {
		if (uri.startsWith(namespace)) {
			return `${prefix}:${uri.substring(namespace.length)}`
		}
	}
	return `<${uri}>`
}
