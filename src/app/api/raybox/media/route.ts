import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        console.log('hit in the media api');
        return NextResponse.json("route response", { status: 200 });
    } catch (error) {
        console.log("error");
        return NextResponse.json("error", { status: 500 });
    }
}