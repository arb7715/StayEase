"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, MapPin, Search, Star, Trash } from "lucide-react"

// Mock data for wishlist
const wishlistItems = [
  {
    id: "1",
    name: "Luxury Ocean Resort",
    location: "Maldives",
    price: 299,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=400",
    availability: "Available",
  },
  {
    id: "2",
    name: "Mountain View Lodge",
    location: "Switzerland",
    price: 199,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=400",
    availability: "Available",
  },
  {
    id: "3",
    name: "Urban Boutique Hotel",
    location: "New York",
    price: 249,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=400",
    availability: "Limited",
  },
  {
    id: "4",
    name: "Beachfront Villa",
    location: "Bali",
    price: 179,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=400",
    availability: "Unavailable",
  },
  {
    id: "5",
    name: "Historic City Hotel",
    location: "Prague",
    price: 159,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=400",
    availability: "Available",
  },
]

export default function WishlistPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [wishlist, setWishlist] = useState(wishlistItems)

  // Filter wishlist based on search term
  const filteredWishlist = wishlist.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">Hotels and accommodations you've saved for later</p>
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
                <Link href={`/hotel/${item.id}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
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
                      item.availability === "Limited" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  >
                    {item.availability}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/hotel/${item.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                  </Link>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {item.rating}
                  </Badge>
                </div>
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{item.location}</span>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-lg">${item.price}</span>
                  <span className="text-muted-foreground text-sm"> / night</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/hotel/${item.id}`}>View Details</Link>
                </Button>
                <Button className="w-full" asChild disabled={item.availability === "Unavailable"}>
                  <Link href={`/hotel/${item.id}`}>
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
  )
}

