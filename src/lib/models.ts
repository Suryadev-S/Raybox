import { model, models, Schema } from "mongoose";
import { Collection, CollectionFilesJoin, FileType, Tags, TagsLookup, Thumbnail, User } from "./types";

const FileSchema = new Schema<FileType>({
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    storagePath: { type: String, required: true },
    size: { type: Number, required: true },
    type: {
        type: String,
        enum: ['image', 'video', 'document', 'audio', 'others'],
        required: true
    },
    mimeType: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnailId: { type: Schema.Types.ObjectId, ref: 'Thumbnail' },
},
    { timestamps: true }
);
// url: to be added in the response json and not included in the the schema.

const UserSchema = new Schema<User>(
    {
        displayName: { type: String, required: true, trim: true, },
        userName: { type: String, required: true, unique: true, lowercase: true, trim: true, },
        passwordHash: { type: String, required: true, },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
        role: { type: String, enum: ['admin', 'user'], default: 'user', },
        profileThumbnailId: { type: Schema.Types.ObjectId, ref: "Thumbnail", default: null, },
        storageQuota: {
            type: Number,
            default: 1024 * 1024 * 1024, // e.g. 1 GB default quota
        },
        storageUsed: {
            type: Number,
            default: 0,
        },
        status: { type: String, enum: ['active', 'inactive'], default: 'active', },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

const ThumbnailSchema = new Schema<Thumbnail>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        storagePath: {
            type: String,
            required: true,
            trim: true,
        },
        size: {
            type: Number,
            required: true,
            min: 0,
        },
        resolution: {
            width: { type: Number, required: true, min: 0 },
            height: { type: Number, required: true, min: 0 },
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);
// url: to be added in the response json and not included in the the schema.

const CollectionSchema = new Schema<Collection>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",     // references the User collection
            required: true,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Collection",
            default: null, // only __root__ will have null parent
        },
        coverThumbnailId: {
            type: Schema.Types.ObjectId,
            ref: "Thumbnail", // references the Thumbnail collection
            default: null,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const CollectionFilesSchema = new Schema<CollectionFilesJoin>(
    {
        collectionId: {
            type: Schema.Types.ObjectId,
            ref: "Collection",
            required: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
            ref: "File",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const TagsSchema = new Schema<Tags>(
    {
        name: {
            type: String,
            required: true,
            unique: true, // tag names are unique
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const TagsLookupSchema = new Schema<TagsLookup>(
    {
        tagId: {
            type: Schema.Types.ObjectId,
            ref: "Tags",
            required: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const FileModel = models.Files || model<FileType>('Files', FileSchema);

export const UserModel = models.Users || model<User>('Users', UserSchema);

export const ThumbnailModel = models.Thumbnails || model<Thumbnail>("Thumbnails", ThumbnailSchema);

export const CollectionModel = models.Collections || model<Collection>("Collections", CollectionSchema);

export const CollectionFilesModel = models.CollectionFilesJoins || model<CollectionFilesJoin>(
    "CollectionFilesJoins",
    CollectionFilesSchema
);

export const TagsModel = models.Tags || model<Tags>("Tags", TagsSchema);

export const TagsLookupModel = models.TagsLookup || model<TagsLookup>("TagsLookup", TagsLookupSchema);
