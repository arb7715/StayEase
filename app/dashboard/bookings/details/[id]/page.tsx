"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

// Review modal components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingDetails {
  id: string;
  hotelId: string;
  userId: string;
  hotelName: string;
  location: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  rawCheckIn?: Date;
  rawCheckOut?: Date;
  guests: number;
  roomType: string;
  status: string;
  image: string;
  pricing: {
    perNight?: number;
    nights?: number;
    subtotal?: number;
    taxes?: number;
    total: number;
  };
  paymentMethod?: string;
  contactPhone?: string;
  cancellationPolicy?: string;
  hasReviewed?: boolean;
  isPast?: boolean;
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Cancel booking state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!user) {
      toast.error("Please sign in to view booking details");
      router.push("/login");
      return;
    }

    if (params.id) {
      fetchBookingDetails(params.id);
    }
  }, [params.id, user, router]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnapshot = await getDoc(bookingRef);

      if (!bookingSnapshot.exists()) {
        setError("Booking not found");
        return;
      }

      const bookingData = bookingSnapshot.data();

      // Verify this booking belongs to the current user
      if (bookingData.userId !== user?.uid) {
        setError("You don't have permission to view this booking");
        return;
      }

      // Format dates
      const checkInDate =
        bookingData.checkIn instanceof Timestamp
          ? bookingData.checkIn.toDate()
          : new Date(bookingData.checkIn);

      const checkOutDate =
        bookingData.checkOut instanceof Timestamp
          ? bookingData.checkOut.toDate()
          : new Date(bookingData.checkOut);

      // Calculate number of nights
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if user has already reviewed this booking
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("bookingId", "==", bookingId),
        where("userId", "==", user.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const hasReviewed = !reviewsSnapshot.empty;

      // Check if booking is in the past
      const isPast = new Date() > checkOutDate;

      // Get hotel details if not complete
      let hotelAddress = bookingData.hotelAddress || "";
      let contactPhone = bookingData.hotelPhone || "+1 (555) 123-4567";
      let cancellationPolicy =
        bookingData.cancellationPolicy ||
        "Free cancellation up to 24 hours before check-in";
      let hotelImage =
        bookingData.hotelImage || "/placeholder.svg?height=400&width=600";

      if (bookingData.hotelId) {
        try {
          const hotelDoc = await getDoc(doc(db, "hotels", bookingData.hotelId));
          if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            hotelAddress =
              hotelData.address ||
              `${hotelData.location?.city || ""}, ${
                hotelData.location?.country || ""
              }`;
            contactPhone = hotelData.contactPhone || contactPhone;
            hotelImage = hotelData.images?.[0] || hotelImage;
            cancellationPolicy =
              hotelData.policies?.cancellation || cancellationPolicy;
          }
        } catch (error) {
          console.error("Error fetching hotel details:", error);
        }
      }

      const formattedBooking: BookingDetails = {
        id: bookingId,
        hotelId: bookingData.hotelId || "",
        userId: bookingData.userId || user.uid,
        hotelName: bookingData.hotelName || "Hotel",
        location: bookingData.hotelLocation || "Location not specified",
        address: hotelAddress,
        checkIn: format(checkInDate, "MMM dd, yyyy"),
        checkOut: format(checkOutDate, "MMM dd, yyyy"),
        rawCheckIn: checkInDate,
        rawCheckOut: checkOutDate,
        guests: bookingData.guests || 1,
        roomType: bookingData.roomType || "Standard Room",
        status: bookingData.status || "pending",
        image: hotelImage,
        pricing: {
          perNight: bookingData.pricing?.basePrice || 0,
          nights: nights,
          subtotal: bookingData.pricing?.baseTotal || 0,
          taxes: bookingData.pricing?.serviceFee || 0,
          total: bookingData.pricing?.total || 0,
        },
        paymentMethod: bookingData.paymentMethod || "Credit Card",
        contactPhone: contactPhone,
        cancellationPolicy: cancellationPolicy,
        hasReviewed: hasReviewed,
        isPast: isPast,
      };

      setBooking(formattedBooking);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to load booking details");
      toast.error("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setIsCancelling(true);

      // Update booking status
      const bookingRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      // Update hotel room availability if possible
      if (booking.hotelId) {
        try {
          const hotelRef = doc(db, "hotels", booking.hotelId);
          const hotelDoc = await getDoc(hotelRef);

          if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            await updateDoc(hotelRef, {
              "rooms.available": (hotelData.rooms?.available || 0) + 1,
            });
          }
        } catch (error) {
          console.error("Error updating hotel availability:", error);
        }
      }

      toast.success("Booking cancelled successfully");
      setBooking({
        ...booking,
        status: "cancelled",
      });
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || !user) return;

    try {
      setIsSubmittingReview(true);

      // Add review to Firestore
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Guest",
        userEmail: user.email,
        hotelId: booking.hotelId,
        hotelName: booking.hotelName,
        bookingId: booking.id,
        rating: rating,
        comment: reviewComment,
        date: serverTimestamp(),
      });

      // Add entry to review collection in hotel if available
      if (booking.hotelId) {
        try {
          // Update the hotel's overall rating
          const hotelRef = doc(db, "hotels", booking.hotelId);
          const hotelDoc = await getDoc(hotelRef);

          if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            const currentRating = hotelData.rating?.value || 0;
            const reviewCount = hotelData.rating?.count || 0;
            const newRating =
              (currentRating * reviewCount + rating) / (reviewCount + 1);

            await updateDoc(hotelRef, {
              "rating.value": newRating,
              "rating.count": reviewCount + 1,
            });
          }
        } catch (error) {
          console.error("Error updating hotel rating:", error);
        }
      }

      toast.success("Review submitted successfully");
      setReviewDialogOpen(false);
      setBooking({
        ...booking,
        hasReviewed: true,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-medium">{error || "Booking not found"}</h2>
        <p className="text-muted-foreground">
          We couldn't find the booking details you're looking for.
        </p>
        <Button asChild>
          <Link href="/dashboard/bookings">Return to Bookings</Link>
        </Button>
      </div>
    );
  }

  const renderStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        );
    }
  };

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
                {renderStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="aspect-[4/3] rounded-md overflow-hidden">
                    <Image
                      src={
                        booking.image || "/placeholder.svg?height=400&width=600"
                      }
                      alt={booking.hotelName}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {booking.hotelName}
                    </h2>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.address || booking.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Check-in
                      </div>
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
                      <div className="text-sm text-muted-foreground">
                        Check-out
                      </div>
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
                      <div className="text-sm text-muted-foreground">
                        Room Type
                      </div>
                      <div className="font-medium">{booking.roomType}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Guests
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">
                          {booking.guests}{" "}
                          {booking.guests === 1 ? "Adult" : "Adults"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Cancellation Policy</h3>
                <p className="text-sm text-muted-foreground">
                  {booking.cancellationPolicy}
                </p>
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
                {booking.status === "pending" && (
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {booking.pricing.perNight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ${booking.pricing.perNight.toFixed(2)} x{" "}
                      {booking.pricing.nights} nights
                    </span>
                    <span>
                      ${booking.pricing.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & fees</span>
                  <span>${booking.pricing.taxes?.toFixed(2) || "0.00"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${booking.pricing.total.toFixed(2)}</span>
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
                <Link href={`/hotel/${booking.hotelId}`}>
                  <Star className="mr-2 h-4 w-4" />
                  View Hotel
                </Link>
              </Button>

              {booking.status === "confirmed" && !booking.isPast && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Reservation
                </Button>
              )}

              {booking.isPast &&
                booking.status !== "cancelled" &&
                !booking.hasReviewed && (
                  <Button
                    className="w-full"
                    onClick={() => setReviewDialogOpen(true)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Write a Review
                  </Button>
                )}

              {booking.isPast && booking.hasReviewed && (
                <Button
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Already Reviewed
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog Modal */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {booking.hotelName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                  ? "Very Good"
                  : rating === 3
                  ? "Good"
                  : rating === 2
                  ? "Fair"
                  : "Poor"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || !reviewComment.trim()}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Your Reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The booking will be cancelled and
              your room reservation will be released.
              {booking.cancellationPolicy && (
                <p className="mt-2 font-medium">
                  Cancellation Policy: {booking.cancellationPolicy}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep My Reservation
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Reservation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
