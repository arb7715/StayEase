"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/date-range-picker";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Coffee,
  Heart,
  Loader2,
  MapPin,
  Share,
  Star,
  Tv,
  Wifi,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DateRange } from "react-day-picker";
import { addDays, differenceInDays, format } from "date-fns";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Type definitions for hotel data
interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  images: string[];
  rooms: {
    total: number;
    available: number;
    maxGuests: number;
  };
  pricing: {
    basePrice: number;
    cleaningFee: number;
  };
  amenities: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    houseRules: string;
  };
  propertyType: string;
  status: string;
  rating?: number;
  reviews?: Review[];
  ownerId: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: any;
}

export default function HotelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [guests, setGuests] = useState(2);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Booking state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Review, 2: Payment, 3: Confirmation

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Share dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Calculate booking details
  const nights =
    dateRange && dateRange.from && dateRange.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 7;

  const baseTotal = hotel ? hotel.pricing.basePrice * nights : 0;
  const cleaningFee = hotel ? hotel.pricing.cleaningFee : 0;
  const serviceFee = Math.round(baseTotal * 0.12); // 12% service fee
  const totalPrice = baseTotal + cleaningFee + serviceFee;

  // Fetch hotel data
  useEffect(() => {
    async function fetchHotelData() {
      try {
        setIsLoading(true);
        const hotelDoc = await getDoc(doc(db, "hotels", params.id));

        if (hotelDoc.exists()) {
          const hotelData = { id: hotelDoc.id, ...hotelDoc.data() } as Hotel;
          setHotel(hotelData);

          // Check if the hotel is in user's wishlist
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIsWishlisted(userData.wishlist?.includes(params.id) || false);
            }
          }
        } else {
          toast.error("Hotel not found");
          router.push("/search");
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        toast.error("Failed to load hotel details");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchHotelData();
    }
  }, [params.id, user, router]);

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save to wishlist");
      router.push("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      if (isWishlisted) {
        // Remove from wishlist
        await updateDoc(userRef, {
          wishlist: arrayRemove(params.id),
        });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await updateDoc(userRef, {
          wishlist: arrayUnion(params.id),
        });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // Share hotel
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/hotel/${params.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    setIsShareDialogOpen(false);
  };

  // Start booking
  const handleBookNow = () => {
    if (!user) {
      toast.error("Please sign in to book");
      router.push(`/login?redirect=/hotel/${params.id}`);
      return;
    }

    // Validate booking inputs
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (guests < 1) {
      toast.error("Please select at least 1 guest");
      return;
    }

    if (hotel && guests > hotel.rooms.maxGuests) {
      toast.error(`Maximum ${hotel.rooms.maxGuests} guests allowed per room`);
      return;
    }

    // Open booking dialog
    setBookingStep(1);
    setIsBookingDialogOpen(true);
  };

  // Process payment
  const handleProcessPayment = async () => {
    // Validate payment details
    if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
      toast.error("Please fill in all payment details");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Invalid card number");
      return;
    }

    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error("Invalid expiry date (MM/YY)");
      return;
    }

    if (cardCvc.length !== 3) {
      toast.error("Invalid CVC");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // For demo purposes, we'll simulate a payment process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a booking record in Firestore
      if (user && hotel && dateRange?.from && dateRange?.to) {
        const bookingData = {
          hotelId: params.id,
          hotelName: hotel.name,
          hotelImage: hotel.images[0] || "",
          userId: user.uid,
          checkIn: dateRange.from,
          checkOut: dateRange.to,
          guests: guests,
          nightsCount: nights,
          pricing: {
            basePrice: hotel.pricing.basePrice,
            baseTotal: baseTotal,
            cleaningFee: cleaningFee,
            serviceFee: serviceFee,
            total: totalPrice,
          },
          status: "confirmed",
          paymentMethod: paymentMethod,
          createdAt: serverTimestamp(),
        };

        // Add booking to Firestore
        const bookingRef = await addDoc(
          collection(db, "bookings"),
          bookingData
        );

        // Update hotel room availability
        await updateDoc(doc(db, "hotels", params.id), {
          "rooms.available": increment(-1),
        });

        // Show success and move to confirmation
        setBookingStep(3);
      }
    } catch (error) {
      console.error("Error processing booking:", error);
      toast.error("Failed to process booking");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold">Hotel not found</h2>
        <p className="mt-2 text-muted-foreground">
          The hotel you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => router.push("/search")}>
          Return to Search
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6">
            {/* Hotel Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="ml-1 font-medium">
                      {hotel.rating?.toFixed(1) || "New"}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      ({hotel.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{hotel.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span className="sr-only">
                    {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  </span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={
                      hotel.images[0] || "/placeholder.svg?height=600&width=800"
                    }
                    alt={hotel.name}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              {hotel.images.slice(1, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={image || "/placeholder.svg?height=400&width=400"}
                    alt={`${hotel.name} - Image ${index + 2}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    About this {hotel.propertyType}
                  </h2>
                  <p className="text-muted-foreground">{hotel.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium text-lg">Check-in</h3>
                      <p className="text-muted-foreground">
                        From {hotel.policies?.checkIn || "2:00 PM"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium text-lg">Check-out</h3>
                      <p className="text-muted-foreground">
                        Until {hotel.policies?.checkOut || "11:00 AM"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-2">
                      Cancellation policy
                    </h3>
                    <p className="text-muted-foreground">
                      {hotel.policies?.cancellation === "flexible" &&
                        "Free cancellation up to 24 hours before check-in."}
                      {hotel.policies?.cancellation === "moderate" &&
                        "Free cancellation up to 5 days before check-in."}
                      {hotel.policies?.cancellation === "strict" &&
                        "Free cancellation up to 7 days before check-in."}
                      {hotel.policies?.cancellation === "non-refundable" &&
                        "This reservation is non-refundable."}
                      {!hotel.policies?.cancellation &&
                        "Free cancellation up to 24 hours before check-in."}
                    </p>
                  </div>

                  {hotel.policies?.houseRules && (
                    <div className="mt-6">
                      <h3 className="font-medium text-lg mb-2">House rules</h3>
                      <p className="text-muted-foreground">
                        {hotel.policies.houseRules}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities &&
                      hotel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {amenity.includes("WiFi") ? (
                            <Wifi className="h-5 w-5 text-primary" />
                          ) : amenity.includes("TV") ? (
                            <Tv className="h-5 w-5 text-primary" />
                          ) : amenity.includes("Coffee") ? (
                            <Coffee className="h-5 w-5 text-primary" />
                          ) : (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                          <span>{amenity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Guest Reviews</h2>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                      <span className="ml-1 font-medium text-lg">
                        {hotel.rating?.toFixed(1) || "New"}
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        ({hotel.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Reviews */}
                  {hotel.reviews && hotel.reviews.length > 0 ? (
                    hotel.reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="border-b pb-6 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{review.userName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {review.date
                                ? typeof review.date === "string"
                                  ? review.date
                                  : format(
                                      new Date(review.date.seconds * 1000),
                                      "MMMM yyyy"
                                    )
                                : "Recent"}
                            </p>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-current text-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}

                  {hotel.reviews && hotel.reviews.length > 5 && (
                    <Button variant="outline" className="w-full">
                      Load More Reviews
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                      ${hotel.pricing.basePrice}
                    </span>
                    <span className="text-muted-foreground">per night</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="ml-1 font-medium">
                      {hotel.rating?.toFixed(1) || "New"}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      ({hotel.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Dates</label>
                    <DatePickerWithRange
                      className="mt-1"
                      date={dateRange}
                      onDateChange={setDateRange}
                    />
                  </div>

                  <div>
                    <label htmlFor="guests" className="text-sm font-medium">
                      Guests
                    </label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={hotel.rooms.maxGuests}
                      value={guests}
                      onChange={(e) =>
                        setGuests(Number.parseInt(e.target.value) || 1)
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max {hotel.rooms.maxGuests} guests per room
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>
                      ${hotel.pricing.basePrice} x {nights} nights
                    </span>
                    <span>${baseTotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Cleaning fee</span>
                    <span>${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Service fee</span>
                    <span>${serviceFee}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleBookNow}
                  disabled={hotel.rooms.available < 1}
                >
                  {hotel.rooms.available < 1
                    ? "No Rooms Available"
                    : "Book Now"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged yet
                </p>

                {hotel.rooms.available <= 3 && hotel.rooms.available > 0 && (
                  <p className="text-xs text-center text-red-500 font-medium">
                    Only {hotel.rooms.available} room
                    {hotel.rooms.available > 1 ? "s" : ""} left!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {bookingStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Review your booking</DialogTitle>
                <DialogDescription>
                  Please check your booking details before proceeding to payment
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={hotel.images[0] || "/placeholder.svg"}
                          alt={hotel.name}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {hotel.location}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Check-in
                        </h4>
                        <p className="font-medium">
                          {dateRange?.from
                            ? format(dateRange.from, "EEE, MMM d, yyyy")
                            : "Not selected"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          From {hotel.policies?.checkIn || "2:00 PM"}
                        </p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Check-out
                        </h4>
                        <p className="font-medium">
                          {dateRange?.to
                            ? format(dateRange.to, "EEE, MMM d, yyyy")
                            : "Not selected"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Until {hotel.policies?.checkOut || "11:00 AM"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Guests
                      </h4>
                      <p className="font-medium">
                        {guests} guest{guests !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="p-4 border rounded-md space-y-2">
                      <h4 className="text-sm font-medium mb-2">
                        Price details
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ${hotel.pricing.basePrice} x {nights} nights
                        </span>
                        <span>${baseTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cleaning fee
                        </span>
                        <span>${cleaningFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Service fee
                        </span>
                        <span>${serviceFee}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setBookingStep(2)}>
                  Proceed to Payment
                </Button>
              </DialogFooter>
            </>
          )}

          {bookingStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle>Payment</DialogTitle>
                <DialogDescription>
                  Enter your payment details to complete your booking
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Total price</h4>
                    <span className="font-bold">${totalPrice}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Includes all fees and taxes
                  </p>
                </div>

                <div className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-md">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-md">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        maxLength={19}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-name">Name on Card</Label>
                      <Input
                        id="card-name"
                        placeholder="John Smith"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) =>
                            setCardCvc(e.target.value.replace(/\D/g, ""))
                          }
                          maxLength={3}
                          type="password"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LockKeyhole className="h-4 w-4" />
                      <span>Your payment information is secure</span>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="p-4 border rounded-md text-center">
                    <p>
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {bookingStep === 3 && (
            <>
              <div className="text-center p-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mt-1">
                    Your reservation has been successfully booked
                  </p>
                </div>

                <div className="p-4 border rounded-md text-left mt-6">
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={hotel.images[0] || "/placeholder.svg"}
                        alt={hotel.name}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hotel.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Check-in
                      </h4>
                      <p className="font-medium">
                        {dateRange?.from
                          ? format(dateRange.from, "EEE, MMM d, yyyy")
                          : "Not selected"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Check-out
                      </h4>
                      <p className="font-medium">
                        {dateRange?.to
                          ? format(dateRange.to, "EEE, MMM d, yyyy")
                          : "Not selected"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to your email address
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    router.push("/bookings");
                  }}
                  className="w-full"
                >
                  View My Bookings
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share this hotel</DialogTitle>
            <DialogDescription>
              Share this listing with friends and family
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-4 border rounded-md">
              <p className="mb-2 text-sm font-medium">Hotel link</p>
              <div className="flex">
                <Input
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/hotel/${params.id}`
                      : ""
                  }
                  className="rounded-r-none"
                />
                <Button className="rounded-l-none" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" className="w-12 h-12 rounded-full p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Share on Facebook</span>
              </Button>

              <Button variant="outline" className="w-12 h-12 rounded-full p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Share on Twitter</span>
              </Button>

              <Button variant="outline" className="w-12 h-12 rounded-full p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span className="sr-only">Share via Email</span>
              </Button>

              <Button variant="outline" className="w-12 h-12 rounded-full p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-link"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span className="sr-only">Copy Link</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
