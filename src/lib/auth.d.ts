import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    // Extend the User model returned from authorize() or the adapter
    interface User extends DefaultUser {
        id: string;
        role: "admin" | "user";
    }

    // Extend the session object
    interface Session {
        user: {
            id: string;
            role: "admin" | "user";
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "admin" | "user";
    }
}
