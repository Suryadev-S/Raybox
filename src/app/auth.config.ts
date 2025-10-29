import type { NextAuthConfig } from "next-auth"


export const authConfig = {
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/login'
    },
    secret: process.env.AUTH_SECRET,
    providers: [],
    callbacks: {},
} satisfies NextAuthConfig