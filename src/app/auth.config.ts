import type { NextAuthConfig } from "next-auth"


export const authConfig = {
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/login'
    },
    providers: [],
    callbacks: {},
} satisfies NextAuthConfig