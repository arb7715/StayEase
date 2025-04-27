"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard } from "@/components/booking-card";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { format, isAfter } from "date-fns";
import { DateRange } from "react-day-picker";

// Define booking interface
interface Booking {
  id: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  image: string;
  rawCheckIn: Date;
  rawCheckOut: Date;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Booking state
  const [bookings, setBookings] = useState<{
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  }>({
    upcoming: [],
    past: [],
    cancelled: [],
  });

  // Fetch user bookings from Firebase
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view your bookings");
      router.push("/login");
      return;
    }

    fetchUserBookings();
  }, [user, router]);

  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);

      // Query bookings for the current user
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc")
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);

      const upcoming: Booking[] = [];
      const past: Booking[] = [];
      const cancelled: Booking[] = [];
      const now = new Date();

      // Process each booking
      for (const doc of bookingsSnapshot.docs) {
        const data = doc.data();

        // Format check-in and check-out dates
        const checkInDate =
          data.checkIn instanceof Timestamp
            ? data.checkIn.toDate()
            : new Date(data.checkIn);

        const checkOutDate =
          data.checkOut instanceof Timestamp
            ? data.checkOut.toDate()
            : new Date(data.checkOut);

        // Get hotel details
        let hotelName = data.hotelName || "Unknown Hotel";
        let location = "Unknown Location";
        let imageUrl = "/placeholder.svg?height=300&width=400";

        // If we have hotelId, try to get more details (optional enhancement)
        if (data.hotelId) {
          try {
            const hotelDoc = await db
              .collection("hotels")
              .doc(data.hotelId)
              .get();
            if (hotelDoc.exists) {
              const hotelData = hotelDoc.data();
              if (hotelData) {
                hotelName = hotelData.name || hotelName;
                location = hotelData.location?.city || location;
                imageUrl = hotelData.images?.[0] || imageUrl;
              }
            }
          } catch (error) {
            // Continue with default values if hotel fetch fails
            console.error("Error fetching hotel details:", error);
          }
        }

        // Create booking object
        const booking: Booking = {
          id: doc.id,
          hotelName: hotelName,
          location: data.hotelLocation || location,
          checkIn: format(checkInDate, "MMM dd, yyyy"),
          checkOut: format(checkOutDate, "MMM dd, yyyy"),
          status: data.status || "pending",
          image: data.hotelImage || imageUrl,
          rawCheckIn: checkInDate,
          rawCheckOut: checkOutDate,
        };

        // Categorize booking
        if (booking.status === "cancelled") {
          cancelled.push(booking);
        } else if (isAfter(now, checkOutDate)) {
          // If check-out date is in the past, consider it a past booking
          booking.status = "completed"; // Set status to completed if in the past
          past.push(booking);
        } else {
          // Otherwise it's an upcoming booking
          upcoming.push(booking);
        }
      }

      setBookings({ upcoming, past, cancelled });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to bookings
  const applyFilters = (bookingsList: Booking[]) => {
    return bookingsList.filter((booking) => {
      // Apply search filter
      const matchesSearch =
        booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      // Apply date range filter if set
      let matchesDateRange = true;
      if (dateRange?.from && dateRange?.to) {
        matchesDateRange =
          (booking.rawCheckIn >= dateRange.from &&
            booking.rawCheckIn <= dateRange.to) ||
          (booking.rawCheckOut >= dateRange.from &&
            booking.rawCheckOut <= dateRange.to);
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  // Get filtered bookings for the current tab
  const filteredBookings = applyFilters(
    bookings[activeTab as keyof typeof bookings]
  );

  // Handle date range filter changes
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage all your hotel reservations
        </p>
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
            <DatePickerWithRange
              date={dateRange}
              setDate={handleDateRangeChange}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      <Tabs
        defaultValue="upcoming"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
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
              <h3 className="mt-4 text-lg font-semibold">
                No upcoming bookings found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateRange
                  ? "Try adjusting your search filters"
                  : "You don't have any upcoming bookings"}
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
                  id={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status}
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
              <h3 className="mt-4 text-lg font-semibold">
                No past bookings found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateRange
                  ? "Try adjusting your search filters"
                  : "You don't have any past bookings"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  id={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status}
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
              <h3 className="mt-4 text-lg font-semibold">
                No cancelled bookings found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateRange
                  ? "Try adjusting your search filters"
                  : "You don't have any cancelled bookings"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  id={booking.id}
                  hotelName={booking.hotelName}
                  location={booking.location}
                  checkIn={booking.checkIn}
                  checkOut={booking.checkOut}
                  status={booking.status}
                  image={booking.image}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
