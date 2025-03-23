"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { Calendar, Percent, PlusCircle, Search, Trash } from "lucide-react"

// Mock data for coupons
const coupons = [
  {
    id: "1",
    code: "SUMMER2023",
    discount: 15,
    expiration: "2023-09-30",
    active: true,
    usageCount: 24,
  },
  {
    id: "2",
    code: "WELCOME10",
    discount: 10,
    expiration: "2023-12-31",
    active: true,
    usageCount: 56,
  },
  {
    id: "3",
    code: "HOLIDAY25",
    discount: 25,
    expiration: "2023-12-25",
    active: false,
    usageCount: 0,
  },
  {
    id: "4",
    code: "FLASH20",
    discount: 20,
    expiration: "2023-08-15",
    active: true,
    usageCount: 12,
  },
]

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coupons Management</h1>
            <p className="text-muted-foreground">Create and manage discount coupons for your properties</p>
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
                <DialogDescription>Add a new discount coupon for your properties</DialogDescription>
              </DialogHeader>
              <form className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" placeholder="e.g., SUMMER2023" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Percentage (%)</Label>
                  <Input id="discount" type="number" min={1} max={100} placeholder="e.g., 15" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="expiration" type="date" className="pl-8" required />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Active</Label>
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Create Coupon</Button>
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
                <TableHead className="hidden md:table-cell">Expiration</TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No coupons found. Create a new coupon to get started.
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
                    <TableCell className="hidden md:table-cell">{coupon.expiration}</TableCell>
                    <TableCell className="hidden md:table-cell">{coupon.usageCount} uses</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch checked={coupon.active} onCheckedChange={() => {}} />
                        <span className={coupon.active ? "text-green-600" : "text-muted-foreground"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-600">
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
    </HotelOwnerLayout>
  )
}

