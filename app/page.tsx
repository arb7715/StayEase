import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Users } from "lucide-react";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { HotelCard } from "@/components/hotel-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://www.viceroybali.com/wp-content/uploads/2024/03/What-Is-the-Difference-Between-a-Resort-and-a-Hotel-2.png"
            alt="Luxury hotel room"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
        </div>
        <div className="container relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Discover amazing hotels and accommodations around the world at the
            best prices
          </p>
          <Button size="lg" asChild>
            <Link href="/search">Book Your Stay Now</Link>
          </Button>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container -mt-16 mb-16 relative z-20">
        <Card className="p-6 shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Where are you going?" className="pl-10" />
              </div>
              <div className="md:col-span-2">
                <DatePickerWithRange />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Guests"
                    min={1}
                    defaultValue={2}
                    className="pl-10"
                  />
                </div>
                <Button size="icon" className="h-10 w-10">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Hotels */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Hotels
            </h2>
            <p className="text-muted-foreground">
              Explore our handpicked selection of amazing places to stay
            </p>
          </div>
          <Button variant="outline" asChild className="mt-4 md:mt-0">
            <Link href="/search">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <HotelCard
            id="1"
            name="Luxury Ocean Resort"
            location="Maldives"
            price={299}
            rating={4.9}
            image="/placeholder.svg?height=300&width=400"
          />
          <HotelCard
            id="2"
            name="Mountain View Lodge"
            location="Switzerland"
            price={199}
            rating={4.7}
            image="/placeholder.svg?height=300&width=400"
          />
          <HotelCard
            id="3"
            name="Urban Boutique Hotel"
            location="New York"
            price={249}
            rating={4.8}
            image="/placeholder.svg?height=300&width=400"
          />
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-muted py-12">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Paris", "Tokyo", "Bali", "London"].map((city) => (
              <Link href={`/search?location=${city}`} key={city}>
                <div className="relative h-48 rounded-lg overflow-hidden group">
                  <Image
                    src="/placeholder.svg?height=200&width=300"
                    alt={city}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                    <h3 className="text-xl font-semibold text-white">{city}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-12">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
          What Our Guests Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              text: "StayEase made finding and booking our honeymoon resort so easy. The room was exactly as pictured and the service was exceptional.",
            },
            {
              name: "Michael Chen",
              text: "I use StayEase for all my business trips. The interface is intuitive and I can quickly find accommodations that meet my needs.",
            },
            {
              name: "Emma Rodriguez",
              text: "Our family vacation was perfect thanks to StayEase. We found a great hotel with kid-friendly amenities at a reasonable price.",
            },
          ].map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-yellow-500"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.text}</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have found their ideal
            accommodations through StayEase.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
