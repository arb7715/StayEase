"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  priority: "low" | "medium" | "high";
  category: string;
  bookingId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  responses: {
    id: string;
    from: "user" | "support";
    message: string;
    createdAt: Timestamp;
  }[];
}

// FAQ data
const faqs = [
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
];

export default function SupportPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // New ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "booking",
    priority: "medium",
    bookingId: "",
    message: "",
  });

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access support");
      router.push("/login");
      return;
    }

    // Fetch user's tickets
    fetchUserTickets();
  }, [user, router]);

  const fetchUserTickets = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Query tickets for current user
      const ticketsQuery = query(
        collection(db, "supportTickets"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const ticketsSnapshot = await getDocs(ticketsQuery);
      const userTickets: Ticket[] = [];

      // Process each ticket
      ticketsSnapshot.forEach((doc) => {
        const data = doc.data();
        userTickets.push({
          id: doc.id,
          userId: data.userId,
          subject: data.subject,
          message: data.message,
          status: data.status,
          priority: data.priority,
          category: data.category,
          bookingId: data.bookingId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          responses: data.responses || [],
        });
      });

      setTickets(userTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Create new ticket in Firebase
      const newTicket = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "User",
        subject: ticketForm.subject,
        message: ticketForm.message,
        status: "open",
        priority: ticketForm.priority,
        category: ticketForm.category,
        bookingId: ticketForm.bookingId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        responses: [],
      };

      const docRef = await addDoc(collection(db, "supportTickets"), newTicket);

      // Reset form and show success message
      setTicketForm({
        subject: "",
        category: "booking",
        priority: "medium",
        bookingId: "",
        message: "",
      });

      toast.success("Support ticket submitted successfully");

      // Refresh tickets and switch to tickets tab
      fetchUserTickets();
      setActiveTab("tickets");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create support ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !newMessage.trim()) return;

    try {
      setIsSubmitting(true);

      // Get current ticket
      const ticketRef = doc(db, "supportTickets", selectedTicket);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        toast.error("Ticket not found");
        return;
      }

      const ticketData = ticketSnap.data();
      const responses: Ticket["responses"] = ticketData.responses || [];

      // Add new response
      const newResponse = {
        id: `r-${Date.now()}`,
        from: "user" as "user",
        message: newMessage,
        createdAt: serverTimestamp(),
      };

      // Update ticket with new response
      await updateDoc(ticketRef, {
        responses: [...responses, newResponse],
        updatedAt: serverTimestamp(),
      });

      // Update local state
      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id === selectedTicket) {
          return {
            ...ticket,
            responses: [
              ...ticket.responses,
              {
                ...newResponse,
                createdAt: Timestamp.now(),
              },
            ],
            updatedAt: Timestamp.now(),
          };
        }
        return ticket;
      });

      setTickets(updatedTickets);
      setNewMessage("");
      toast.success("Reply sent successfully");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected ticket data
  const selectedTicketData = selectedTicket
    ? tickets.find((ticket) => ticket.id === selectedTicket)
    : null;

  // Format timestamp to readable date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help with your bookings and account
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedTicket ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-2 -ml-2 h-8"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to tickets
                    </Button>
                    <CardTitle>{selectedTicketData?.subject}</CardTitle>
                    <CardDescription>
                      Ticket ID: {selectedTicketData?.id} • Created on{" "}
                      {selectedTicketData &&
                        formatDate(selectedTicketData.createdAt)}
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
                  {/* Initial message */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">You</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedTicketData &&
                            formatDate(selectedTicketData.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicketData?.message}</p>
                    </div>
                  </div>

                  {/* Responses */}
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
                          <span className="font-medium">
                            {response.from === "support"
                              ? "Support Agent"
                              : "You"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply form */}
                {selectedTicketData?.status === "open" && (
                  <form
                    onSubmit={handleReply}
                    className="space-y-4 pt-4 border-t"
                  >
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
                  <h3 className="mt-4 text-lg font-semibold">
                    No tickets found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try a different search term"
                      : "You haven't created any support tickets yet"}
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
                              <h3 className="font-semibold">
                                {ticket.subject}
                              </h3>
                              <Badge
                                className={
                                  ticket.status === "open"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {ticket.status === "open" ? "Open" : "Closed"}
                              </Badge>
                              {ticket.priority === "high" && (
                                <Badge variant="destructive">
                                  High Priority
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {ticket.message}
                            </p>
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
                                  ? `Updated ${formatDate(ticket.updatedAt)}`
                                  : `Closed ${formatDate(ticket.updatedAt)}`}
                              </span>
                            </div>
                            <Badge variant="outline">
                              {ticket.responses.length}{" "}
                              {ticket.responses.length === 1
                                ? "response"
                                : "responses"}
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
                Submit a new support request and we'll get back to you as soon
                as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={ticketForm.category}
                      onValueChange={(value) =>
                        setTicketForm({ ...ticketForm, category: value })
                      }
                    >
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
                    <Select
                      value={ticketForm.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setTicketForm({ ...ticketForm, priority: value })
                      }
                    >
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
                  <Input
                    id="booking-id"
                    placeholder="e.g., B-12345"
                    value={ticketForm.bookingId}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        bookingId: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[150px]"
                    value={ticketForm.message}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, message: e.target.value })
                    }
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleNewTicket}
                disabled={
                  isSubmitting || !ticketForm.subject || !ticketForm.message
                }
              >
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
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {index < faqs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?{" "}
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => setActiveTab("new")}
                >
                  Contact Support
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
