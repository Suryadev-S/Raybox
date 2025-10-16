import { auth } from "@/auth";
import { FileType, FileTypeEnum, Thumbnail } from "@/lib/types";
import { connectMongo, emitter, mapMimeToFileType } from "@/lib/utils";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs/promises';
import { CollectionFilesModel, CollectionModel, FileModel, ThumbnailModel } from "@/lib/models";
import { createHash } from "crypto";

function gethashedPartitions(fileHash: string): string {
    const lvl1: string = fileHash.slice(0, 2); //first two chars of hash
    const lvl2: string = fileHash.slice(2, 4); //next two chars of hash
    return path.join(lvl1, lvl2);
}

function getFileHash(fileBuffer: Buffer): string {
    return createHash("md5").update(fileBuffer).digest("hex");
}

async function imageThumbnailGenerator(fileHash: string, fileBuffer: Buffer): Promise<Types.ObjectId> {
    // name the thumbnail
    const uuid: string = uuidv4();
    const thumbName: string = `${uuid}_thumb.jpg`;

    // creating and placing the thumbnail in storage
    // const fileHash: string = getFileHash(fileBuffer);
    const hashPartitions: string = gethashedPartitions(fileHash); // hash of the original file
    const thumbPathRelative: string = path.join('media', 'thumbs', hashPartitions, thumbName)
    const thumbPathAbsolute: string = path.join(process.env.STORAGE_PREFIX as string, thumbPathRelative);

    //ensure directory creation
    await fs.mkdir(path.dirname(thumbPathAbsolute), { recursive: true }); 

    const meta = await sharp(fileBuffer).resize(300, 300, { fit: 'inside' }).toFile(thumbPathAbsolute);

    // registering the database
    const thumbnailDoc: Thumbnail = {
        name: thumbName,
        storagePath: thumbPathRelative,
        size: meta.size,
        resolution: {
            width: meta.width,
            height: meta.height,
        }
    };

    const thumbnail = await ThumbnailModel.create(thumbnailDoc);

    return thumbnail._id;
}

// thumbnail generator functions for different types of files
const ThumbnailGeneratorLookup: Record<string, (fh: string, fb: Buffer) => Promise<Types.ObjectId>> = {
    'image': imageThumbnailGenerator,
}

export async function POST(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session = await auth();
    if (!session) {
        console.log('session problem')
        return NextResponse.json("No session present", { status: 500 });
    }
    try {
        await connectMongo();

        // file(s) reception
        const formData = await req.formData();
        const file: File = formData.get("files") as File;
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        const buffer: Buffer = Buffer.from(arrayBuffer);

        console.log('file reception');

        // identify the file type
        const fileType: FileTypeEnum = mapMimeToFileType(file.type);
        const fileHash: string = getFileHash(buffer);
        emitter.emit('process_update', {
            msg: `file type: ${fileType}`,
            progress: 20
        });

        console.log('file type identification');

        // generate the thumbnail as per file type
        const thumbId: Types.ObjectId = await ThumbnailGeneratorLookup[fileType](fileHash, buffer);
        emitter.emit('process_update', {
            msg: 'thumbnail generated',
            progress: 40
        });

        console.log('thumbnail generation');

        // give a unique name for the file and placing in the storage
        const uuid: string = uuidv4();
        const ext: string = path.extname(file.name) || '';
        const fileName: string = `${uuid}${ext}`;
        const hashPartitions: string = gethashedPartitions(fileHash);
        const filePathAbsolute: string = path.join(
            process.env.STORAGE_PREFIX as string,
            'media',
            fileType,
            hashPartitions,
            fileName
        );
        const filePathRelative: string = path.join(
            'media',
            fileType,
            hashPartitions,
            fileName
        );
        await fs.mkdir(path.dirname(filePathAbsolute), { recursive: true }); // checks the existence and creates the directory.
        await fs.writeFile(filePathAbsolute, buffer);
        emitter.emit('process_update', {
            msg: 'file naming and storing complete',
            progress: 80
        });

        console.log('naming and file placing');

        // making database entry
        // entry in the file model
        const ownerId: Types.ObjectId = new Types.ObjectId(session.user.id);
        const fileDoc: FileType = {
            originalName: file.name,
            fileName,
            size: file.size,
            storagePath: filePathRelative,
            type: fileType,
            mimeType: file.type, // file.type returns the mime-type
            thumbnailId: thumbId,
            owner: ownerId,
            hash: fileHash
        };
        const newFile = await FileModel.create(fileDoc);

        // linking with default root collection

        const rootCollectionId = await CollectionModel.findOne({ name: '__root__', owner: ownerId });

        await CollectionFilesModel.create({
            collectionId: rootCollectionId,
            itemId: newFile._id
        });

        console.log("db entries and document linking");

        emitter.emit('process_update', {
            msg: 'Db registration complete',
            progress: 100
        });

        return NextResponse.json(newFile, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json("error", { status: 500 });
    }
}