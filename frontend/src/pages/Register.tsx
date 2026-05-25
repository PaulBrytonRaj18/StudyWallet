import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/hooks/useAuth";
import { useThemeStore } from "@/store/themeStore";
import { Moon, Sun, BookOpen } from "lucide-react";
import { FormField } from "@/components/ui/form";
import { registerSchema, type RegisterInput } from "@/lib/validation";

export function Register() {
  const registerMutation = useRegister();
  const { isDark, toggle } = useThemeStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
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
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Start organizing your studies</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField<RegisterInput>
              label="Full Name (optional)"
              name="full_name"
              register={register}
              errors={errors}
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="John Doe"
                  {...register("full_name")}
                />
              )}
            </FormField>
            <FormField<RegisterInput>
              label="Username"
              name="username"
              register={register}
              errors={errors}
              required
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="johndoe"
                  {...register("username")}
                />
              )}
            </FormField>
            <FormField<RegisterInput>
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
            <FormField<RegisterInput>
              label="Password"
              name="password"
              register={register}
              errors={errors}
              required
              hint="Min 8 chars, uppercase, lowercase, digit, special character"
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
            <Button type="submit" className="w-full" disabled={!isValid || registerMutation.isPending}>
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
