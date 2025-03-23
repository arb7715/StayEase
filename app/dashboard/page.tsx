import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HotelCard } from "@/components/hotel-card"
import { BookingCard } from "@/components/booking-card"
import Link from "next/link"
import { CalendarCheck, CalendarClock, Search, Heart, Gift } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground">Here's an overview of your bookings and saved hotels.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Stays</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">You have 2 upcoming reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Stays</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">You've completed 8 stays with us</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Hotels</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">You have 5 hotels in your wishlist</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,500</div>
            <p className="text-xs text-muted-foreground">Points available for your next booking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
          <TabsTrigger value="past">Past Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BookingCard
              hotelName="Luxury Ocean Resort"
              location="Maldives"
              checkIn="Mar 15, 2023"
              checkOut="Mar 22, 2023"
              status="confirmed"
              image="/placeholder.svg?height=300&width=400"
            />
            <BookingCard
              hotelName="Mountain View Lodge"
              location="Switzerland"
              checkIn="Apr 10, 2023"
              checkOut="Apr 15, 2023"
              status="confirmed"
              image="/placeholder.svg?height=300&width=400"
            />
          </div>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BookingCard
              hotelName="Urban Boutique Hotel"
              location="New York"
              checkIn="Jan 5, 2023"
              checkOut="Jan 10, 2023"
              status="completed"
              image="/placeholder.svg?height=300&width=400"
            />
            <BookingCard
              hotelName="Beachfront Villa"
              location="Bali"
              checkIn="Feb 12, 2023"
              checkOut="Feb 18, 2023"
              status="completed"
              image="/placeholder.svg?height=300&width=400"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Find More Hotels
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <HotelCard
            id="4"
            name="Beachfront Villa"
            location="Bali"
            price={179}
            rating={4.6}
            image="/placeholder.svg?height=300&width=400"
          />
          <HotelCard
            id="5"
            name="Historic City Hotel"
            location="Prague"
            price={159}
            rating={4.5}
            image="/placeholder.svg?height=300&width=400"
          />
          <HotelCard
            id="6"
            name="Desert Oasis Resort"
            location="Dubai"
            price={289}
            rating={4.8}
            image="/placeholder.svg?height=300&width=400"
          />
        </div>
      </div>
    </div>
  )
}

