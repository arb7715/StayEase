"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === "first-name"
        ? "firstName"
        : id === "last-name"
        ? "lastName"
        : id === "company"
        ? "companyName"
        : id]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (userType === "owner" && !formData.companyName.trim()) {
      toast.error("Company name is required for hotel owners");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user object with role
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: userType,
        ...(userType === "owner" && { companyName: formData.companyName }),
      };

      // Call signup function from AuthContext
      await signup(formData.email, formData.password, userData);

      toast.success("Account created successfully!");

      // Redirect based on user type
      if (userType === "user") {
        router.push("/dashboard");
      } else {
        router.push("/owner/dashboard");
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      let errorMessage = "Failed to create account. Please try again.";

      // Handle specific Firebase error codes
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "Email already in use. Please use a different email or sign in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" onValueChange={setUserType}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="owner">Hotel Owner</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            {userType === "owner" && (
              <div className="space-y-2">
                <Label htmlFor="company">Hotel/Company Name</Label>
                <Input
                  id="company"
                  placeholder="Acme Hotels"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                placeholder="I agree to the terms"
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
