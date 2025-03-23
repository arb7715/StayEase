"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Check, Download, Filter, MoreHorizontal, Search, X } from "lucide-react"

// Mock data for bookings
const bookings = {
  upcoming: [
    {
      id: "B-12345",
      guestName: "Sarah Johnson",
      guestEmail: "sarah.j@example.com",
      property: "Luxury Ocean Resort",
      roomType: "Deluxe Ocean Villa",
      checkIn: "Mar 15, 2023",
      checkOut: "Mar 22, 2023",
      guests: 2,
      amount: "$2,093",
      status: "confirmed",
      paymentStatus: "paid",
    },
    {
      id: "B-12346",
      guestName: "Michael Chen",
      guestEmail: "m.chen@example.com",
      property: "Mountain View Lodge",
      roomType: "Premium Suite",
      checkIn: "Apr 10, 2023",
      checkOut: "Apr 15, 2023",
      guests: 3,
      amount: "$995",
      status: "confirmed",
      paymentStatus: "paid",
    },
    {
      id: "B-12347",
      guestName: "Emma Rodriguez",
      guestEmail: "emma.r@example.com",
      property: "Urban Boutique Hotel",
      roomType: "Standard Room",
      checkIn: "Apr 18, 2023",
      checkOut: "Apr 20, 2023",
      guests: 1,
      amount: "$498",
      status: "pending",
      paymentStatus: "pending",
    },
  ],
  past: [
    {
      id: "B-12340",
      guestName: "John Smith",
      guestEmail: "john.s@example.com",
      property: "Luxury Ocean Resort",
      roomType: "Deluxe Ocean Villa",
      checkIn: "Feb 10, 2023",
      checkOut: "Feb 15, 2023",
      guests: 2,
      amount: "$1,495",
      status: "completed",
      paymentStatus: "paid",
    },
    {
      id: "B-12341",
      guestName: "Lisa Wong",
      guestEmail: "lisa.w@example.com",
      property: "Mountain View Lodge",
      roomType: "Standard Room",
      checkIn: "Feb 20, 2023",
      checkOut: "Feb 25, 2023",
      guests: 2,
      amount: "$895",
      status: "completed",
      paymentStatus: "paid",
    },
    {
      id: "B-12342",
      guestName: "David Miller",
      guestEmail: "david.m@example.com",
      property: "Urban Boutique Hotel",
      roomType: "Deluxe Suite",
      checkIn: "Mar 1, 2023",
      checkOut: "Mar 5, 2023",
      guests: 3,
      amount: "$1,250",
      status: "completed",
      paymentStatus: "paid",
    },
  ],
  cancelled: [
    {
      id: "B-12343",
      guestName: "Robert Brown",
      guestEmail: "robert.b@example.com",
      property: "Luxury Ocean Resort",
      roomType: "Standard Room",
      checkIn: "Mar 8, 2023",
      checkOut: "Mar 12, 2023",
      guests: 1,
      amount: "$895",
      status: "cancelled",
      paymentStatus: "refunded",
      cancellationReason: "Guest requested cancellation",
    },
    {
      id: "B-12344",
      guestName: "Jennifer Lee",
      guestEmail: "jennifer.l@example.com",
      property: "Mountain View Lodge",
      roomType: "Premium Suite",
      checkIn: "Apr 5, 2023",
      checkOut: "Apr 10, 2023",
      guests: 2,
      amount: "$1,195",
      status: "cancelled",
      paymentStatus: "refunded",
      cancellationReason: "Emergency situation",
    },
  ],
}

export default function OwnerBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showFilters, setShowFilters] = useState(false)

  // Filter bookings based on search term
  const filteredBookings = bookings[activeTab as keyof typeof bookings].filter(
    (booking) =>
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
            <p className="text-muted-foreground">View and manage all your property bookings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Property</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="luxury">Luxury Ocean Resort</SelectItem>
                    <SelectItem value="mountain">Mountain View Lodge</SelectItem>
                    <SelectItem value="urban">Urban Boutique Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

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

          <TabsContent value="upcoming">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden md:table-cell">Property</TableHead>
                    <TableHead className="hidden md:table-cell">Check-in/out</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.property}</div>
                            <div className="text-sm text-muted-foreground">{booking.roomType}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.checkIn}</div>
                            <div className="text-sm text-muted-foreground">to {booking.checkOut}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.amount}</div>
                            <div>{getPaymentStatusBadge(booking.paymentStatus)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/owner/bookings/${booking.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuItem>Modify Booking</DropdownMenuItem>
                              {booking.status === "pending" && (
                                <DropdownMenuItem className="text-green-600">
                                  <Check className="mr-2 h-4 w-4" />
                                  Confirm Booking
                                </DropdownMenuItem>
                              )}
                              {booking.status !== "cancelled" && (
                                <DropdownMenuItem className="text-red-600">
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden md:table-cell">Property</TableHead>
                    <TableHead className="hidden md:table-cell">Check-in/out</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.property}</div>
                            <div className="text-sm text-muted-foreground">{booking.roomType}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.checkIn}</div>
                            <div className="text-sm text-muted-foreground">to {booking.checkOut}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.amount}</div>
                            <div>{getPaymentStatusBadge(booking.paymentStatus)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/owner/bookings/${booking.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Download Invoice</DropdownMenuItem>
                              <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden md:table-cell">Property</TableHead>
                    <TableHead className="hidden md:table-cell">Check-in/out</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.property}</div>
                            <div className="text-sm text-muted-foreground">{booking.roomType}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.checkIn}</div>
                            <div className="text-sm text-muted-foreground">to {booking.checkOut}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div>{booking.amount}</div>
                            <div>{getPaymentStatusBadge(booking.paymentStatus)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/owner/bookings/${booking.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Cancellation Details</DropdownMenuItem>
                              <DropdownMenuItem>Restore Booking</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </HotelOwnerLayout>
  )
}

