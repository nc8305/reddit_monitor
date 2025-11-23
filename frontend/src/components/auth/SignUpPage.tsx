import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Shield, User, Mail, Lock, Loader2 } from "lucide-react"; // Thêm Loader2
import { toast } from "sonner";

interface SignUpPageProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

export function SignUpPage({ onSignUp, onNavigateToLogin }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Client-side
    if (!agreeToTerms) {
      toast.error("You must agree to the terms");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Gọi API Backend
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          // Backend yêu cầu 'full_name', nhưng state của bạn là 'name' -> Phải ánh xạ
          full_name: name, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Thành công
        toast.success("Sign up successful! Please log in.");
        // Chuyển người dùng về trang Login
        onNavigateToLogin(); 
      } else {
        // 4. Thất bại (Ví dụ: Email đã tồn tại)
        toast.error(data.detail || "sign up failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80')" }}
        ></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Join with Us
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Start monitoring and protecting your children online today.
            Compliance with COPPA and GDPR included.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-none shadow-none lg:shadow-sm bg-transparent lg:bg-card">
          <CardHeader className="space-y-2 text-center lg:text-left px-0">
            <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
              Create an account
            </CardTitle>
            <CardDescription className="text-base">
              Get started with your account to begin your journey to understand
              your children
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Parent's Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="terms"
                  className="mt-1"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to comply with{" "}
                  <span className="text-foreground font-medium">COPPA</span> and{" "}
                  <span className="text-foreground font-medium">GDPR</span>{" "}
                  regulations and will only monitor my own children with
                  appropriate consent.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-md mt-4 bg-red-600 hover:bg-red-500 transition-all"
                disabled={!agreeToTerms || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                  onClick={onNavigateToLogin}
                >
                  Log in
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}