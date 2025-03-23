import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { BarChart, Building, Calendar, DollarSign, Hotel, Star, TrendingUp, Users } from "lucide-react"

export default function OwnerDashboardPage() {
  return (
    <HotelOwnerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Owner Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your properties and bookings.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">You have 5 properties listed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Based on 124 reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <BarChart className="h-16 w-16 text-muted-foreground/50" />
                <span className="ml-2 text-muted-foreground">Revenue Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your most recent bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    property: "Luxury Ocean Resort",
                    guest: "Sarah Johnson",
                    dates: "Mar 15 - Mar 22, 2023",
                    amount: "$2,093",
                  },
                  {
                    property: "Mountain View Lodge",
                    guest: "Michael Chen",
                    dates: "Apr 10 - Apr 15, 2023",
                    amount: "$995",
                  },
                  {
                    property: "Urban Boutique Hotel",
                    guest: "Emma Rodriguez",
                    dates: "Apr 18 - Apr 20, 2023",
                    amount: "$498",
                  },
                ].map((booking, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.property}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-3 w-3" />
                        {booking.guest}
                      </div>
                      <div className="text-xs text-muted-foreground">{booking.dates}</div>
                    </div>
                    <div className="font-medium">{booking.amount}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/owner/bookings">View All Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>Based on booking frequency and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Luxury Ocean Resort",
                    bookings: 12,
                    revenue: "$8,450",
                    trend: "+15%",
                  },
                  {
                    name: "Mountain View Lodge",
                    bookings: 8,
                    revenue: "$5,200",
                    trend: "+8%",
                  },
                  {
                    name: "Urban Boutique Hotel",
                    bookings: 6,
                    revenue: "$3,800",
                    trend: "+5%",
                  },
                ].map((property, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{property.name}</p>
                      <div className="text-xs text-muted-foreground">{property.bookings} bookings</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{property.revenue}</div>
                      <div className="text-xs text-green-600 flex items-center justify-end">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {property.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest feedback from your guests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    property: "Luxury Ocean Resort",
                    guest: "Sarah Johnson",
                    rating: 5,
                    comment: "Absolutely stunning resort with impeccable service.",
                  },
                  {
                    property: "Mountain View Lodge",
                    guest: "Michael Chen",
                    rating: 5,
                    comment: "One of the best hotel experiences I've ever had.",
                  },
                  {
                    property: "Urban Boutique Hotel",
                    guest: "Emma Rodriguez",
                    rating: 4,
                    comment: "Beautiful property with amazing views.",
                  },
                ].map((review, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.property}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "fill-current text-yellow-500" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.guest}</p>
                    <p className="text-sm line-clamp-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button asChild>
                  <Link href="/owner/listings/new">
                    <Hotel className="mr-2 h-4 w-4" />
                    Add New Property
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/listings">
                    <Building className="mr-2 h-4 w-4" />
                    Manage Properties
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/coupons">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Manage Coupons
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/analytics">
                    <BarChart className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/support">
                    <Users className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HotelOwnerLayout>
  )
}

