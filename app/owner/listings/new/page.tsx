"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
];

export default function AddHotelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    propertyType: "hotel",
    location: "",
    address: "",
    description: "",
    totalRooms: 1,
    basePrice: 0,
    maxGuests: 1,
    cleaningFee: 0,
    checkIn: "14:00",
    checkOut: "11:00",
    cancellation: "flexible",
    houseRules: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
      toast.error("You must be logged in as a hotel owner to add listings");
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "totalRooms" ||
        id === "basePrice" ||
        id === "maxGuests" ||
        id === "cleaningFee"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities((prev) => [...prev, amenity]);
    } else {
      setSelectedAmenities((prev) => prev.filter((item) => item !== amenity));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    // Check file size and type
    const validFiles = newFiles.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported image format`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newImageURLs = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setImages((prevImages) => [...prevImages, ...newImageURLs]);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    if (images[index].startsWith("blob:")) {
      URL.revokeObjectURL(images[index]);
    }

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file: File) => {
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "wanderinn"); // Replace with your preset name

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/da9ca0kxr/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image of your property");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images to Cloudinary
      const imageUrls = await Promise.all(
        imageFiles.map((file) => uploadImageToCloudinary(file))
      );

      // Prepare hotel data for Firestore
      const hotelData = {
        name: formData.name,
        propertyType: formData.propertyType,
        location: formData.location,
        address: formData.address,
        description: formData.description,
        images: imageUrls,
        rooms: {
          total: formData.totalRooms,
          available: formData.totalRooms, // Initially all rooms available
          maxGuests: formData.maxGuests,
        },
        pricing: {
          basePrice: formData.basePrice,
          cleaningFee: formData.cleaningFee,
        },
        amenities: selectedAmenities,
        policies: {
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          cancellation: formData.cancellation,
          houseRules: formData.houseRules,
        },
        rating: null,
        reviews: [],
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "hotels"), hotelData);

      toast.success("Hotel listing created successfully!");
      router.push("/owner/listings");
    } catch (error) {
      console.error("Error creating hotel listing:", error);
      toast.error("Failed to create hotel listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-muted-foreground">
            Create a new hotel listing to attract guests
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hotel Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter hotel name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        handleSelectChange("propertyType", value)
                      }
                    >
                      <SelectTrigger id="propertyType">
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
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={handleChange}
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
                  Add photos of your property. High-quality images increase
                  booking rates.
                </p>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md border overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
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
                    onClick={() => fileInputRef.current?.click()}
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
                    <Label htmlFor="totalRooms">Total Rooms</Label>
                    <Input
                      id="totalRooms"
                      type="number"
                      min={1}
                      placeholder="Number of rooms"
                      value={formData.totalRooms}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price per Night ($)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min={1}
                      placeholder="Base price"
                      value={formData.basePrice}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Max Guests per Room</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min={1}
                      placeholder="Maximum guests"
                      value={formData.maxGuests}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cleaningFee">Cleaning Fee ($)</Label>
                    <Input
                      id="cleaningFee"
                      type="number"
                      min={0}
                      placeholder="Cleaning fee"
                      value={formData.cleaningFee}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Amenities</h2>
                <p className="text-sm text-muted-foreground">
                  Select the amenities available at your property
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity, checked === true)
                        }
                      />
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
                    <Label htmlFor="checkIn">Check-in Time</Label>
                    <Select
                      value={formData.checkIn}
                      onValueChange={(value) =>
                        handleSelectChange("checkIn", value)
                      }
                    >
                      <SelectTrigger id="checkIn">
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
                    <Label htmlFor="checkOut">Check-out Time</Label>
                    <Select
                      value={formData.checkOut}
                      onValueChange={(value) =>
                        handleSelectChange("checkOut", value)
                      }
                    >
                      <SelectTrigger id="checkOut">
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
                  <Select
                    value={formData.cancellation}
                    onValueChange={(value) =>
                      handleSelectChange("cancellation", value)
                    }
                  >
                    <SelectTrigger id="cancellation">
                      <SelectValue placeholder="Select cancellation policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">
                        Flexible (24 hours before)
                      </SelectItem>
                      <SelectItem value="moderate">
                        Moderate (5 days before)
                      </SelectItem>
                      <SelectItem value="strict">
                        Strict (7 days before)
                      </SelectItem>
                      <SelectItem value="non-refundable">
                        Non-refundable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseRules">House Rules</Label>
                  <Textarea
                    id="houseRules"
                    placeholder="Any specific rules for guests..."
                    className="min-h-[100px]"
                    value={formData.houseRules}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/owner/listings")}
            >
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
  );
}
