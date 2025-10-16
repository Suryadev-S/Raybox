'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const LoginSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
    const [formError, setFormError] = useState<string | null>(null)
    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginValues) {
        setFormError(null);
        const res = await signIn('credentials', { redirect: false, ...values });
        if (res?.error) {
            setFormError(res.error);
            return;
        }

        if (res?.ok) {
            toast.success("Logged in successfully");
            // optionally redirect manually
            // router.push('/dashboard');
        }
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card aria-labelledby="login-title">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel asChild>
                                        <Label htmlFor="email">Email</Label>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel asChild>
                                        <Label htmlFor="password">Password</Label>
                                    </FormLabel>
                                    <FormControl>
                                        <Input id="password" type="password" autoComplete="current-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {formError ? (
                            <p role="alert" className="text-sm text-destructive">
                                {formError}
                            </p>
                        ) : null}

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center"></CardFooter>
        </Card>
    )
}