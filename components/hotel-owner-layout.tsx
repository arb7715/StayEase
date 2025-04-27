"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Building,
  Calendar,
  DollarSign,
  Home,
  Hotel,
  LifeBuoy,
  LogOut,
  PlusCircle,
  Settings,
} from "lucide-react"

export function HotelOwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/owner/dashboard",
      icon: Home,
    },
    {
      name: "Listings",
      href: "/owner/listings",
      icon: Building,
    },
    {
      name: "Add Hotel",
      href: "/owner/listings/new",
      icon: PlusCircle,
    },
    {
      name: "Bookings",
      href: "/owner/bookings",
      icon: Calendar,
    },
    {
      name: "Coupons",
      href: "/owner/coupons",
      icon: DollarSign,
    },
    {
      name: "Analytics",
      href: "/owner/analytics",
      icon: BarChart,
    },
    {
      name: "Settings",
      href: "/owner/settings",
      icon: Settings,
    },
    {
      name: "Support",
      href: "/owner/support",
      icon: LifeBuoy,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-muted md:min-h-screen">
        <div className="p-4 md:p-6 flex flex-col h-full">
          <div className="flex items-center mb-6">
            <Hotel className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">Owner Portal</span>
          </div>
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

