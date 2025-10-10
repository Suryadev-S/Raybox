import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const formData = await req.formData();
        console.log(formData.getAll('files'));
        return NextResponse.json("route response", { status: 200 });
    } catch (error) {
        console.log("error");
        return NextResponse.json("error", { status: 500 });
    }
}