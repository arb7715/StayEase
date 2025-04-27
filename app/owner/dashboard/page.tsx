"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import {
  BarChart,
  Building,
  Calendar,
  DollarSign,
  Hotel,
  Star,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  getDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

// Interface for revenue data by month
interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// Interface for property data
interface Property {
  id: string;
  name: string;
  bookingsCount: number;
  revenue: number;
  trend: string;
}

// Interface for bookings
interface Booking {
  id: string;
  propertyName: string;
  guestName: string;
  dates: string;
  amount: string;
}

// Interface for reviews
interface Review {
  id: string;
  propertyName: string;
  guestName: string;
  rating: number;
  comment: string;
  date: Timestamp;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeListings: 0,
    bookingsLastMonth: 0,
    bookingsGrowth: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyRevenue: 0,
    monthlyRevenueGrowth: 0,
  });

  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [topProperties, setTopProperties] = useState<Property[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<
    MonthlyRevenue[]
  >([]);

  useEffect(() => {
    // Check authentication
    if (!user) {
      router.push("/login");
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get all properties owned by the current user
      const propertiesQuery = query(
        collection(db, "hotels"),
        where("ownerId", "==", user?.uid)
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesCount = propertiesSnapshot.size;

      // Store property IDs and names for later use
      const propertyData: Record<string, { id: string; name: string }> = {};
      propertiesSnapshot.forEach((doc) => {
        const data = doc.data();
        propertyData[doc.id] = { id: doc.id, name: data.name };
      });

      const propertyIds = Object.keys(propertyData);

      // If no properties, set default values
      if (propertyIds.length === 0) {
        setIsLoading(false);
        setDashboardData({
          totalListings: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeListings: 0,
          bookingsLastMonth: 0,
          bookingsGrowth: 0,
          averageRating: 0,
          totalReviews: 0,
          monthlyRevenue: 0,
          monthlyRevenueGrowth: 0,
        });
        return;
      }

      // Count active properties
      let activePropertiesCount = 0;
      propertiesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active") {
          activePropertiesCount++;
        }
      });

      // Get all bookings for these properties
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("hotelId", "in", propertyIds)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const totalBookings = bookingsSnapshot.size;

      // Calculate total revenue
      let totalRevenue = 0;
      const propertyBookingCounts: Record<string, number> = {};
      const propertyRevenue: Record<string, number> = {};

      bookingsSnapshot.forEach((doc) => {
        const bookingData = doc.data();
        const amount = bookingData.pricing?.total || 0;
        totalRevenue += amount;

        // Count bookings per property
        const propertyId = bookingData.hotelId;
        if (propertyId) {
          propertyBookingCounts[propertyId] =
            (propertyBookingCounts[propertyId] || 0) + 1;
          propertyRevenue[propertyId] =
            (propertyRevenue[propertyId] || 0) + amount;
        }
      });

      // Calculate last month's bookings and growth
      const now = new Date();
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const twoMonthsAgoStart = startOfMonth(subMonths(now, 2));
      const twoMonthsAgoEnd = endOfMonth(subMonths(now, 2));

      let lastMonthBookings = 0;
      let twoMonthsAgoBookings = 0;
      let currentMonthRevenue = 0;
      let lastMonthRevenue = 0;

      // Build monthly revenue data for the chart (last 6 months)
      const revenueByMonth: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const month = format(subMonths(now, i), "MMM yyyy");
        revenueByMonth[month] = 0;
      }

      // Process all bookings to calculate metrics
      bookingsSnapshot.forEach((doc) => {
        const bookingData = doc.data();
        const checkInDate = bookingData.checkIn
          ? bookingData.checkIn instanceof Timestamp
            ? bookingData.checkIn.toDate()
            : new Date(bookingData.checkIn)
          : null;

        const amount = bookingData.pricing?.total || 0;

        if (checkInDate) {
          // Last month bookings
          if (checkInDate >= lastMonthStart && checkInDate <= lastMonthEnd) {
            lastMonthBookings++;
            lastMonthRevenue += amount;
          }

          // Two months ago bookings
          if (
            checkInDate >= twoMonthsAgoStart &&
            checkInDate <= twoMonthsAgoEnd
          ) {
            twoMonthsAgoBookings++;
          }

          // Current month revenue
          if (
            checkInDate.getMonth() === now.getMonth() &&
            checkInDate.getFullYear() === now.getFullYear()
          ) {
            currentMonthRevenue += amount;
          }

          // Revenue by month for chart
          const bookingMonth = format(checkInDate, "MMM yyyy");
          if (revenueByMonth.hasOwnProperty(bookingMonth)) {
            revenueByMonth[bookingMonth] += amount;
          }
        }
      });

      // Calculate growth percentages
      const bookingsGrowth =
        twoMonthsAgoBookings > 0
          ? Math.round(
              ((lastMonthBookings - twoMonthsAgoBookings) /
                twoMonthsAgoBookings) *
                100
            )
          : 0;

      const revenueGrowth =
        lastMonthRevenue > 0
          ? Math.round(
              ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
                100
            )
          : 0;

      // Format monthly revenue data for chart
      const monthlyRevenueArray = Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .reverse(); // Most recent month last

      setMonthlyRevenueData(monthlyRevenueArray);

      // Get reviews data
      let totalRating = 0;
      let reviewsCount = 0;
      const recentReviewsArray: Review[] = [];

      // For each property, get reviews
      for (const propertyId of propertyIds) {
        try {
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("hotelId", "==", propertyId),
            orderBy("date", "desc"),
            limit(5)
          );

          const reviewsSnapshot = await getDocs(reviewsQuery);

          reviewsSnapshot.forEach((reviewDoc) => {
            const reviewData = reviewDoc.data();
            const rating = reviewData.rating || 0;

            totalRating += rating;
            reviewsCount++;

            if (recentReviewsArray.length < 3) {
              recentReviewsArray.push({
                id: reviewDoc.id,
                propertyName:
                  propertyData[propertyId]?.name || "Unknown Property",
                guestName: reviewData.userName || "Anonymous",
                rating: rating,
                comment: reviewData.comment || "",
                date: reviewData.date || Timestamp.now(),
              });
            }
          });
        } catch (error) {
          console.error(
            `Error fetching reviews for property ${propertyId}:`,
            error
          );
        }
      }

      // Calculate average rating
      const averageRating =
        reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : "0.0";

      // Get recent bookings (limit to 3)
      const recentBookingsQuery = query(
        collection(db, "bookings"),
        where("hotelId", "in", propertyIds),
        orderBy("createdAt", "desc"),
        limit(3)
      );

      const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
      const recentBookingsArray: Booking[] = [];

      for (const bookingDoc of recentBookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const propertyId = bookingData.hotelId;

        // Get guest name from user document
        let guestName = "Guest";
        if (bookingData.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", bookingData.userId));
            if (userDoc.exists()) {
              guestName =
                userDoc.data().name || userDoc.data().displayName || "Guest";
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        const checkIn =
          bookingData.checkIn instanceof Timestamp
            ? format(bookingData.checkIn.toDate(), "MMM dd")
            : "---";

        const checkOut =
          bookingData.checkOut instanceof Timestamp
            ? format(bookingData.checkOut.toDate(), "MMM dd, yyyy")
            : "---";

        recentBookingsArray.push({
          id: bookingDoc.id,
          propertyName: propertyData[propertyId]?.name || "Unknown Property",
          guestName: guestName,
          dates: `${checkIn} - ${checkOut}`,
          amount: `$${(bookingData.pricing?.total || 0).toFixed(2)}`,
        });
      }

      setRecentBookings(recentBookingsArray);

      // Calculate top performing properties
      const topPropertiesArray = Object.keys(propertyRevenue)
        .map((propertyId) => {
          // Calculate trend (this would need historical data in a real app)
          // Using random growth for demo purposes
          const growth = Math.floor(Math.random() * 20) + 1;

          return {
            id: propertyId,
            name: propertyData[propertyId]?.name || "Unknown Property",
            bookingsCount: propertyBookingCounts[propertyId] || 0,
            revenue: propertyRevenue[propertyId] || 0,
            trend: `+${growth}%`,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      setTopProperties(topPropertiesArray);
      setRecentReviews(recentReviewsArray);

      // Update dashboard data
      setDashboardData({
        totalListings: propertiesCount,
        totalBookings: totalBookings,
        totalRevenue: totalRevenue,
        activeListings: activePropertiesCount,
        bookingsLastMonth: lastMonthBookings,
        bookingsGrowth: bookingsGrowth,
        averageRating: parseFloat(averageRating),
        totalReviews: reviewsCount,
        monthlyRevenue: currentMonthRevenue,
        monthlyRevenueGrowth: revenueGrowth,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate simple chart markup
  const generateBarChart = () => {
    const maxRevenue = Math.max(
      ...monthlyRevenueData.map((item) => item.revenue)
    );

    return (
      <div className="h-[300px] flex items-end justify-between gap-2 pt-8 px-4">
        {monthlyRevenueData.map((item, index) => {
          const height =
            maxRevenue > 0
              ? Math.max(20, (item.revenue / maxRevenue) * 250)
              : 20;

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-14 bg-primary rounded-t-md hover:opacity-80 transition-opacity"
                style={{ height: `${height}px` }}
              />
              <div className="text-xs mt-2">{item.month}</div>
              <div className="text-xs font-medium">
                ${item.revenue.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    );
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

  return (
    <HotelOwnerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hotel Owner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your properties and bookings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalListings}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.activeListings} active properties
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.bookingsGrowth > 0 ? "+" : ""}
                {dashboardData.bookingsGrowth}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.averageRating}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {dashboardData.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${dashboardData.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.monthlyRevenueGrowth > 0 ? "+" : ""}
                {dashboardData.monthlyRevenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {monthlyRevenueData.length > 0 ? (
                generateBarChart()
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground/50" />
                  <span className="ml-2 text-muted-foreground">
                    No revenue data available
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your most recent bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{booking.propertyName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          {booking.guestName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.dates}
                        </div>
                      </div>
                      <div className="font-medium">{booking.amount}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent bookings
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/owner/bookings">View All Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>
                Based on booking frequency and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProperties.length > 0 ? (
                  topProperties.map((property, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{property.name}</p>
                        <div className="text-xs text-muted-foreground">
                          {property.bookingsCount} bookings
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${property.revenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600 flex items-center justify-end">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {property.trend}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No property data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest feedback from your guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.length > 0 ? (
                  recentReviews.map((review, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{review.propertyName}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-current text-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {review.guestName}
                      </p>
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button asChild>
                  <Link href="/owner/listings/new">
                    <Hotel className="mr-2 h-4 w-4" />
                    Add New Property
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/listings">
                    <Building className="mr-2 h-4 w-4" />
                    Manage Properties
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/bookings">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Bookings
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/analytics">
                    <BarChart className="mr-2 h-4 w-4" />
                    Detailed Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/owner/support">
                    <Users className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HotelOwnerLayout>
  );
}
