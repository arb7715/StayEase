"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Heart,
  MapPin,
  Search,
  Star,
  Trash,
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
  getDoc,
  doc,
  deleteDoc,
  writeBatch,
  DocumentData,
} from "firebase/firestore";

interface WishlistItem {
  id: string;
  hotelId: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  availability: "Available" | "Limited" | "Unavailable";
}

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to view your wishlist");
      router.push("/login");
      return;
    }

    fetchWishlist();
  }, [user, router]);

  // Fetch wishlist items from Firebase
  const fetchWishlist = async () => {
    try {
      setIsLoading(true);

      // Get all wishlist items for the current user
      const wishlistQuery = query(
        collection(db, "wishlist"),
        where("userId", "==", user?.uid)
      );

      const wishlistSnapshot = await getDocs(wishlistQuery);

      // If wishlist is empty
      if (wishlistSnapshot.empty) {
        setWishlist([]);
        setIsLoading(false);
        return;
      }

      // Process each wishlist item
      const wishlistPromises = wishlistSnapshot.docs.map(
        async (wishlistDoc) => {
          const wishlistData = wishlistDoc.data();
          const hotelId = wishlistData.hotelId;

          // Fetch the hotel details
          try {
            const hotelDoc = await getDoc(doc(db, "hotels", hotelId));

            if (!hotelDoc.exists()) {
              return null; // Hotel no longer exists
            }

            const hotelData = hotelDoc.data();

            // Calculate availability status
            let availabilityStatus: "Available" | "Limited" | "Unavailable" =
              "Available";

            // If hotel has rooms data, determine availability
            if (hotelData.rooms) {
              if (hotelData.rooms.available <= 0) {
                availabilityStatus = "Unavailable";
              } else if (hotelData.rooms.available < 3) {
                availabilityStatus = "Limited";
              }
            }

            // Construct the wishlist item
            return {
              id: wishlistDoc.id,
              hotelId: hotelId,
              name: hotelData.name || "Unnamed Hotel",
              location:
                hotelData.location?.city ||
                hotelData.location ||
                "Unknown Location",
              price: hotelData.pricing?.basePrice || hotelData.price || 0,
              rating: hotelData.rating?.value || hotelData.rating || 0,
              image:
                hotelData.images?.[0] ||
                "/placeholder.svg?height=300&width=400",
              availability: availabilityStatus,
            };
          } catch (error) {
            console.error(`Error fetching hotel ${hotelId} details:`, error);
            return null;
          }
        }
      );

      // Resolve all promises and filter out nulls
      const wishlistItems = (await Promise.all(wishlistPromises)).filter(
        (item): item is WishlistItem => item !== null
      );

      setWishlist(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load your wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      // Delete the wishlist entry from Firebase
      await deleteDoc(doc(db, "wishlist", wishlistItemId));

      // Update local state
      setWishlist(wishlist.filter((item) => item.id !== wishlistItemId));

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  // Filter wishlist based on search term
  const filteredWishlist = wishlist.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
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
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">
          Hotels and accommodations you've saved for later
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wishlist..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" asChild>
          <Link href="/search">
            <Heart className="mr-2 h-4 w-4" />
            Find More Hotels
          </Link>
        </Button>
      </div>

      {filteredWishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Your wishlist is empty</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "No hotels match your search. Try a different search term."
              : "Save hotels you like to your wishlist for easy access later."}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/search">Browse Hotels</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <Link href={`/hotel/${item.hotelId}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>
                {item.availability !== "Available" && (
                  <Badge
                    className={`absolute bottom-2 left-2 ${
                      item.availability === "Limited"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {item.availability}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/hotel/${item.hotelId}`}
                    className="hover:underline"
                  >
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {item.rating.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{item.location}</span>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-lg">${item.price}</span>
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    / night
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/hotel/${item.hotelId}`}>View Details</Link>
                </Button>
                <Button
                  className="w-full"
                  asChild
                  disabled={item.availability === "Unavailable"}
                >
                  <Link href={`/hotel/${item.hotelId}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
