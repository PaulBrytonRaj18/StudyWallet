import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";
import { useThemeStore } from "@/store/themeStore";
import { Moon, Sun, BookOpen } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { loginSchema, type LoginInput } from "@/lib/validation";

export function Login() {
  const login = useLogin();
  const { isDark, toggle } = useThemeStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = (data: LoginInput) => {
    login.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-4 top-4"
        onClick={toggle}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your StudyWallet account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField<LoginInput>
              label="Email"
              name="email"
              register={register}
              errors={errors}
              required
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
              )}
            </FormField>
            <FormField<LoginInput>
              label="Password"
              name="password"
              register={register}
              errors={errors}
              required
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="password"
                  {...register("password")}
                />
              )}
            </FormField>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!isValid || login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
