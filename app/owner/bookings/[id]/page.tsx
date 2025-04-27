"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDocs,
  increment,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";

interface BookingHistory {
  date: string | Timestamp;
  time?: string;
  action: string;
  user: string;
}

interface Booking {
  id: string;
  userId: string;
  guestName?: string;
  userEmail?: string;
  guestPhone?: string;
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  roomType?: string;
  checkIn: string | Timestamp;
  checkOut: string | Timestamp;
  guests: number;
  pricing?: {
    basePrice: number;
    baseTotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  };
  amount?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  specialRequests?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  cancellationReason?: string;
  notes?: string;
  history?: BookingHistory[];
}

interface Hotel {
  id: string;
  name: string;
  images: string[];
  policies?: {
    checkIn: string;
    checkOut: string;
  };
  rooms: {
    available: number;
  };
}

export default function BookingDetailsPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Check authentication
    if (!user) {
      toast.error("You must be logged in to view booking details");
      router.push("/login");
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        const bookingRef = doc(db, "bookings", params.id);
        const bookingSnapshot = await getDoc(bookingRef);

        if (!bookingSnapshot.exists()) {
          toast.error("Booking not found");
          router.push("/owner/bookings");
          return;
        }

        const bookingData = bookingSnapshot.data();

        // Check if the current user is the hotel owner
        const hotelRef = doc(db, "hotels", bookingData.hotelId);
        const hotelSnapshot = await getDoc(hotelRef);

        if (
          !hotelSnapshot.exists() ||
          hotelSnapshot.data().ownerId !== user.uid
        ) {
          toast.error("You don't have permission to view this booking");
          router.push("/owner/bookings");
          return;
        }

        setIsOwner(true);
        setHotel(hotelSnapshot.data() as Hotel);

        // Fetch guest info
        if (bookingData.userId) {
          const userRef = doc(db, "users", bookingData.userId);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setGuestInfo({
              name: userData.name || userData.displayName || "Guest",
              email:
                userData.email || bookingData.userEmail || "No email provided",
              phone:
                userData.phone || bookingData.guestPhone || "No phone provided",
            });
          }
        }

        // Format booking data for display
        const formattedBooking: Booking = {
          id: bookingSnapshot.id,
          ...bookingData,
          guestName: guestInfo.name,
          userEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
        };

        // Fetch booking history
        const historyQuery = query(
          collection(db, "bookingHistory"),
          where("bookingId", "==", params.id),
          orderBy("timestamp", "desc")
        );
        const historySnapshot = await getDocs(historyQuery);
        const history: BookingHistory[] = [];

        historySnapshot.forEach((doc) => {
          const histData = doc.data();
          history.push({
            date: histData.timestamp,
            action: histData.action,
            user: histData.user,
          });
        });

        // If no history entries, create a default one for booking creation
        if (history.length === 0 && bookingData.createdAt) {
          history.push({
            date: bookingData.createdAt,
            action: "Booking created",
            user: guestInfo.name || "Guest",
          });
        }

        formattedBooking.history = history;
        setBooking(formattedBooking);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id, user, router]);

  // Handle confirmation of booking
  const handleConfirmBooking = async () => {
    if (!booking) return;

    try {
      setIsProcessing(true);
      const bookingRef = doc(db, "bookings", booking.id);

      // Update booking status
      await updateDoc(bookingRef, {
        status: "confirmed",
        updatedAt: serverTimestamp(),
      });

      // Add to booking history
      await addDoc(collection(db, "bookingHistory"), {
        bookingId: booking.id,
        action: "Booking confirmed",
        user: `${user?.displayName || "Admin"} (Owner)`,
        timestamp: serverTimestamp(),
      });

      // Send confirmation email (in a real app)
      // await sendConfirmationEmail(booking.userEmail, booking.id);

      toast.success("Booking confirmed successfully");

      // Update local state
      setBooking({
        ...booking,
        status: "confirmed",
        updatedAt: Timestamp.now(),
      });

      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancellation of booking
  const handleCancelBooking = async () => {
    if (!booking || !hotel) return;

    try {
      setIsProcessing(true);
      const bookingRef = doc(db, "bookings", booking.id);

      // Update booking status
      await updateDoc(bookingRef, {
        status: "cancelled",
        cancellationReason: "Cancelled by hotel owner",
        updatedAt: serverTimestamp(),
      });

      // Increase available rooms count in the hotel
      const hotelRef = doc(db, "hotels", booking.hotelId);
      await updateDoc(hotelRef, {
        "rooms.available": increment(1),
      });

      // Add to booking history
      await addDoc(collection(db, "bookingHistory"), {
        bookingId: booking.id,
        action: "Booking cancelled",
        user: `${user?.displayName || "Admin"} (Owner)`,
        timestamp: serverTimestamp(),
      });

      toast.success("Booking cancelled successfully");

      // Update local state
      setBooking({
        ...booking,
        status: "cancelled",
        updatedAt: Timestamp.now(),
        cancellationReason: "Cancelled by hotel owner",
      });

      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle saving a note
  const handleSaveNote = async () => {
    if (!booking || !note.trim()) return;

    try {
      setIsSavingNote(true);
      const bookingRef = doc(db, "bookings", booking.id);

      // Update booking notes
      await updateDoc(bookingRef, {
        notes: booking.notes ? `${booking.notes}\n\n${note}` : note,
        updatedAt: serverTimestamp(),
      });

      // Add to booking history
      await addDoc(collection(db, "bookingHistory"), {
        bookingId: booking.id,
        action: "Note added",
        user: `${user?.displayName || "Admin"} (Owner)`,
        timestamp: serverTimestamp(),
      });

      toast.success("Note added successfully");

      // Update local state
      setBooking({
        ...booking,
        notes: booking.notes ? `${booking.notes}\n\n${note}` : note,
        updatedAt: Timestamp.now(),
      });

      setNote("");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle sending email
  const handleSendEmail = async () => {
    if (!booking || !emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in all email fields");
      return;
    }

    try {
      setIsSendingEmail(true);

      // In a real application, you would integrate with an email service here
      // For demo purposes, we'll just track that an email was sent

      // Add to booking history
      await addDoc(collection(db, "bookingHistory"), {
        bookingId: booking.id,
        action: `Email sent: ${emailSubject}`,
        user: `${user?.displayName || "Admin"} (Owner)`,
        timestamp: serverTimestamp(),
      });

      toast.success("Email sent successfully");
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailBody("");

      // Refresh booking history
      const historyQuery = query(
        collection(db, "bookingHistory"),
        where("bookingId", "==", params.id),
        orderBy("timestamp", "desc")
      );
      const historySnapshot = await getDocs(historyQuery);
      const history: BookingHistory[] = [];

      historySnapshot.forEach((doc) => {
        const histData = doc.data();
        history.push({
          date: histData.timestamp,
          action: histData.action,
          user: histData.user,
        });
      });

      setBooking({
        ...booking,
        history,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <HotelOwnerLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </HotelOwnerLayout>
    );
  }

  if (!booking || !isOwner) {
    return (
      <HotelOwnerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Booking Not Available</h2>
          <p className="text-muted-foreground">
            The booking you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button asChild>
            <Link href="/owner/bookings">Return to Bookings</Link>
          </Button>
        </div>
      </HotelOwnerLayout>
    );
  }

  // Format dates for display
  const formatBookingDate = (date: string | Timestamp) => {
    if (typeof date === "string") {
      return date;
    }
    if (date instanceof Timestamp) {
      return format(date.toDate(), "MMM dd, yyyy");
    }
    return "Not set";
  };

  // Format history date and time
  const formatHistoryDateTime = (date: string | Timestamp) => {
    if (typeof date === "string") {
      return { date, time: "" };
    }
    if (date instanceof Timestamp) {
      const dateObj = date.toDate();
      return {
        date: format(dateObj, "MMM dd, yyyy"),
        time: format(dateObj, "HH:mm"),
      };
    }
    return { date: "Unknown", time: "" };
  };

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
              <h1 className="text-3xl font-bold tracking-tight">
                Booking Details
              </h1>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmailSubject(
                  `Your booking #${booking.id} at ${booking.hotelName}`
                );
                setEmailBody(
                  `Dear ${
                    booking.guestName
                  },\n\nThank you for your booking at ${
                    booking.hotelName
                  }.\n\nYour booking details:\nCheck-in: ${formatBookingDate(
                    booking.checkIn
                  )}\nCheck-out: ${formatBookingDate(
                    booking.checkOut
                  )}\nGuests: ${
                    booking.guests
                  }\n\nWe're looking forward to welcoming you.\n\nBest regards,\n${
                    user?.displayName || "The Management Team"
                  }`
                );
                setEmailDialogOpen(true);
              }}
            >
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
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  Booked on {formatBookingDate(booking.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {booking.hotelImage && (
                        <div className="h-16 w-16 rounded overflow-hidden">
                          <Image
                            src={booking.hotelImage}
                            alt={booking.hotelName}
                            width={64}
                            height={64}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Property
                        </h3>
                        <p className="text-base font-medium">
                          {booking.hotelName}
                        </p>
                        <p className="text-sm">
                          {booking.roomType || "Standard Room"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Check-in
                        </h3>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{formatBookingDate(booking.checkIn)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          After {hotel?.policies?.checkIn || "2:00 PM"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Check-out
                        </h3>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{formatBookingDate(booking.checkOut)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Before {hotel?.policies?.checkOut || "11:00 AM"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Guests
                      </h3>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {booking.guests}{" "}
                          {booking.guests === 1 ? "Guest" : "Guests"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Guest Information
                      </h3>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{booking.userEmail}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {booking.guestPhone || "No phone provided"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Special Requests
                      </h3>
                      <p className="text-sm mt-1">
                        {booking.specialRequests || "None"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Internal Notes
                      </h3>
                      <p className="text-sm mt-1">
                        {booking.notes || "No notes added"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Payment Information
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-primary" />
                      <span>{booking.paymentMethod || "Credit Card"}</span>
                    </div>
                    <Badge
                      className={`${
                        booking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : booking.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      } hover:bg-opacity-80`}
                    >
                      {booking.paymentStatus
                        ? booking.paymentStatus.charAt(0).toUpperCase() +
                          booking.paymentStatus.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room charge</span>
                      <span>
                        ${booking.pricing?.baseTotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Cleaning fee
                      </span>
                      <span>
                        ${booking.pricing?.cleaningFee?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>
                        ${booking.pricing?.serviceFee?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        $
                        {booking.pricing?.total?.toFixed(2) ||
                          booking.amount ||
                          "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {booking.status === "pending" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                )}
                {booking.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  Timeline of actions and changes to this booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.history && booking.history.length > 0 ? (
                    booking.history.map((item, index) => {
                      const datetime = formatHistoryDateTime(item.date);
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="relative mt-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                              {item.action.includes("created") ? (
                                <User className="h-4 w-4" />
                              ) : item.action.includes("Payment") ||
                                item.action.includes("paid") ? (
                                <CreditCard className="h-4 w-4" />
                              ) : item.action.includes("confirmed") ? (
                                <Check className="h-4 w-4" />
                              ) : item.action.includes("Email") ||
                                item.action.includes("email") ? (
                                <Mail className="h-4 w-4" />
                              ) : item.action.includes("cancelled") ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            {index < (booking.history?.length || 0) - 1 && (
                              <div className="absolute left-4 top-8 h-full w-px -translate-x-1/2 bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{item.action}</p>
                              <time className="text-sm text-muted-foreground">
                                {datetime.date}{" "}
                                {datetime.time && `at ${datetime.time}`}
                              </time>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              By: {item.user}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No history available
                    </div>
                  )}
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
                <Button
                  className="w-full"
                  disabled={booking.status === "cancelled"}
                >
                  Modify Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSubject(`Message from ${booking.hotelName}`);
                    setEmailBody(`Dear ${booking.guestName},\n\n`);
                    setEmailDialogOpen(true);
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Guest
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSubject(
                      `Booking Confirmation - ${booking.hotelName}`
                    );
                    setEmailBody(
                      `Dear ${
                        booking.guestName
                      },\n\nThank you for your booking at ${
                        booking.hotelName
                      }.\n\nYour booking details:\nCheck-in: ${formatBookingDate(
                        booking.checkIn
                      )}\nCheck-out: ${formatBookingDate(
                        booking.checkOut
                      )}\nGuests: ${
                        booking.guests
                      }\n\nWe're looking forward to welcoming you!\n\nBest regards,\n${
                        user?.displayName || "The Management Team"
                      }`
                    );
                    setEmailDialogOpen(true);
                  }}
                >
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
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] w-full"
                  placeholder="Add internal notes about this booking..."
                  disabled={isSavingNote}
                />
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleSaveNote}
                  disabled={!note.trim() || isSavingNote}
                >
                  {isSavingNote ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Booking Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this booking? This will notify
              the guest that their reservation is confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBooking}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This will free up
              the room and notify the guest. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              No, Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Email Guest</DialogTitle>
            <DialogDescription>
              Send an email to {booking.guestName} regarding their booking
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="min-h-[200px]"
                placeholder="Type your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={
                isSendingEmail || !emailSubject.trim() || !emailBody.trim()
              }
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HotelOwnerLayout>
  );
}
