"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { signupSchema, type SignupInput } from "@/lib/schemas/auth.schema";
import { useSignup } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const mutation = useSignup();
  const setTokens = useAuthStore((state) => state.setTokens);

  const form = useForm<SignupInput>({
    resolver: standardSchemaResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setTokens({ accessToken: result.accessToken });
    router.push("/admin/dashboard");
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your information below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" {...form.register("name")} />
              <FieldDescription>{form.formState.errors.name?.message}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" {...form.register("email")} />
              <FieldDescription>{form.formState.errors.email?.message}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" {...form.register("password")} />
              <FieldDescription>{form.formState.errors.password?.message ?? "Must be at least 8 characters long."}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input id="confirm-password" type="password" {...form.register("confirmPassword")} />
              <FieldDescription>{form.formState.errors.confirmPassword?.message}</FieldDescription>
            </Field>

            {mutation.isError ? (
              <FieldDescription className="text-red-500">
                {mutation.error instanceof Error ? mutation.error.message : "Erro ao criar conta"}
              </FieldDescription>
            ) : null}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Account"}
            </Button>

            <FieldDescription className="px-6 text-center">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
