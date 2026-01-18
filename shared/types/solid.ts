export enum AclMode {
	Read = "acl:Read",
	Write = "acl:Write",
	Append = "acl:Append",
	Control = "acl:Control",
}

export enum AclAgentClass {
	Agent = "foaf:Agent",
}

export interface PodContainer {
	path: string
	name: string
	aclType: AclPermissionType
}

export enum AclPermissionType {
	PublicReadOwnerWrite = "PublicReadOwnerWrite",
	PublicAppendPrivateRead = "PublicAppendPrivateRead",
	PrivateOwnerOnly = "PrivateOwnerOnly",
}

export interface AclConfig {
	resourceUrl: string
	ownerWebId: string
	modes: AclMode[]
	agentClass?: AclAgentClass
	isPublic?: boolean
}

export interface ContainerAclConfig {
	containerUrl: string
	ownerWebId: string
	permissionType: AclPermissionType
}
