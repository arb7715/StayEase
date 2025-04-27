import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";

interface BookingCardProps {
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  image: string;
  id: string;
}

export function BookingCard({
  hotelName,
  location,
  checkIn,
  checkOut,
  status,
  image,
  id,
}: BookingCardProps) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  const statusText = {
    confirmed: "Confirmed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3">
          <div className="aspect-square sm:aspect-auto sm:h-full">
            <Image
              src={image || "/placeholder.svg"}
              alt={hotelName}
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{hotelName}</h3>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{location}</span>
                </div>
              </div>
              <Badge className={statusColors[status]}>
                {statusText[status]}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <span className="font-medium">Check-in:</span> {checkIn}
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="h-4 w-4 mr-2" />{" "}
                {/* Spacer to align with icon above */}
                <div>
                  <span className="font-medium">Check-out:</span> {checkOut}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/dashboard/bookings/details/${id}`}>
                View Details
              </Link>
            </Button>
            {status === "completed" && (
              <Button asChild className="flex-1">
                <Link href="/dashboard/reviews/new">Write Review</Link>
              </Button>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
