"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Search, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MainNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  // Generate avatar initials from user's name or email
  const getInitials = () => {
    if (!user) return "?";

    if (userData?.firstName) {
      return `${userData.firstName.charAt(0)}${
        userData.lastName ? userData.lastName.charAt(0) : ""
      }`;
    }

    return user.email ? user.email.charAt(0).toUpperCase() : "U";
  };

  // Get user data from Firestore
  useEffect(() => {
    if (user && user.uid) {
      // This could be improved by adding a getUserData function to the AuthContext
      import("firebase/firestore").then(({ getDoc, doc }) => {
        import("@/lib/firebase").then(({ db }) => {
          getDoc(doc(db, "users", user.uid))
            .then((docSnap) => {
              if (docSnap.exists()) {
                setUserData(docSnap.data());
              }
            })
            .catch(console.error);
        });
      });
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <MobileNav
                isLoggedIn={!!user}
                onLogout={handleLogout}
                userRole={userData?.role}
              />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">StayEase</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Find Rooms
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex relative w-full max-w-sm items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search destinations..."
              className="pl-8 w-[200px] lg:w-[300px]"
            />
          </form>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userData?.profileImage || "/placeholder.svg"}
                      alt={userData?.firstName || "User"}
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userData?.role === "owner" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/owner/dashboard">Owner Dashboard</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/bookings">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={loading}>
                  {loading ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  isLoggedIn,
  onLogout,
  userRole,
}: {
  isLoggedIn: boolean;
  onLogout: () => void;
  userRole?: string;
}) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Link href="/" className="flex items-center space-x-2 px-4">
        <span className="font-bold text-xl">StayEase</span>
      </Link>
      <div className="px-4">
        <form className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search destinations..."
            className="pl-8 w-full"
          />
        </form>
      </div>
      <nav className="flex flex-col gap-2 px-4">
        <Link
          href="/search"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Find Rooms
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Contact
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              href={userRole === "owner" ? "/owner/dashboard" : "/dashboard"}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Bookings
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Profile
            </Link>
            <Button
              variant="ghost"
              className="justify-start p-2 h-8"
              onClick={onLogout}
            >
              <span className="text-sm font-medium">Sign Out</span>
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
