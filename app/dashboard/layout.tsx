"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, Home, LifeBuoy, LogOut, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      name: "Wishlist",
      href: "/dashboard/wishlist",
      icon: Heart,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Support",
      href: "/dashboard/support",
      icon: LifeBuoy,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-muted md:min-h-screen">
        <div className="p-4 md:p-6 flex flex-col h-full">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-auto pt-4">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}

