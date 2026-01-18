import { NAMESPACES } from "~~/shared/constants"
import type { AclMode, AclPermissionType } from "~~/shared/types/solid"

const generateAclHeader = function (resourceUrl: string): string {
	return `@prefix acl: <${NAMESPACES.ACL}>.
@prefix foaf: <${NAMESPACES.FOAF}>.

`
}

export const generatePublicReadOwnerWrite = function (
	resourceUrl: string,
	ownerWebId: string
): string {
	const header = generateAclHeader(resourceUrl)

	return `${header}<#public>
    a acl:Authorization;
    acl:accessTo <${resourceUrl}>;
    acl:default <${resourceUrl}>;
    acl:agentClass foaf:Agent;
    acl:mode acl:Read.

<#owner>
    a acl:Authorization;
    acl:accessTo <${resourceUrl}>;
    acl:default <${resourceUrl}>;
    acl:agent <${ownerWebId}>;
    acl:mode acl:Read, acl:Write, acl:Control.
`
}

export const generatePublicAppendPrivateRead = function (
	resourceUrl: string,
	ownerWebId: string
): string {
	const header = generateAclHeader(resourceUrl)

	return `${header}<#public>
    a acl:Authorization;
    acl:accessTo <${resourceUrl}>;
    acl:default <${resourceUrl}>;
    acl:agentClass foaf:Agent;
    acl:mode acl:Append.

<#owner>
    a acl:Authorization;
    acl:accessTo <${resourceUrl}>;
    acl:default <${resourceUrl}>;
    acl:agent <${ownerWebId}>;
    acl:mode acl:Read, acl:Write, acl:Control.
`
}

export const generatePrivateOwnerOnly = function (
	resourceUrl: string,
	ownerWebId: string
): string {
	const header = generateAclHeader(resourceUrl)

	return `${header}<#owner>
    a acl:Authorization;
    acl:accessTo <${resourceUrl}>;
    acl:default <${resourceUrl}>;
    acl:agent <${ownerWebId}>;
    acl:mode acl:Read, acl:Write, acl:Control.
`
}

export const generateAclForPermissionType = function (
	resourceUrl: string,
	ownerWebId: string,
	permissionType: AclPermissionType
): string {
	switch (permissionType) {
		case "PublicReadOwnerWrite":
			return generatePublicReadOwnerWrite(resourceUrl, ownerWebId)
		case "PublicAppendPrivateRead":
			return generatePublicAppendPrivateRead(resourceUrl, ownerWebId)
		case "PrivateOwnerOnly":
			return generatePrivateOwnerOnly(resourceUrl, ownerWebId)
		default:
			return generatePrivateOwnerOnly(resourceUrl, ownerWebId)
	}
}
