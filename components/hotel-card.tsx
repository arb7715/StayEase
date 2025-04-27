import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface HotelCardProps {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
}

export function HotelCard({
  id,
  name,
  location,
  price,
  rating,
  image,
}: HotelCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-lg">
      <Link
        href={`/hotel/${id}`}
        className="relative block h-48 w-full overflow-hidden"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Link href={`/hotel/${id}`} className="hover:underline">
            <h3 className="font-semibold truncate">{name}</h3>
          </Link>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{5}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{location}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="font-semibold">${price}</span>
            <span className="text-muted-foreground text-sm"> / night</span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/hotel/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
