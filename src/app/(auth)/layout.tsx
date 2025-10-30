import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '../globals.css'
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Raybox Login",
    description: "Login to raybox to view your files",
};

const AuthLayout = ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
};

export default AuthLayout;