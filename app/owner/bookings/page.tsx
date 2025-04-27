"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Check,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  property: string;
  hotelId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: string;
  status: string;
  paymentStatus: string;
  cancellationReason?: string;
  createdAt: Timestamp;
}

export default function OwnerBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Store the bookings from Firebase
  const [bookingsData, setBookingsData] = useState<{
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  }>({
    upcoming: [],
    past: [],
    cancelled: [],
  });

  useEffect(() => {
    // Check if the user is authenticated
    if (!user) {
      router.push("/login");
      toast.error("You must be logged in to view bookings");
      return;
    }

    // Fetch the owner's properties
    const fetchProperties = async () => {
      try {
        const propertiesQuery = query(
          collection(db, "hotels"),
          where("ownerId", "==", user.uid)
        );
        const propertiesSnapshot = await getDocs(propertiesQuery);
        const propertiesList = propertiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setProperties(propertiesList);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load your properties");
      }
    };

    fetchProperties();
    fetchBookings();
  }, [user, router]);

  // Re-fetch bookings when filters change
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [selectedProperty, paymentStatusFilter, dateRange]);

  const fetchBookings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First get all hotels owned by this user
      const hotelsQuery = query(
        collection(db, "hotels"),
        where("ownerId", "==", user.uid)
      );
      const hotelsSnapshot = await getDocs(hotelsQuery);
      const hotelIds = hotelsSnapshot.docs.map((doc) => doc.id);

      if (hotelIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Query for bookings associated with these hotels
      let bookingsQuery = query(
        collection(db, "bookings"),
        where("hotelId", "in", hotelIds)
      );

      // Apply property filter if selected
      if (selectedProperty !== "all") {
        bookingsQuery = query(
          collection(db, "bookings"),
          where("hotelId", "==", selectedProperty)
        );
      }

      const bookingsSnapshot = await getDocs(bookingsQuery);

      const now = new Date();
      const upcoming: Booking[] = [];
      const past: Booking[] = [];
      const cancelled: Booking[] = [];

      // Process all bookings
      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();

        // Safely convert Firestore timestamps to Date objects
        const checkInDate = bookingData.checkIn
          ? bookingData.checkIn instanceof Timestamp
            ? bookingData.checkIn.toDate()
            : new Date(bookingData.checkIn)
          : new Date();

        const checkOutDate = bookingData.checkOut
          ? bookingData.checkOut instanceof Timestamp
            ? bookingData.checkOut.toDate()
            : new Date(bookingData.checkOut)
          : new Date();

        // Apply date range filter if set
        if (dateRange?.from && dateRange?.to) {
          if (checkInDate < dateRange.from || checkInDate > dateRange.to) {
            continue; // Skip this booking if outside date range
          }
        }

        // Apply payment status filter if set
        if (
          paymentStatusFilter !== "all" &&
          bookingData.paymentStatus !== paymentStatusFilter
        ) {
          continue; // Skip this booking if payment status doesn't match
        }

        // Format booking data
        const booking: Booking = {
          id: bookingDoc.id,
          guestName: bookingData.userId
            ? await getUserName(bookingData.userId)
            : "Guest",
          guestEmail: bookingData.userEmail || "No email provided",
          property: bookingData.hotelName || "Unknown Property",
          hotelId: bookingData.hotelId || "",
          roomType: bookingData.roomType || "Standard Room",
          checkIn: format(checkInDate, "MMM dd, yyyy"),
          checkOut: format(checkOutDate, "MMM dd, yyyy"),
          guests: bookingData.guests || 1,
          amount: bookingData.pricing?.total
            ? `$${bookingData.pricing.total.toFixed(2)}`
            : "Not set",
          status: bookingData.status || "pending",
          paymentStatus: bookingData.paymentStatus || "pending",
          cancellationReason: bookingData.cancellationReason || "",
          createdAt: bookingData.createdAt || Timestamp.now(),
        };

        // Categorize the booking
        if (booking.status === "cancelled") {
          cancelled.push(booking);
        } else if (checkOutDate < now) {
          past.push(booking);
        } else {
          upcoming.push(booking);
        }
      }

      // Sort bookings by check-in date
      upcoming.sort(
        (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
      );
      past.sort(
        (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
      );
      cancelled.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      setBookingsData({ upcoming, past, cancelled });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user name from Firestore
  const getUserName = async (userId: string): Promise<string> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.name || userData.displayName || "Guest";
      }
      return "Guest";
    } catch (error) {
      console.error("Error fetching user data:", error);
      return "Guest";
    }
  };

  // Handle confirm or cancel booking
  const handleBookingStatusChange = async (
    bookingId: string,
    newStatus: string
  ) => {
    if (!user) return;

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnapshot = await getDoc(bookingRef);

      if (!bookingSnapshot.exists()) {
        toast.error("Booking not found");
        return;
      }

      // Update booking status
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        ...(newStatus === "cancelled" && {
          cancellationReason: "Cancelled by hotel owner",
        }),
      });

      // Update hotel availability if needed
      if (newStatus === "cancelled") {
        const bookingData = bookingSnapshot.data();
        const hotelRef = doc(db, "hotels", bookingData.hotelId);
        await updateDoc(hotelRef, {
          "rooms.available": bookingData.rooms?.available + 1 || 0,
        });
      }

      toast.success(
        `Booking ${
          newStatus === "confirmed" ? "confirmed" : "cancelled"
        } successfully`
      );
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error(
        `Error ${
          newStatus === "confirmed" ? "confirming" : "cancelling"
        } booking:`,
        error
      );
      toast.error(
        `Failed to ${newStatus === "confirmed" ? "confirm" : "cancel"} booking`
      );
    }
  };

  // Filter bookings based on search term
  const filteredBookings = bookingsData[
    activeTab as keyof typeof bookingsData
  ].filter(
    (booking) =>
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending
          </Badge>
        );
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bookings Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all your property bookings
            </p>
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
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
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
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Property</label>
                <Select
                  value={selectedProperty}
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={paymentStatusFilter}
                  onValueChange={setPaymentStatusFilter}
                >
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading bookings...</span>
          </div>
        ) : (
          <Tabs
            defaultValue="upcoming"
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {bookingsData.upcoming.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="past">
                Past
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {bookingsData.past.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {bookingsData.cancelled.length}
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
                      <TableHead className="hidden md:table-cell">
                        Property
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Check-in/out
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Amount
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No bookings found. Try a different search term.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.guestName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.guestEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.property}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.roomType}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.checkIn}</div>
                              <div className="text-sm text-muted-foreground">
                                to {booking.checkOut}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.amount}</div>
                              <div>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
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
                                  <Link href={`/owner/bookings/${booking.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Modify Booking
                                </DropdownMenuItem>
                                {booking.status === "pending" && (
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() =>
                                      handleBookingStatusChange(
                                        booking.id,
                                        "confirmed"
                                      )
                                    }
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Confirm Booking
                                  </DropdownMenuItem>
                                )}
                                {booking.status !== "cancelled" && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleBookingStatusChange(
                                        booking.id,
                                        "cancelled"
                                      )
                                    }
                                  >
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
                      <TableHead className="hidden md:table-cell">
                        Property
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Check-in/out
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Amount
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No bookings found. Try a different search term.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.guestName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.guestEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.property}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.roomType}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.checkIn}</div>
                              <div className="text-sm text-muted-foreground">
                                to {booking.checkOut}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.amount}</div>
                              <div>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
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
                                  <Link href={`/owner/bookings/${booking.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Download Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Send Receipt
                                </DropdownMenuItem>
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
                      <TableHead className="hidden md:table-cell">
                        Property
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Check-in/out
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Amount
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No bookings found. Try a different search term.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.guestName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.guestEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.property}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.roomType}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.checkIn}</div>
                              <div className="text-sm text-muted-foreground">
                                to {booking.checkOut}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div>{booking.amount}</div>
                              <div>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
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
                                  <Link href={`/owner/bookings/${booking.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  View Cancellation Details
                                </DropdownMenuItem>
                                {booking.status === "cancelled" &&
                                  booking.checkIn >
                                    format(new Date(), "MMM dd, yyyy") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleBookingStatusChange(
                                          booking.id,
                                          "confirmed"
                                        )
                                      }
                                    >
                                      Restore Booking
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
          </Tabs>
        )}
      </div>
    </HotelOwnerLayout>
  );
}
