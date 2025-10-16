import NextAuth from "next-auth"
import { authConfig } from "./app/auth.config";
import { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(req: NextRequest) {
    const session = await auth();
}
