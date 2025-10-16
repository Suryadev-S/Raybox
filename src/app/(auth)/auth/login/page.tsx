import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="min-h-[100dvh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-balance">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your account</p>
                </header>
                <LoginForm />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    )
}