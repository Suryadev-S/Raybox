import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { connectMongo } from "./lib/utils";
import { UserModel } from "./lib/models";
import bcrypt from 'bcrypt';
import { authConfig } from "./app/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                await connectMongo();

                const { email, password } = credentials as { email: string; password: string };

                if (!email || !password)
                    throw new Error("Missing credentials");

                // Allow login by either email or username
                const user = await UserModel.findOne({ email: email.toLowerCase() });

                if (!user) throw new Error("No user found");

                const isValid = bcrypt.compare(
                    password,
                    user.passwordHash
                );
                if (!isValid) throw new Error("Invalid password");

                if (user.status !== "active")
                    throw new Error("User account inactive");

                return {
                    id: user._id.toString(),
                    name: user.displayName,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    }
})