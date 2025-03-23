import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Download,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  Share,
  Star,
  Users,
} from "lucide-react"

// Mock booking details
const booking = {
  id: "B-12345",
  hotelName: "Luxury Ocean Resort",
  location: "Maldives",
  address: "123 Paradise Island, Maldives",
  checkIn: "Mar 15, 2023",
  checkOut: "Mar 22, 2023",
  guests: 2,
  roomType: "Deluxe Ocean Villa",
  status: "confirmed",
  image: "/placeholder.svg?height=400&width=600",
  price: {
    perNight: 299,
    nights: 7,
    subtotal: 2093,
    taxes: 209.3,
    total: 2302.3,
  },
  paymentMethod: "Visa •••• 4242",
  contactPhone: "+1 (555) 123-4567",
  cancellationPolicy: "Free cancellation until Mar 8, 2023",
}

export default function BookingDetailsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/bookings">
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
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Reservation Summary</CardTitle>
                <Badge
                  className={
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="aspect-[4/3] rounded-md overflow-hidden">
                    <Image
                      src={booking.image || "/placeholder.svg"}
                      alt={booking.hotelName}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">{booking.hotelName}</h2>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Check-in</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{booking.checkIn}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>After 2:00 PM</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Check-out</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{booking.checkOut}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Before 11:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Room Type</div>
                      <div className="font-medium">{booking.roomType}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Guests</div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{booking.guests} Adults</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Cancellation Policy</h3>
                <p className="text-sm text-muted-foreground">{booking.cancellationPolicy}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  <span>{booking.paymentMethod}</span>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ${booking.price.perNight} x {booking.price.nights} nights
                  </span>
                  <span>${booking.price.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & fees</span>
                  <span>${booking.price.taxes}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${booking.price.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Contact Hotel</h3>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  <span>{booking.contactPhone}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Customer Support</h3>
                <Button className="w-full" asChild>
                  <Link href="/dashboard/support">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/hotel/${booking.id}`}>
                  <Star className="mr-2 h-4 w-4" />
                  View Hotel
                </Link>
              </Button>

              {booking.status === "confirmed" && (
                <Button variant="destructive" className="w-full">
                  Cancel Reservation
                </Button>
              )}

              {booking.status === "completed" && (
                <Button className="w-full" asChild>
                  <Link href="/dashboard/reviews/new">
                    <Star className="mr-2 h-4 w-4" />
                    Write a Review
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

