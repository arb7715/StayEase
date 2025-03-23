"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingCard } from "@/components/booking-card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search } from "lucide-react"

// Mock data for bookings
const bookings = {
  upcoming: [
    {
      id: "1",
      hotelName: "Luxury Ocean Resort",
      location: "Maldives",
      checkIn: "Mar 15, 2023",
      checkOut: "Mar 22, 2023",
      status: "confirmed",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "2",
      hotelName: "Mountain View Lodge",
      location: "Switzerland",
      checkIn: "Apr 10, 2023",
      checkOut: "Apr 15, 2023",
      status: "confirmed",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  past: [
    {
      id: "3",
      hotelName: "Urban Boutique Hotel",
      location: "New York",
      checkIn: "Jan 5, 2023",
      checkOut: "Jan 10, 2023",
      status: "completed",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "4",
      hotelName: "Beachfront Villa",
      location: "Bali",
      checkIn: "Feb 12, 2023",
      checkOut: "Feb 18, 2023",
      status: "completed",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "5",
      hotelName: "Historic City Hotel",
      location: "Prague",
      checkIn: "Dec 20, 2022",
      checkOut: "Dec 27, 2022",
      status: "completed",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "6",
      hotelName: "Desert Oasis Resort",
      location: "Dubai",
      checkIn: "Nov 8, 2022",
      checkOut: "Nov 15, 2022",
      status: "completed",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  cancelled: [
    {
      id: "7",
      hotelName: "Lakeside Cabin",
      location: "Lake Tahoe",
      checkIn: "Feb 28, 2023",
      checkOut: "Mar 5, 2023",
      status: "cancelled",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")

  // Filter bookings based on search term
  const filteredBookings = bookings[activeTab as keyof typeof bookings].filter(
    (booking) =>
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage all your hotel reservations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <DatePickerWithRange />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {bookings.upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {bookings.past.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {bookings.cancelled.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No upcoming bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You don't have any upcoming bookings"}
              </p>
              <Button className="mt-4" asChild>
                <a href="/search">Find a Hotel</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status as any}
                  image={booking.image}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No past bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You don't have any past bookings"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status as any}
                  image={booking.image}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No cancelled bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You don't have any cancelled bookings"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status as any}
                  image={booking.image}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

