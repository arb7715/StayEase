import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star } from "lucide-react"

interface HotelCardProps {
  id: string
  name: string
  location: string
  price: number
  rating: number
  image: string
}

export function HotelCard({ id, name, location, price, rating, image }: HotelCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Link href={`/hotel/${id}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={400}
              height={300}
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-muted-foreground hover:text-primary"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/hotel/${id}`} className="hover:underline">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          </Link>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {rating}
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="mt-2">
          <span className="font-semibold text-lg">${price}</span>
          <span className="text-muted-foreground text-sm"> / night</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="w-full">
          <Link href={`/hotel/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

