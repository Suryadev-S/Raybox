import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <main className="min-h-[100dvh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-balance">Create your account</h1>
                    <p className="text-sm text-muted-foreground">Join us in a few seconds</p>
                </header>
                <RegisterForm />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}