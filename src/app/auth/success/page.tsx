import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-2xl tracking-tight uppercase">
        <Zap className="h-6 w-6" />
        Sinergi.ai
      </Link>
      
      <Card className="w-full max-w-md rounded-none border-border shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-widest text-green-600">Success!</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            You have successfully logged in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Welcome back to the Sinergi.ai dashboard. You can now access all your energy inventory tools.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-2">
          <Button asChild className="w-full rounded-none h-12 font-bold uppercase tracking-widest text-xs">
            <Link href="/dashboard" className="w-full h-full flex items-center justify-center">
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
        Sistem Inventaris Energi Terintegrasi
      </p>
    </div>
  );
}
