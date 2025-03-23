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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  PlusCircle,
  Search,
  Send,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for support tickets
const tickets = [
  {
    id: "T-12345",
    subject: "Booking cancellation request",
    message: "I need to cancel my booking at Luxury Ocean Resort due to a family emergency. Booking ID: B-12345.",
    status: "open",
    priority: "high",
    createdAt: "Mar 10, 2023",
    updatedAt: "Mar 11, 2023",
    responses: [
      {
        id: "R-1",
        from: "support",
        message:
          "We're sorry to hear about your emergency. We'll process your cancellation request right away. Could you please confirm if you'd like to proceed with a full cancellation?",
        createdAt: "Mar 11, 2023",
      },
    ],
  },
  {
    id: "T-12344",
    subject: "Room upgrade inquiry",
    message:
      "I'd like to upgrade my room at Mountain View Lodge from standard to deluxe. Is this possible? Booking ID: B-12344.",
    status: "open",
    priority: "medium",
    createdAt: "Mar 8, 2023",
    updatedAt: "Mar 9, 2023",
    responses: [],
  },
  {
    id: "T-12343",
    subject: "Missing loyalty points",
    message: "I didn't receive my loyalty points for my stay at Urban Boutique Hotel last month. Booking ID: B-12343.",
    status: "closed",
    priority: "medium",
    createdAt: "Feb 28, 2023",
    updatedAt: "Mar 5, 2023",
    responses: [
      {
        id: "R-2",
        from: "support",
        message:
          "Thank you for bringing this to our attention. We've checked your account and have credited the missing 500 loyalty points to your account. They should be visible now.",
        createdAt: "Mar 2, 2023",
      },
      {
        id: "R-3",
        from: "user",
        message: "I can see the points now. Thank you for resolving this quickly!",
        createdAt: "Mar 3, 2023",
      },
      {
        id: "R-4",
        from: "support",
        message:
          "You're welcome! We're glad we could help. Please let us know if you have any other questions or concerns.",
        createdAt: "Mar 5, 2023",
      },
    ],
  },
]

export default function SupportPage() {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help with your bookings and account</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="new">New Ticket</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
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
                    <Select defaultValue="booking">
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking Issue</SelectItem>
                        <SelectItem value="payment">Payment Problem</SelectItem>
                        <SelectItem value="account">Account Help</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
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
                  <Label htmlFor="booking-id">Booking ID (if applicable)</Label>
                  <Input id="booking-id" placeholder="e.g., B-12345" />
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

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  question: "How do I cancel my booking?",
                  answer:
                    "You can cancel your booking by going to your Bookings page, selecting the booking you wish to cancel, and clicking the 'Cancel Reservation' button. Please note that cancellation policies vary by hotel and booking type.",
                },
                {
                  question: "When will I be charged for my booking?",
                  answer:
                    "Payment policies vary by hotel. Some hotels require full payment at the time of booking, while others may only require a deposit or allow payment at check-in. The payment details are always displayed before you confirm your booking.",
                },
                {
                  question: "How do I modify my reservation?",
                  answer:
                    "To modify your reservation, go to your Bookings page, select the booking you wish to modify, and click 'Modify Reservation'. You can change dates, room type, or guest count, subject to availability and the hotel's modification policy.",
                },
                {
                  question: "What is the check-in/check-out time?",
                  answer:
                    "Check-in and check-out times vary by hotel. Generally, check-in is after 2:00 PM or 3:00 PM, and check-out is before 11:00 AM or 12:00 PM. The exact times are displayed on your booking confirmation and details page.",
                },
                {
                  question: "How do I contact the hotel directly?",
                  answer:
                    "You can find the hotel's contact information on your booking confirmation or on the hotel's details page. Alternatively, you can contact our support team, and we'll help you get in touch with the hotel.",
                },
              ].map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {index < 4 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?{" "}
                <Button variant="link" className="h-auto p-0" onClick={() => setActiveTab("new")}>
                  Contact Support
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

