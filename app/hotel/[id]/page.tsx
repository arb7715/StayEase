"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Check, Coffee, Heart, MapPin, Share, Star, Tv, Wifi } from "lucide-react"

// Mock hotel data
const hotel = {
  id: "1",
  name: "Luxury Ocean Resort",
  location: "Maldives",
  description:
    "Experience luxury like never before at our exclusive ocean resort. Nestled on a private island in the Maldives, our resort offers breathtaking views, world-class amenities, and unparalleled service. Each villa is designed to provide maximum comfort and privacy, with direct access to the crystal-clear waters of the Indian Ocean.",
  price: 299,
  rating: 4.9,
  reviews: 124,
  images: [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
  ],
  amenities: [
    "Free WiFi",
    "Ocean View",
    "Private Pool",
    "Spa Access",
    "Room Service",
    "Air Conditioning",
    "Minibar",
    "Flat-screen TV",
  ],
}

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [guests, setGuests] = useState(2)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleBookNow = () => {
    router.push(`/booking/confirm?hotelId=${params.id}`)
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6">
            {/* Hotel Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="ml-1 font-medium">{hotel.rating}</span>
                    <span className="ml-1 text-muted-foreground">({hotel.reviews} reviews)</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{hotel.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsWishlisted(!isWishlisted)}>
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Button variant="outline" size="icon">
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
                    src={hotel.images[0] || "/placeholder.svg"}
                    alt={hotel.name}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              {hotel.images.slice(1, 4).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={image || "/placeholder.svg"}
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
                  <h2 className="text-2xl font-semibold">About this hotel</h2>
                  <p className="text-muted-foreground">{hotel.description}</p>
                  <p className="text-muted-foreground">
                    Our resort features multiple restaurants serving international cuisine, a spa offering rejuvenating
                    treatments, and a variety of water sports and activities. Whether you're looking for a romantic
                    getaway, a family vacation, or a solo adventure, our attentive staff will ensure your stay is
                    nothing short of extraordinary.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="amenities" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity, index) => (
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
                      <span className="ml-1 font-medium text-lg">{hotel.rating}</span>
                      <span className="ml-1 text-muted-foreground">({hotel.reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Sample reviews */}
                  {[
                    {
                      name: "Sarah Johnson",
                      date: "March 2023",
                      rating: 5,
                      comment:
                        "Absolutely stunning resort with impeccable service. The overwater villa was a dream come true. We'll definitely be back!",
                    },
                    {
                      name: "Michael Chen",
                      date: "February 2023",
                      rating: 5,
                      comment:
                        "One of the best hotel experiences I've ever had. The staff went above and beyond to make our stay special. The private pool and ocean access were highlights.",
                    },
                    {
                      name: "Emma Rodriguez",
                      date: "January 2023",
                      rating: 4,
                      comment:
                        "Beautiful property with amazing views. The food was excellent, though a bit pricey. Would recommend for a special occasion.",
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-current text-yellow-500" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    Load More Reviews
                  </Button>
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
                    <span className="text-2xl font-bold">${hotel.price}</span>
                    <span className="text-muted-foreground">per night</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="ml-1 font-medium">{hotel.rating}</span>
                    <span className="ml-1 text-muted-foreground">({hotel.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Dates</label>
                    <DatePickerWithRange className="mt-1" />
                  </div>

                  <div>
                    <label htmlFor="guests" className="text-sm font-medium">
                      Guests
                    </label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>${hotel.price} x 7 nights</span>
                    <span>${hotel.price * 7}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Cleaning fee</span>
                    <span>$50</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Service fee</span>
                    <span>$75</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${hotel.price * 7 + 50 + 75}</span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleBookNow}>
                  Book Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">You won't be charged yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

