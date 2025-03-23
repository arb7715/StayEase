"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { ImagePlus, Loader2, Save, X } from "lucide-react"

const amenities = [
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
]

export default function AddHotelPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>(["/placeholder.svg?height=200&width=300"])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/owner/listings")
    }, 1500)
  }

  const addImagePlaceholder = () => {
    setImages([...images, "/placeholder.svg?height=200&width=300"])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-muted-foreground">Create a new hotel listing to attract guests</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hotel Name</Label>
                    <Input id="name" placeholder="Enter hotel name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property-type">Property Type</Label>
                    <Select defaultValue="hotel">
                      <SelectTrigger id="property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="guesthouse">Guesthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, Country" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" placeholder="Street address" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Images</h2>
                <p className="text-sm text-muted-foreground">
                  Add photos of your property. High-quality images increase booking rates.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md border overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Property image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center gap-1 border-dashed"
                    onClick={addImagePlaceholder}
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Add Image</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Rooms & Pricing</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="total-rooms">Total Rooms</Label>
                    <Input id="total-rooms" type="number" min={1} placeholder="Number of rooms" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base-price">Base Price per Night ($)</Label>
                    <Input id="base-price" type="number" min={1} placeholder="Base price" required />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-guests">Max Guests per Room</Label>
                    <Input id="max-guests" type="number" min={1} placeholder="Maximum guests" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cleaning-fee">Cleaning Fee ($)</Label>
                    <Input id="cleaning-fee" type="number" min={0} placeholder="Cleaning fee" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Amenities</h2>
                <p className="text-sm text-muted-foreground">Select the amenities available at your property</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox id={`amenity-${amenity}`} />
                      <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Policies</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="check-in">Check-in Time</Label>
                    <Select defaultValue="14:00">
                      <SelectTrigger id="check-in">
                        <SelectValue placeholder="Select check-in time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-out">Check-out Time</Label>
                    <Select defaultValue="11:00">
                      <SelectTrigger id="check-out">
                        <SelectValue placeholder="Select check-out time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation">Cancellation Policy</Label>
                  <Select defaultValue="flexible">
                    <SelectTrigger id="cancellation">
                      <SelectValue placeholder="Select cancellation policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible (24 hours before)</SelectItem>
                      <SelectItem value="moderate">Moderate (5 days before)</SelectItem>
                      <SelectItem value="strict">Strict (7 days before)</SelectItem>
                      <SelectItem value="non-refundable">Non-refundable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="house-rules">House Rules</Label>
                  <Textarea id="house-rules" placeholder="Any specific rules for guests..." className="min-h-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/owner/listings")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Hotel
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </HotelOwnerLayout>
  )
}

