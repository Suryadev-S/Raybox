import { CollectionModel, UserModel } from "@/lib/models";
import { connectMongo } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await connectMongo();
        const { displayName, userName, email, password } = await req.json();

        if (!displayName || !userName || !email || !password) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }

        const existing = await UserModel.findOne({
            $or: [{ email }, { userName }],
        });

        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // create user
        const user = await UserModel.create({
            displayName,
            userName,
            email,
            passwordHash,
        });

        // create root,trash collections of the user
        // the root collection for the user
        const root = await CollectionModel.create({
            name: "__root__",
            owner: user._id,
            parent: null,
        });

        const trash = await CollectionModel.create({
            name: "__trash__",
            owner: user._id,
            parent: root._id,
        });

        return NextResponse.json(
            { success: true, message: "User registered successfully", userId: user._id },
            { status: 200 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "Registration failed. Please try again later." },
            { status: 500 }
        );
    }
}