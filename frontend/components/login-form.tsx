"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store";
import { useLogin } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoginInput, loginSchema } from "@/lib/schemas/auth.schema";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

export function LoginForm({
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const mutation = useLogin();
  const setTokens = useAuthStore((state) => state.setTokens);

  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await mutation.mutateAsync({
      email: values.email,
      password: values.password,
    });
    setTokens({ accessToken: result.accessToken });
    router.push("/admin/dashboard");
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...form.register("email")}
              />
              <FieldDescription>{form.formState.errors.email?.message}</FieldDescription>
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
              </div>
              <Input
                id="password"
                type="password"
                required
                {...form.register("password")}
              />
              <FieldDescription>{form.formState.errors.password?.message}</FieldDescription>
            </Field>

            {mutation.isError ? (
              <FieldDescription className="text-red-500">
                {mutation.error instanceof Error ? mutation.error.message : "Error logging in"}
              </FieldDescription>
            ) : null}

            <Field>
                <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Logging in..." : "Login"}
                </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
