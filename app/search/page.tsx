"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { HotelCard } from "@/components/hotel-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, SlidersHorizontal } from "lucide-react"

// Mock data for hotels
const hotels = [
  {
    id: "1",
    name: "Luxury Ocean Resort",
    location: "Maldives",
    price: 299,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "2",
    name: "Mountain View Lodge",
    location: "Switzerland",
    price: 199,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "3",
    name: "Urban Boutique Hotel",
    location: "New York",
    price: 249,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "4",
    name: "Beachfront Villa",
    location: "Bali",
    price: 179,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "5",
    name: "Historic City Hotel",
    location: "Prague",
    price: 159,
    rating: 4.5,
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "6",
    name: "Desert Oasis Resort",
    location: "Dubai",
    price: 289,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=400",
  },
]

export default function SearchPage() {
  const [priceRange, setPriceRange] = useState([50, 500])
  const [filteredHotels, setFilteredHotels] = useState(hotels)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="location" placeholder="Where are you going?" className="pl-8" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dates</Label>
                <DatePickerWithRange />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Guests</Label>
                <Input id="guests" type="number" placeholder="Number of guests" min={1} defaultValue={2} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider defaultValue={priceRange} min={0} max={1000} step={10} onValueChange={setPriceRange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Star Rating</Label>
                <Select defaultValue="any">
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-type">Property Type</Label>
                <Select defaultValue="any">
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your search results</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="mobile-location" placeholder="Where are you going?" className="pl-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dates</Label>
                  <DatePickerWithRange />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-guests">Guests</Label>
                  <Input id="mobile-guests" type="number" placeholder="Number of guests" min={1} defaultValue={2} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ${priceRange[0]} - ${priceRange[1]}
                    </span>
                  </div>
                  <Slider defaultValue={priceRange} min={0} max={1000} step={10} onValueChange={setPriceRange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-rating">Star Rating</Label>
                  <Select defaultValue="any">
                    <SelectTrigger id="mobile-rating">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any rating</SelectItem>
                      <SelectItem value="5">5 stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-property-type">Property Type</Label>
                  <Select defaultValue="any">
                    <SelectTrigger id="mobile-property-type">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any type</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
              <p className="text-muted-foreground">Showing {filteredHotels.length} hotels</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select defaultValue="recommended">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                id={hotel.id}
                name={hotel.name}
                location={hotel.location}
                price={hotel.price}
                rating={hotel.rating}
                image={hotel.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

