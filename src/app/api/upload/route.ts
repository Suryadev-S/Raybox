import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const incomingPayload = await req.formData();

        const files = incomingPayload.getAll("files") as File[];

        files.forEach((file) => {
            console.log("Uploaded file:", file.name);
        });

        return NextResponse.json({ message: "Files received", count: files.length });
    } catch (error) {
        console.log("error");
        return NextResponse.json("error", { status: 500 });
    }
}