"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Eye,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Power,
  PowerOff,
  Save,
  Search,
  Trash,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    houseRules: string;
  };
  status: string;
  propertyType: string;
  ownerId: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function HotelListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteHotelId, setDeleteHotelId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit hotel state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Hotel>>({});
  const [selectedTab, setSelectedTab] = useState("basic");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      toast.error("You must be logged in as a hotel owner to view listings");
      return;
    }

    fetchHotels();
  }, [user, router]);

  // Fetch hotels owned by the current user
  const fetchHotels = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const hotelsRef = collection(db, "hotels");
      const q = query(hotelsRef, where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const hotelList: Hotel[] = [];
      querySnapshot.forEach((doc) => {
        hotelList.push({ id: doc.id, ...doc.data() } as Hotel);
      });

      setHotels(hotelList);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to fetch your hotel listings");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter hotels by search term and status
  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") {
      return matchesSearch;
    } else {
      return matchesSearch && hotel.status === statusFilter;
    }
  });

  // Handle delete hotel
  const handleDeleteHotel = async () => {
    if (!deleteHotelId) return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, "hotels", deleteHotelId));

      // Update local state
      setHotels(hotels.filter((hotel) => hotel.id !== deleteHotelId));
      toast.success("Hotel deleted successfully");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Failed to delete hotel");
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeleteHotelId(null);
    }
  };

  // Toggle hotel status (active/inactive)
  const handleToggleStatus = async (hotel: Hotel) => {
    try {
      const newStatus = hotel.status === "active" ? "inactive" : "active";

      await updateDoc(doc(db, "hotels", hotel.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setHotels(
        hotels.map((h) => (h.id === hotel.id ? { ...h, status: newStatus } : h))
      );

      toast.success(
        `Hotel ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating hotel status:", error);
      toast.error("Failed to update hotel status");
    }
  };

  // Open edit dialog and set up form data
  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setEditFormData({
      name: hotel.name,
      location: hotel.location,
      address: hotel.address,
      description: hotel.description,
      propertyType: hotel.propertyType,
      rooms: {
        total: hotel.rooms.total,
        available: hotel.rooms.available,
        maxGuests: hotel.rooms.maxGuests,
      },
      pricing: {
        basePrice: hotel.pricing.basePrice,
        cleaningFee: hotel.pricing.cleaningFee,
      },
      policies: {
        checkIn: hotel.policies.checkIn,
        checkOut: hotel.policies.checkOut,
        cancellation: hotel.policies.cancellation,
        houseRules: hotel.policies.houseRules,
      },
    });
    setSelectedAmenities(hotel.amenities || []);
    setIsEditDialogOpen(true);
  };

  // Handle form changes for edit dialog
  const handleEditFormChange = (
    field: string,
    value: any,
    category?: string
  ) => {
    if (category) {
      setEditFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [field]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle amenity checkbox change
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities((prev) => [...prev, amenity]);
    } else {
      setSelectedAmenities((prev) => prev.filter((item) => item !== amenity));
    }
  };

  // Save hotel changes
  const handleSaveHotelChanges = async () => {
    if (!selectedHotel) return;

    try {
      setIsSubmitting(true);

      const updatedData = {
        ...editFormData,
        amenities: selectedAmenities,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "hotels", selectedHotel.id), updatedData);

      // Update local state
      setHotels(
        hotels.map((h) =>
          h.id === selectedHotel.id ? { ...h, ...updatedData } : h
        )
      );

      toast.success("Hotel updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating hotel:", error);
      toast.error("Failed to update hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view hotel
  const handleViewHotel = (hotelId: string) => {
    // You can navigate to the public hotel page
    router.push(`/hotel/${hotelId}`);
  };

  if (isLoading) {
    return (
      <HotelOwnerLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </HotelOwnerLayout>
    );
  }

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Hotel Listings
            </h1>
            <p className="text-muted-foreground">
              View and manage all your hotel properties
            </p>
          </div>
          <Button asChild>
            <Link href="/owner/listings/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Hotel
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hotels..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Rooms</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHotels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isLoading
                      ? "Loading hotels..."
                      : "No hotels found. Try a different search term or add a new hotel."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={hotel.images?.[0] || "/placeholder.svg"}
                            alt={hotel.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {hotel.propertyType.charAt(0).toUpperCase() +
                              hotel.propertyType.slice(1)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{hotel.location}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {hotel.rooms.total} ({hotel.rooms.available} available)
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${hotel.pricing.basePrice}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          hotel.status === "active" ? "default" : "secondary"
                        }
                        className={
                          hotel.status === "active" ? "bg-green-500" : ""
                        }
                      >
                        {hotel.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewHotel(hotel.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditHotel(hotel)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(hotel)}
                          >
                            {hotel.status === "active" ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeleteHotelId(hotel.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this hotel listing and all
                associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteHotel}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Hotel"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Hotel Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hotel</DialogTitle>
              <DialogDescription>
                Update the details for {selectedHotel?.name}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="rooms">Rooms & Pricing</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>

              {/* Basic Info */}
              {selectedTab === "basic" && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Hotel Name</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name || ""}
                        onChange={(e) =>
                          handleEditFormChange("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-propertyType">Property Type</Label>
                      <Select
                        value={editFormData.propertyType || "hotel"}
                        onValueChange={(value) =>
                          handleEditFormChange("propertyType", value)
                        }
                      >
                        <SelectTrigger id="edit-propertyType">
                          <SelectValue />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={editFormData.location || ""}
                        onChange={(e) =>
                          handleEditFormChange("location", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-address">Address</Label>
                      <Input
                        id="edit-address"
                        value={editFormData.address || ""}
                        onChange={(e) =>
                          handleEditFormChange("address", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description || ""}
                      onChange={(e) =>
                        handleEditFormChange("description", e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Images preview (read only in this dialog) */}
                  {selectedHotel?.images && selectedHotel.images.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Images</Label>
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {selectedHotel.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden"
                          >
                            <Image
                              src={image}
                              alt={`Hotel image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rooms & Pricing */}
              {selectedTab === "rooms" && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-totalRooms">Total Rooms</Label>
                      <Input
                        id="edit-totalRooms"
                        type="number"
                        min={1}
                        value={editFormData.rooms?.total || 0}
                        onChange={(e) =>
                          handleEditFormChange(
                            "total",
                            parseInt(e.target.value) || 0,
                            "rooms"
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-availableRooms">
                        Available Rooms
                      </Label>
                      <Input
                        id="edit-availableRooms"
                        type="number"
                        min={0}
                        max={editFormData.rooms?.total || 0}
                        value={editFormData.rooms?.available || 0}
                        onChange={(e) =>
                          handleEditFormChange(
                            "available",
                            parseInt(e.target.value) || 0,
                            "rooms"
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-basePrice">
                        Base Price per Night ($)
                      </Label>
                      <Input
                        id="edit-basePrice"
                        type="number"
                        min={0}
                        step="0.01"
                        value={editFormData.pricing?.basePrice || 0}
                        onChange={(e) =>
                          handleEditFormChange(
                            "basePrice",
                            parseFloat(e.target.value) || 0,
                            "pricing"
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-cleaningFee">Cleaning Fee ($)</Label>
                      <Input
                        id="edit-cleaningFee"
                        type="number"
                        min={0}
                        step="0.01"
                        value={editFormData.pricing?.cleaningFee || 0}
                        onChange={(e) =>
                          handleEditFormChange(
                            "cleaningFee",
                            parseFloat(e.target.value) || 0,
                            "pricing"
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-maxGuests">Max Guests per Room</Label>
                    <Input
                      id="edit-maxGuests"
                      type="number"
                      min={1}
                      value={editFormData.rooms?.maxGuests || 1}
                      onChange={(e) =>
                        handleEditFormChange(
                          "maxGuests",
                          parseInt(e.target.value) || 1,
                          "rooms"
                        )
                      }
                    />
                  </div>
                </div>
              )}

              {/* Amenities */}
              {selectedTab === "amenities" && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`edit-amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked === true)
                          }
                        />
                        <Label htmlFor={`edit-amenity-${amenity}`}>
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {selectedTab === "policies" && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-checkIn">Check-in Time</Label>
                      <Select
                        value={editFormData.policies?.checkIn || "14:00"}
                        onValueChange={(value) =>
                          handleEditFormChange("checkIn", value, "policies")
                        }
                      >
                        <SelectTrigger id="edit-checkIn">
                          <SelectValue />
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
                      <Label htmlFor="edit-checkOut">Check-out Time</Label>
                      <Select
                        value={editFormData.policies?.checkOut || "11:00"}
                        onValueChange={(value) =>
                          handleEditFormChange("checkOut", value, "policies")
                        }
                      >
                        <SelectTrigger id="edit-checkOut">
                          <SelectValue />
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
                    <Label htmlFor="edit-cancellation">
                      Cancellation Policy
                    </Label>
                    <Select
                      value={editFormData.policies?.cancellation || "flexible"}
                      onValueChange={(value) =>
                        handleEditFormChange("cancellation", value, "policies")
                      }
                    >
                      <SelectTrigger id="edit-cancellation">
                        <SelectValue />
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
                    <Label htmlFor="edit-houseRules">House Rules</Label>
                    <Textarea
                      id="edit-houseRules"
                      value={editFormData.policies?.houseRules || ""}
                      onChange={(e) =>
                        handleEditFormChange(
                          "houseRules",
                          e.target.value,
                          "policies"
                        )
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveHotelChanges} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HotelOwnerLayout>
  );
}
