import React from "react";
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
import { Shield, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Thêm state để hiển thị lỗi ngay trên form thay vì alert
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Reset lỗi cũ

    try {
      // Best practice: Dùng biến môi trường cho URL
      // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
       
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
        }
        
        onLogin();
      } else {
        // Hiển thị lỗi từ server hoặc lỗi mặc định
        setError(data.detail || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
      }
    } catch (error) {
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Cách hiển thị ảnh nền an toàn hơn trong React */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('/media/background_hand.jpg')" }} // Giả sử ảnh trong folder public/media
        ></div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 bg-red-600">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Reddit Monitor
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Empowering parents with insights to guide their children through the
            digital world safely and responsibly.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-none shadow-none lg:shadow-sm bg-transparent lg:bg-card">
          <CardHeader className="space-y-2 text-center lg:text-left px-0">
            <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hiển thị lỗi ở đây nếu có */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="parent@example.com"
                      className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold transition-all duration-200 
             bg-gradient-to-r from-red-400 to-red-600 hover:from-red-400/90 hover:to-red-600/90
             shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5
             active:scale-[0.98] active:translate-y-0 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                  onClick={onNavigateToSignUp}
                >
                  Sign up now
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}