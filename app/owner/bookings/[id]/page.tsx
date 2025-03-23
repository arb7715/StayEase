import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Printer,
  User,
  Users,
  X,
} from "lucide-react"

// Mock booking data
const booking = {
  id: "B-12345",
  guestName: "Sarah Johnson",
  guestEmail: "sarah.j@example.com",
  guestPhone: "+1 (555) 123-4567",
  property: "Luxury Ocean Resort",
  roomType: "Deluxe Ocean Villa",
  checkIn: "Mar 15, 2023",
  checkOut: "Mar 22, 2023",
  guests: 2,
  amount: "$2,093",
  status: "confirmed",
  paymentStatus: "paid",
  paymentMethod: "Visa •••• 4242",
  specialRequests: "Late check-in (around 9 PM). Ocean view preferred.",
  bookingDate: "Feb 20, 2023",
  notes: "Returning guest. VIP treatment recommended.",
  history: [
    {
      date: "Feb 20, 2023",
      time: "14:32",
      action: "Booking created",
      user: "Sarah Johnson (Guest)",
    },
    {
      date: "Feb 20, 2023",
      time: "14:35",
      action: "Payment processed",
      user: "System",
    },
    {
      date: "Feb 21, 2023",
      time: "09:15",
      action: "Booking confirmed",
      user: "Admin",
    },
    {
      date: "Feb 25, 2023",
      time: "11:42",
      action: "Welcome email sent",
      user: "System",
    },
  ],
}

export default function BookingDetailsPage() {
  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/owner/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
              <p className="text-muted-foreground">Booking ID: {booking.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Guest
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Reservation Details</CardTitle>
                  <Badge
                    className={
                      booking.status === "confirmed"
                        ? "bg-green-500"
                        : booking.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>Booked on {booking.bookingDate}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
                      <p className="text-base font-medium">{booking.property}</p>
                      <p className="text-sm">{booking.roomType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Check-in</h3>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{booking.checkIn}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">After 2:00 PM</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Check-out</h3>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{booking.checkOut}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Before 11:00 AM</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Guests</h3>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>{booking.guests} Adults</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Guest Information</h3>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{booking.guestEmail}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{booking.guestPhone}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Special Requests</h3>
                      <p className="text-sm mt-1">{booking.specialRequests || "None"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Internal Notes</h3>
                      <p className="text-sm mt-1">{booking.notes || "No notes added"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Information</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-primary" />
                      <span>{booking.paymentMethod}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room charge</span>
                      <span>$1,893</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & fees</span>
                      <span>$200</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{booking.amount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {booking.status === "pending" && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                )}
                {booking.status !== "cancelled" && (
                  <Button variant="destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>Timeline of actions and changes to this booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.history.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          {item.action.includes("created") ? (
                            <User className="h-4 w-4" />
                          ) : item.action.includes("Payment") ? (
                            <CreditCard className="h-4 w-4" />
                          ) : item.action.includes("confirmed") ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                        </div>
                        {index < booking.history.length - 1 && (
                          <div className="absolute left-4 top-8 h-full w-px -translate-x-1/2 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.action}</p>
                          <time className="text-sm text-muted-foreground">
                            {item.date} at {item.time}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">By: {item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href={`/owner/bookings/${booking.id}/edit`}>Modify Booking</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Guest
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Confirmation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add internal notes about this booking..."
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save Note</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </HotelOwnerLayout>
  )
}

