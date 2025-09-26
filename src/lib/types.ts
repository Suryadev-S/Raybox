import { Schema } from "mongoose"

export type FileTypeEnum = 'image' | 'video' | 'document' | 'audio' | 'others'
export type UserRoleEnum = 'admin' | 'user';
export type UserStatusEnum = 'active' | 'inactive'

export interface FileType {
    originalName: string,
    fileName: string,
    size: number,
    storagePath: string,
    type: FileTypeEnum,
    mimeType: string,
    thumbnailId: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    hash: string,
}

export interface User {
    displayName: string,
    userName: string,
    passwordHash: string,
    email: string,
    role: UserRoleEnum,
    profileThumbnailId: Schema.Types.ObjectId | null,
    storageQuota: number,
    storageUsed: number,
    status: UserStatusEnum
}

export interface Thumbnail {
    name: string,
    storagePath: string,
    size: number,
    resolution: {
        width: number,
        height: number,
    }
}

export interface Collection {
    name: string,
    description: string,
    owner: Schema.Types.ObjectId,
    coverThumbnailId: Schema.Types.ObjectId,
}

export interface CollectionFiles {
    collectionId: Schema.Types.ObjectId,
    itemId: Schema.Types.ObjectId
}

export interface Tags {
    name: string
}

export interface TagMaps {
    tagId: Schema.Types.ObjectId,
    itemId: Schema.Types.ObjectId
}