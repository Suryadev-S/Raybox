'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Card, CardContent, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";

const RegisterSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    userName: z
        .string()
        .min(2, "Username must be at least 2 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
    const [formError, setFormError] = useState<string | null>(null)
    const form = useForm<RegisterValues>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            displayName: "",
            userName: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: RegisterValues) {
        setFormError(null)
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', values);
            if (response.data.success) {
                toast.success(response.data.message || "Registration successful!");
            } else {
                toast.error(response.data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("some error occured");
        }
    }
    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card aria-labelledby="register-title">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel asChild>
                                        <Label htmlFor="displayName">Display name</Label>
                                    </FormLabel>
                                    <FormControl>
                                        <Input id="displayName" type="text" autoComplete="name" placeholder="Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel asChild>
                                        <Label htmlFor="userName">Username</Label>
                                    </FormLabel>
                                    <FormControl>
                                        <Input id="userName" type="text" autoComplete="username" placeholder="janedoe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                        <Input id="password" type="password" autoComplete="new-password" {...field} />
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
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center"></CardFooter>
        </Card>
    )
}