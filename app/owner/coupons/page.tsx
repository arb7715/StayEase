"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { HotelOwnerLayout } from "@/components/hotel-owner-layout";
import {
  Calendar,
  Percent,
  PlusCircle,
  Search,
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
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// Coupon interface
interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiration: string;
  active: boolean;
  usageCount: number;
  hotelId?: string;
  ownerId: string;
  createdAt: any;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // New coupon form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 10,
    expiration: "",
    active: true,
  });

  // Handle authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access coupon management");
      router.push("/login");
      return;
    }

    fetchCoupons();
  }, [user, router]);

  // Fetch coupons from Firebase
  const fetchCoupons = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Query all coupons owned by the current user
      const couponsQuery = query(
        collection(db, "coupons"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const couponsSnapshot = await getDocs(couponsQuery);

      const fetchedCoupons: Coupon[] = [];
      couponsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCoupons.push({
          id: doc.id,
          code: data.code || "",
          discount: data.discount || 0,
          expiration: data.expiration || "",
          active: data.active || false,
          usageCount: data.usageCount || 0,
          hotelId: data.hotelId || "",
          ownerId: data.ownerId || "",
          createdAt: data.createdAt,
        });
      });

      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new coupon
  const handleCreateCoupon = async () => {
    if (!user) return;

    try {
      setProcessingAction(true);

      // Basic validation
      if (!newCoupon.code.trim()) {
        toast.error("Coupon code cannot be empty");
        return;
      }

      if (newCoupon.discount <= 0 || newCoupon.discount > 100) {
        toast.error("Discount must be between 1 and 100");
        return;
      }

      if (!newCoupon.expiration) {
        toast.error("Please set an expiration date");
        return;
      }

      // Check if coupon code already exists
      const existingCoupon = coupons.find(
        (coupon) => coupon.code.toLowerCase() === newCoupon.code.toLowerCase()
      );

      if (existingCoupon) {
        toast.error("A coupon with this code already exists");
        return;
      }

      // Add new coupon to Firestore
      const couponData = {
        code: newCoupon.code.toUpperCase(),
        discount: Number(newCoupon.discount),
        expiration: newCoupon.expiration,
        active: newCoupon.active,
        usageCount: 0,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "coupons"), couponData);

      // Add to local state
      setCoupons((prev) => [
        {
          ...couponData,
          id: docRef.id,
          createdAt: new Date(),
        } as Coupon,
        ...prev,
      ]);

      // Reset form and close dialog
      setNewCoupon({
        code: "",
        discount: 10,
        expiration: "",
        active: true,
      });
      setIsDialogOpen(false);

      toast.success("Coupon created successfully");
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon");
    } finally {
      setProcessingAction(false);
    }
  };

  // Toggle coupon active status
  const toggleCouponStatus = async (
    couponId: string,
    currentStatus: boolean
  ) => {
    try {
      // Update in Firestore
      const couponRef = doc(db, "coupons", couponId);
      await updateDoc(couponRef, {
        active: !currentStatus,
      });

      // Update local state
      setCoupons((prev) =>
        prev.map((coupon) => {
          if (coupon.id === couponId) {
            return { ...coupon, active: !currentStatus };
          }
          return coupon;
        })
      );

      toast.success(
        `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating coupon status:", error);
      toast.error("Failed to update coupon status");
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      setProcessingAction(true);

      // Delete from Firestore
      await deleteDoc(doc(db, "coupons", couponToDelete));

      // Update local state
      setCoupons((prev) =>
        prev.filter((coupon) => coupon.id !== couponToDelete)
      );

      toast.success("Coupon deleted successfully");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    } finally {
      setProcessingAction(false);
      setIsDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  // Handle starting delete process
  const confirmDeleteCoupon = (couponId: string) => {
    setCouponToDelete(couponId);
    setIsDeleteDialogOpen(true);
  };

  // Filter coupons based on search
  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <HotelOwnerLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </HotelOwnerLayout>
    );
  }

  // Check if a date is expired
  const isExpired = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
    return date < today;
  };

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Coupons Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage discount coupons for your properties
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Add a new discount coupon for your properties
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SUMMER2023"
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, code: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g., 15"
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expiration"
                      type="date"
                      className="pl-8"
                      value={newCoupon.expiration}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          expiration: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]} // Today's date as minimum
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newCoupon.active}
                    onCheckedChange={(checked) =>
                      setNewCoupon({ ...newCoupon, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </form>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={processingAction}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCoupon}
                  disabled={
                    processingAction ||
                    !newCoupon.code ||
                    !newCoupon.expiration ||
                    newCoupon.discount <= 0
                  }
                >
                  {processingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Coupon"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden md:table-cell">
                  Expiration
                </TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No coupons match your search."
                      : "No coupons found. Create a new coupon to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                        {coupon.discount}%
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {coupon.expiration}
                      {isExpired(coupon.expiration) && (
                        <span className="ml-2 text-xs text-red-500 font-medium">
                          Expired
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {coupon.usageCount} uses
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={coupon.active}
                          onCheckedChange={() =>
                            toggleCouponStatus(coupon.id, coupon.active)
                          }
                          disabled={isExpired(coupon.expiration)}
                        />
                        <span
                          className={
                            coupon.active && !isExpired(coupon.expiration)
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {coupon.active && !isExpired(coupon.expiration)
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => confirmDeleteCoupon(coupon.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="bg-red-600 hover:bg-red-700"
              disabled={processingAction}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HotelOwnerLayout>
  );
}
