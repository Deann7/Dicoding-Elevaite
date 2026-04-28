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

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-2xl tracking-tight uppercase">
        <Zap className="h-6 w-6" />
        Sinergi.ai
      </Link>
      
      <Card className="w-full max-w-md rounded-none border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold uppercase tracking-widest">Reset Password</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your email and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="manager@factory.com" className="rounded-none border-border h-12" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-2">
          <Button className="w-full rounded-none h-12 font-bold uppercase tracking-widest text-xs">
            Send Reset Link
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Remember your password?{" "}
            <Link href="/auth/login" className="underline underline-offset-4 font-semibold text-foreground hover:text-muted-foreground">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
        Sistem Inventaris Energi Terintegrasi
      </p>
    </div>
  );
}
