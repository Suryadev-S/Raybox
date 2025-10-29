import { NextRequest, NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string, path: string[] }> }) {
    try {
        const { type, path: filePathParts } = await params;
        const { STORAGE_PREFIX: store } = process.env;

        // Reconstruct the relative file path from URL
        const relativePath = filePathParts.join(path.sep);

        if (!store) {
            return NextResponse.json("Error with the storage prefix", { status: 500 });
        }

        // Construct the absolute path
        const fullPath = path.join(store, "media", type, relativePath);

        // Check if file exists
        try {
            await fs.access(fullPath);
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Read the file as a buffer
        const fileBuffer = await fs.readFile(fullPath);

        // Detect MIME type
        const ext = path.extname(fullPath).toLowerCase();
        let contentType = "application/octet-stream";

        if ([".jpg", ".jpeg"].includes(ext)) contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".gif") contentType = "image/gif";
        else if (ext === ".svg") contentType = "image/svg+xml";

        // ✅ Convert Buffer → Uint8Array for TypeScript safety
        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.log("error");
        return NextResponse.json("error", { status: 500 });
    }
}