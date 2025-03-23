"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  Phone,
  PlusCircle,
  Search,
  Send,
  User,
  Mail,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for support tickets
const tickets = [
  {
    id: "T-12345",
    subject: "Integration with payment processor",
    message:
      "We're having issues with our payment processor integration. Transactions are being declined even though they should be approved.",
    status: "open",
    priority: "high",
    createdAt: "Mar 10, 2023",
    updatedAt: "Mar 11, 2023",
    responses: [
      {
        id: "R-1",
        from: "support",
        message:
          "Thank you for reaching out. Could you please provide more details about the specific error messages you're receiving? Also, which payment processor are you using?",
        createdAt: "Mar 11, 2023",
      },
    ],
  },
  {
    id: "T-12344",
    subject: "Adding new property type",
    message:
      "I'd like to add a new property type that isn't currently available in the system. How can I request this feature?",
    status: "open",
    priority: "medium",
    createdAt: "Mar 8, 2023",
    updatedAt: "Mar 9, 2023",
    responses: [],
  },
  {
    id: "T-12343",
    subject: "Calendar sync issue",
    message:
      "The calendar isn't syncing properly with our Google Calendar. Events are showing up with incorrect dates.",
    status: "closed",
    priority: "medium",
    createdAt: "Feb 28, 2023",
    updatedAt: "Mar 5, 2023",
    responses: [
      {
        id: "R-2",
        from: "support",
        message:
          "We've identified the issue with the calendar sync. It appears to be related to timezone settings. Please check your Google Calendar timezone settings and make sure they match your property timezone in our system.",
        createdAt: "Mar 2, 2023",
      },
      {
        id: "R-3",
        from: "user",
        message: "I've checked the timezone settings and they match. The issue is still occurring.",
        createdAt: "Mar 3, 2023",
      },
      {
        id: "R-4",
        from: "support",
        message:
          "We've pushed a fix for the calendar sync issue. Please try disconnecting and reconnecting your Google Calendar. Let us know if the issue persists.",
        createdAt: "Mar 4, 2023",
      },
      {
        id: "R-5",
        from: "user",
        message: "That worked! The calendar is now syncing correctly. Thank you for your help.",
        createdAt: "Mar 5, 2023",
      },
    ],
  },
]

export default function OwnerSupportPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("tickets")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNewTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setActiveTab("tickets")
      toast({
        title: "Ticket submitted",
        description: "Your support ticket has been submitted successfully.",
      })
    }, 1500)
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setNewMessage("")
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      })
    }, 1500)
  }

  const getTicketById = (id: string) => {
    return tickets.find((ticket) => ticket.id === id)
  }

  const selectedTicketData = selectedTicket ? getTicketById(selectedTicket) : null

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support</h1>
            <p className="text-muted-foreground">Get help with your account and properties</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="tel:+18001234567">
                <Phone className="mr-2 h-4 w-4" />
                Call Support
              </a>
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="new">New Ticket</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {activeTab === "tickets" && (
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          <TabsContent value="tickets" className="space-y-6">
            {selectedTicket ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 h-8 data-[state=open]:bg-accent"
                        onClick={() => setSelectedTicket(null)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to tickets
                      </Button>
                      <CardTitle>{selectedTicketData?.subject}</CardTitle>
                      <CardDescription>
                        Ticket ID: {selectedTicketData?.id} • Created on {selectedTicketData?.createdAt}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        selectedTicketData?.status === "open"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {selectedTicketData?.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">You</span>
                          <span className="text-xs text-muted-foreground">{selectedTicketData?.createdAt}</span>
                        </div>
                        <p className="text-sm">{selectedTicketData?.message}</p>
                      </div>
                    </div>

                    {selectedTicketData?.responses.map((response) => (
                      <div key={response.id} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {response.from === "support" ? (
                            <HelpCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{response.from === "support" ? "Support Agent" : "You"}</span>
                            <span className="text-xs text-muted-foreground">{response.createdAt}</span>
                          </div>
                          <p className="text-sm">{response.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTicketData?.status === "open" && (
                    <form onSubmit={handleReply} className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="reply">Reply</Label>
                        <Textarea
                          id="reply"
                          placeholder="Type your message here..."
                          className="min-h-[100px]"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try a different search term" : "You haven't created any support tickets yet"}
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab("new")}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedTicket(ticket.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{ticket.subject}</h3>
                                <Badge
                                  className={
                                    ticket.status === "open"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                  }
                                >
                                  {ticket.status === "open" ? "Open" : "Closed"}
                                </Badge>
                                {ticket.priority === "high" && <Badge variant="destructive">High Priority</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{ticket.message}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                {ticket.status === "open" ? (
                                  <Clock className="mr-1 h-4 w-4" />
                                ) : (
                                  <CheckCircle2 className="mr-1 h-4 w-4" />
                                )}
                                <span>
                                  {ticket.status === "open"
                                    ? `Updated ${ticket.updatedAt}`
                                    : `Closed ${ticket.updatedAt}`}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {ticket.responses.length} {ticket.responses.length === 1 ? "response" : "responses"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>
                  Submit a new support request and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue="technical">
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Problem</SelectItem>
                          <SelectItem value="account">Account Help</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property">Related Property</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="luxury">Luxury Ocean Resort</SelectItem>
                        <SelectItem value="mountain">Mountain View Lodge</SelectItem>
                        <SelectItem value="urban">Urban Boutique Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments (optional)</Label>
                    <Input id="attachments" type="file" multiple />
                    <p className="text-xs text-muted-foreground">You can upload up to 3 files (max 5MB each)</p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNewTicket} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Popular Articles</h3>
                    <ul className="space-y-1">
                      {[
                        "How to set up dynamic pricing",
                        "Connecting your payment processor",
                        "Setting up automated messages",
                        "Managing multiple properties",
                        "Optimizing your property listings",
                      ].map((article, index) => (
                        <li key={index} className="text-sm">
                          <a href="#" className="text-primary hover:underline">
                            {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Video Tutorials</h3>
                    <ul className="space-y-1">
                      {[
                        "Getting started with StayEase",
                        "Advanced booking management",
                        "Using the analytics dashboard",
                        "Setting up promotions and discounts",
                        "Managing guest communications",
                      ].map((video, index) => (
                        <li key={index} className="text-sm">
                          <a href="#" className="text-primary hover:underline">
                            {video}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse All Resources
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Ways to get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Support Hours</h3>
                    <p className="text-sm">
                      Monday - Friday: 9:00 AM - 8:00 PM EST
                      <br />
                      Saturday - Sunday: 10:00 AM - 6:00 PM EST
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Phone Support</h3>
                    <p className="text-sm">
                      US & Canada: +1 (800) 123-4567
                      <br />
                      International: +1 (123) 456-7890
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="tel:+18001234567">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Support
                      </a>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="text-sm">
                      General Inquiries: support@stayease.com
                      <br />
                      Billing Questions: billing@stayease.com
                      <br />
                      Technical Support: tech@stayease.com
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="mailto:support@stayease.com">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </a>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Live Chat
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      question: "How do I connect my property management system?",
                      answer:
                        "You can connect your PMS by going to Settings > Integrations and selecting your provider from the list. Follow the on-screen instructions to complete the connection process.",
                    },
                    {
                      question: "How are service fees calculated?",
                      answer:
                        "Service fees are calculated as a percentage of the booking total, excluding taxes. The standard fee is 3%, but this may vary based on your subscription plan and property volume.",
                    },
                    {
                      question: "Can I offer special rates for returning guests?",
                      answer:
                        "Yes, you can create custom discount codes for returning guests. Go to Marketing > Promotions to set up guest-specific discount codes or loyalty programs.",
                    },
                    {
                      question: "How do I update my property's availability calendar?",
                      answer:
                        "You can update your property's availability by going to Properties > [Property Name] > Calendar. From there, you can block dates, set minimum stay requirements, and adjust pricing.",
                    },
                    {
                      question: "What payment methods can guests use?",
                      answer:
                        "Guests can pay using major credit cards (Visa, Mastercard, American Express), PayPal, and in some regions, Apple Pay and Google Pay. The available payment methods depend on your connected payment processor.",
                    },
                  ].map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-semibold">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                      {index < 4 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </HotelOwnerLayout>
  )
}

