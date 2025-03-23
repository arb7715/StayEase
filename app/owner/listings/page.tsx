"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, PlusCircle, Search, Trash } from "lucide-react"

// Mock data for hotel listings
const listings = [
  {
    id: "1",
    name: "Luxury Ocean Resort",
    location: "Maldives",
    rooms: 24,
    status: "active",
    price: 299,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Mountain View Lodge",
    location: "Switzerland",
    rooms: 18,
    status: "active",
    price: 199,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Urban Boutique Hotel",
    location: "New York",
    rooms: 12,
    status: "active",
    price: 249,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "4",
    name: "Beachfront Villa",
    location: "Bali",
    rooms: 8,
    status: "inactive",
    price: 179,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "5",
    name: "Historic City Hotel",
    location: "Prague",
    rooms: 15,
    status: "active",
    price: 159,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function HotelListingsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredListings = listings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Hotel Listings</h1>
            <p className="text-muted-foreground">View and manage all your hotel properties</p>
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
            <Button variant="outline" className="w-full sm:w-auto">
              Filter
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Sort
            </Button>
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
              {filteredListings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hotels found. Try a different search term or add a new hotel.
                  </TableCell>
                </TableRow>
              ) : (
                filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={listing.image || "/placeholder.svg"}
                            alt={listing.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{listing.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {listing.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell className="hidden md:table-cell">{listing.rooms}</TableCell>
                    <TableCell className="hidden md:table-cell">${listing.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={listing.status === "active" ? "default" : "secondary"}
                        className={listing.status === "active" ? "bg-green-500" : ""}
                      >
                        {listing.status === "active" ? "Active" : "Inactive"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/owner/listings/edit/${listing.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
      </div>
    </HotelOwnerLayout>
  )
}

