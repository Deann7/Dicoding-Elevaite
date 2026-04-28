import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-2xl tracking-tight uppercase">
        <Zap className="h-6 w-6" />
        Sinergi.ai
      </Link>
      
      <Card className="w-full max-w-md rounded-none border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold uppercase tracking-widest">Welcome Back</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your email and password to access your dashboard.
          </CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            {resolvedParams?.message && (
              <p className="mt-4 p-4 bg-destructive/10 text-destructive text-center text-sm">
                {resolvedParams.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">Email</Label>
              <Input name="email" id="email" type="email" placeholder="manager@factory.com" className="rounded-none border-border h-12" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-muted-foreground font-medium underline underline-offset-4 hover:text-foreground">Forgot password?</Link>
              </div>
              <Input name="password" id="password" type="password" className="rounded-none border-border h-12" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full rounded-none h-12 font-bold uppercase tracking-widest text-xs">
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="underline underline-offset-4 font-semibold text-foreground hover:text-muted-foreground">
                Register Here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
        Sistem Inventaris Energi Terintegrasi
      </p>
    </div>
  );
}
