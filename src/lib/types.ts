import mongoose, { Types } from "mongoose";

export type FileTypeEnum = 'image' | 'video' | 'document' | 'audio' | 'others'
export type UserRoleEnum = 'admin' | 'user';
export type UserStatusEnum = 'active' | 'inactive'
export type EventEnum = 'process_update' | 'process_finish'

export interface FileType {
    originalName: string,
    fileName: string,
    size: number,
    storagePath: string,
    type: FileTypeEnum,
    mimeType: string,
    thumbnailId: Types.ObjectId,
    owner: Types.ObjectId,
    hash: string,
}


export interface User {
    displayName: string,
    userName: string,
    passwordHash: string,
    email: string,
    role: UserRoleEnum,
    profileThumbnailId: Types.ObjectId | null,
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
    owner: Types.ObjectId,
    parent: Types.ObjectId,
    coverThumbnailId: Types.ObjectId,
}

export interface CollectionFilesJoin {
    collectionId: Types.ObjectId,
    itemId: Types.ObjectId
}

export interface Tags {
    name: string
}

export interface TagsLookup {
    tagId: Types.ObjectId,
    itemId: Types.ObjectId
}

export interface PaginateOptions {
    model: mongoose.Model<any>;
    query?: Record<string, any>;
    select?: string;
    page?: number;
    limit?: number;
    sort?: any;
    populate?: mongoose.PopulateOptions | mongoose.PopulateOptions[];
}