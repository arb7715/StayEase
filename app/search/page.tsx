"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { HotelCard } from "@/components/hotel-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, MapPin, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

// Common amenities for filter
const commonAmenities = [
  "Free WiFi",
  "Air Conditioning",
  "Room Service",
  "Spa Access",
  "Gym",
  "Swimming Pool",
  "Restaurant",
  "Bar",
  "Parking",
  "Pet Friendly",
  "Ocean View",
  "Mountain View",
  "Private Pool",
  "Minibar",
  "Flat-screen TV",
];

// Define the hotel type
type Hotel = {
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
  propertyType: string;
  status: string;
  rating?: number;
  reviews?: any[];
  ownerId: string;
};

export default function SearchPage() {
  // State for all hotels
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(2);
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [rating, setRating] = useState("any");
  const [propertyType, setPropertyType] = useState("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Date range for booking
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Sort state
  const [sortOption, setSortOption] = useState("recommended");

  // Results state
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch hotels from Firestore
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);

        // Query only active hotels
        const hotelsRef = collection(db, "hotels");
        const q = query(hotelsRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);

        const hotels: Hotel[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Hotel, "id">;

          // Calculate average rating if reviews exist
          let avgRating = 0;
          if (data.reviews && data.reviews.length > 0) {
            avgRating =
              data.reviews.reduce((sum, review) => sum + review.rating, 0) /
              data.reviews.length;
          }

          hotels.push({
            id: doc.id,
            ...data,
            rating: data.rating || avgRating || 0,
          });
        });

        setAllHotels(hotels);
        applyFilters(hotels);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        toast.error("Failed to load hotels. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Apply filters function
  const applyFilters = (hotelsToFilter = allHotels) => {
    let filtered = [...hotelsToFilter];
    const newActiveFilters: string[] = [];

    // Filter by location
    if (location.trim() !== "") {
      filtered = filtered.filter(
        (hotel) =>
          hotel.location.toLowerCase().includes(location.toLowerCase()) ||
          (hotel.address &&
            hotel.address.toLowerCase().includes(location.toLowerCase())) ||
          hotel.name.toLowerCase().includes(location.toLowerCase())
      );
      newActiveFilters.push(`Location: ${location}`);
    }

    // Filter by price range
    filtered = filtered.filter(
      (hotel) =>
        hotel.pricing?.basePrice >= priceRange[0] &&
        hotel.pricing?.basePrice <= priceRange[1]
    );
    newActiveFilters.push(`Price: $${priceRange[0]} - $${priceRange[1]}`);

    // Filter by rating
    if (rating !== "any") {
      const ratingValue = Number.parseInt(rating);
      filtered = filtered.filter(
        (hotel) => hotel.rating && hotel.rating >= ratingValue
      );
      newActiveFilters.push(`Rating: ${rating}+ stars`);
    }

    // Filter by property type
    if (propertyType !== "any") {
      filtered = filtered.filter(
        (hotel) => hotel.propertyType === propertyType
      );
      newActiveFilters.push(`Type: ${propertyType}`);
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((hotel) =>
        selectedAmenities.every((amenity) => hotel.amenities?.includes(amenity))
      );
      newActiveFilters.push(`Amenities: ${selectedAmenities.length} selected`);
    }

    // Filter by guest capacity
    if (guests > 1) {
      filtered = filtered.filter((hotel) => hotel.rooms?.maxGuests >= guests);
      newActiveFilters.push(`Guests: ${guests}`);
    }

    // Apply sorting
    const sorted = sortHotels(filtered, sortOption);

    setActiveFilters(newActiveFilters);
    setFilteredHotels(sorted);
  };

  // Sort hotels function
  const sortHotels = (hotels: Hotel[], option: string) => {
    const sorted = [...hotels];

    switch (option) {
      case "price-low":
        sorted.sort(
          (a, b) => (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0)
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) => (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0)
        );
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "recommended":
      default:
        // For recommended, we'll use a combination of rating and price
        sorted.sort(
          (a, b) =>
            (b.rating || 0) * 0.7 +
            (1000 - (b.pricing?.basePrice || 0)) * 0.3 -
            ((a.rating || 0) * 0.7 + (1000 - (a.pricing?.basePrice || 0)) * 0.3)
        );
        break;
    }

    return sorted;
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value);
    setFilteredHotels(sortHotels([...filteredHotels], value));
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setLocation("");
    setGuests(2);
    setPriceRange([50, 500]);
    setRating("any");
    setPropertyType("any");
    setSelectedAmenities([]);
    setActiveFilters([]);
    setDateRange({
      from: new Date(),
      to: addDays(new Date(), 7),
    });
    setFilteredHotels(sortHotels([...allHotels], sortOption));
  };

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Location:")) {
      setLocation("");
    } else if (filter.startsWith("Rating:")) {
      setRating("any");
    } else if (filter.startsWith("Type:")) {
      setPropertyType("any");
    } else if (filter.startsWith("Amenities:")) {
      setSelectedAmenities([]);
    } else if (filter.startsWith("Guests:")) {
      setGuests(2);
    }

    // Re-apply remaining filters
    applyFilters();
  };

  return (
    <div className="container py-8 px-8">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Main content when not loading */}
      {!isLoading && (
        <>
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {filter}
                    <button
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                      onClick={() => removeFilter(filter)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear all
                </Button>
              </div>
            </div>
          )}

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
                      <Input
                        id="location"
                        placeholder="Where are you going?"
                        className="pl-8"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dates</Label>
                    <DatePickerWithRange
                      className="w-full"
                      date={dateRange}
                      onDateChange={setDateRange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      placeholder="Number of guests"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Price Range</Label>
                      <span className="text-sm text-muted-foreground">
                        ${priceRange[0]} - ${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Star Rating</Label>
                    <Select value={rating} onValueChange={setRating}>
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
                    <Select
                      value={propertyType}
                      onValueChange={setPropertyType}
                    >
                      <SelectTrigger id="property-type">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="guesthouse">Guesthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {commonAmenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          <label
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => applyFilters()}>
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                  </div>
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
                <SheetContent
                  side="left"
                  className="w-[300px] sm:w-[400px] overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile-location"
                          placeholder="Where are you going?"
                          className="pl-8"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dates</Label>
                      <DatePickerWithRange
                        className="w-full"
                        date={dateRange}
                        onDateChange={setDateRange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile-guests">Guests</Label>
                      <Input
                        id="mobile-guests"
                        type="number"
                        placeholder="Number of guests"
                        min={1}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Price Range</Label>
                        <span className="text-sm text-muted-foreground">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile-rating">Star Rating</Label>
                      <Select value={rating} onValueChange={setRating}>
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
                      <Label htmlFor="mobile-property-type">
                        Property Type
                      </Label>
                      <Select
                        value={propertyType}
                        onValueChange={setPropertyType}
                      >
                        <SelectTrigger id="mobile-property-type">
                          <SelectValue placeholder="Any type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any type</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="guesthouse">Guesthouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amenities</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {commonAmenities.map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-amenity-${amenity}`}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <label
                              htmlFor={`mobile-amenity-${amenity}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          applyFilters();
                        }}
                      >
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Search Results */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Search Results
                  </h1>
                  <p className="text-muted-foreground">
                    Showing {filteredHotels.length}{" "}
                    {filteredHotels.length === 1 ? "hotel" : "hotels"}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={sortOption} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating">
                        Rating: High to Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    No hotels match your search criteria
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search for a different
                    location
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      id={hotel.id}
                      name={hotel.name}
                      location={hotel.location}
                      price={hotel.pricing?.basePrice || 0}
                      rating={hotel.rating || 0}
                      image={
                        hotel.images && hotel.images.length > 0
                          ? hotel.images[0]
                          : "/placeholder.svg?height=300&width=400"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
