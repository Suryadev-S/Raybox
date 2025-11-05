import { auth } from "@/auth";
import { CollectionFilesModel, CollectionModel } from "@/lib/models";
import { connectMongo } from "@/lib/utils";
import mongoose, { ObjectId, Types } from "mongoose";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function getUserRoot(s: Session): Promise<mongoose.Types.ObjectId | null> {
    const userId = s.user.id;
    try {
        const userRoot = await CollectionModel.findOne({ owner: userId, name: '__root__' }).select({ _id: 1 });
        return userRoot._id;
    } catch (error) {
        console.error(error);
        return null
    }
}

// GET: /api/raybox/:collection?page=1&limit=10 which for specific collections
export async function GET(req: NextRequest, { params }: { params: Promise<{ collection?: string[] }> }) {

    try {
        await connectMongo();
        let collectionId: mongoose.Types.ObjectId | null = null;

        const { collection } = await params;

        if (!collection) {
            const session = await auth();
            if (!session || !session.user) {
                console.log("No session of the user exists");
                return NextResponse.json("No session", { status: 500 });
            }
            collectionId = await getUserRoot(session);
        } else {
            collectionId = new mongoose.Types.ObjectId(collection[0]);
        }

        if (collectionId == null) {
            return NextResponse.json("Collection Id is null", { status: 500 });
        }

        const searchParams: URLSearchParams = req.nextUrl.searchParams;
        const page: number = parseInt(searchParams.get('page') || "1", 10);
        const limit: number = parseInt(searchParams.get('limit') || "25", 10);
        const skip: number = (page - 1) * limit;

        const results = await CollectionModel.aggregate([
            // 1️ Get child collections (folders)
            { $match: { parent: collectionId } },
            // 🧩 Lookup for cover thumbnails of collections
            {
                $lookup: {
                    from: "thumbnails",
                    localField: "coverThumbnailId",
                    foreignField: "_id",
                    as: "thumbnail",
                },
            },
            { $unwind: { path: "$thumbnail", preserveNullAndEmptyArrays: true } },
            // 🎯 Shape collection documents
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    type: { $literal: "collection" },
                    thumbnail: {
                        _id: "$thumbnail._id",
                        resolution: "$thumbnail.resolution",
                        storagePath: "$thumbnail.storagePath",
                    },
                },
            },
            // 2️ Combine with files inside this collection
            {
                $unionWith: {
                    coll: "collectionfilesjoins",
                    pipeline: [
                        { $match: { collectionId } },
                        {
                            $lookup: {
                                from: "files",
                                localField: "itemId",
                                foreignField: "_id",
                                as: "file",
                            },
                        },
                        { $unwind: "$file" },
                        // 🧩 Lookup for thumbnail details
                        {
                            $lookup: {
                                from: "thumbnails", // name of your thumbnail collection
                                localField: "file.thumbnailId",
                                foreignField: "_id",
                                as: "thumbnail",
                            },
                        },
                        { $unwind: { path: "$thumbnail", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: "$file._id",
                                name: "$file.originalName",
                                size: "$file.size",
                                mimeType: "$file.mimeType",
                                createdAt: "$file.createdAt",
                                updatedAt: "$file.updatedAt",
                                storagePath: "$file.storagePath",
                                type: { $literal: "file" },
                                thumbnail: {
                                    _id: "$thumbnail._id",
                                    resolution: "$thumbnail.resolution",
                                    storagePath: "$thumbnail.storagePath",
                                },
                            },
                        }
                    ],
                },
            },
            { $sort: { type: 1, name: 1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        const [collectionCount, fileCount] = await Promise.all([
            CollectionModel.countDocuments({ parent: collectionId }),
            CollectionFilesModel.countDocuments({ collectionId })
        ]);

        const total = collectionCount + fileCount;

        const response = {
            data: results,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            }
        }
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.log("error");
        return NextResponse.json("error", { status: 500 });
    }
}