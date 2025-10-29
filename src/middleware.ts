import NextAuth from "next-auth"
import { authConfig } from "./app/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
    const { pathname } = req.nextUrl;

    if (!!req.auth) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL(req.nextUrl.origin));
});

export const config = {
    matcher: [
        "/api/raybox/:path*"
    ],
};
