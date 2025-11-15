import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Shield } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to monitor your children's social media activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Log In
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 256 256" fill="currentColor">
                <path d="M248,104a8,8,0,0,1-8,8H216v128a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V112H16a8,8,0,0,1-6.31-12.91l112-144a8,8,0,0,1,12.63,0l112,144A8,8,0,0,1,248,104ZM128,168a12,12,0,1,0-12-12A12,12,0,0,0,128,168Z"/>
              </svg>
              Log in with Reddit
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={onNavigateToSignUp}
              >
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
