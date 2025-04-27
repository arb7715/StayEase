"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { HotelOwnerLayout } from "@/components/hotel-owner-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Building, CreditCard, Key, Loader2, Save, Shield, Users, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      })
    }, 1500)
  }

  return (
    <HotelOwnerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and property settings</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal and business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.smith@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" defaultValue="Property Manager" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" defaultValue="Acme Hotels & Resorts" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax ID / Business Number</Label>
                      <Input id="tax-id" defaultValue="123-45-6789" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input id="address" defaultValue="123 Main Street, Suite 100" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="CA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" defaultValue="94105" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
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
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-booking">New Booking Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when a new booking is made</p>
                    </div>
                    <Switch id="new-booking" defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cancellation">Cancellation Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when a booking is cancelled</p>
                    </div>
                    <Switch id="cancellation" defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="review">Review Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when a guest leaves a review
                      </p>
                    </div>
                    <Switch id="review" defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing">Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Update Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Settings</CardTitle>
                <CardDescription>Configure global settings for all your properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Default Policies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Default Check-in Time</Label>
                      <Select defaultValue="14:00">
                        <SelectTrigger id="check-in">
                          <SelectValue placeholder="Select time" />
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
                      <Label htmlFor="check-out">Default Check-out Time</Label>
                      <Select defaultValue="11:00">
                        <SelectTrigger id="check-out">
                          <SelectValue placeholder="Select time" />
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
                    <Label htmlFor="cancellation">Default Cancellation Policy</Label>
                    <Select defaultValue="flexible">
                      <SelectTrigger id="cancellation">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible (24 hours before)</SelectItem>
                        <SelectItem value="moderate">Moderate (5 days before)</SelectItem>
                        <SelectItem value="strict">Strict (7 days before)</SelectItem>
                        <SelectItem value="non-refundable">Non-refundable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Booking Settings</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-confirm">Automatic Booking Confirmation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically confirm bookings without manual review
                      </p>
                    </div>
                    <Switch id="auto-confirm" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-nights">Minimum Nights Stay</Label>
                    <Input id="min-nights" type="number" min={1} defaultValue={1} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-guests">Maximum Guests per Booking</Label>
                    <Input id="max-guests" type="number" min={1} defaultValue={4} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Display</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="jpy">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Building className="mr-2 h-4 w-4" />
                      Save Property Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
                <CardDescription>Set rules for when guests can book your properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance-booking">Minimum Advance Booking (days)</Label>
                    <Input id="advance-booking" type="number" min={0} defaultValue={0} />
                    <p className="text-xs text-muted-foreground">
                      How many days in advance guests must book (0 = same day bookings allowed)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-advance">Maximum Advance Booking (days)</Label>
                    <Input id="max-advance" type="number" min={1} defaultValue={365} />
                    <p className="text-xs text-muted-foreground">
                      How far in advance guests can book (e.g., 365 = up to 1 year)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="instant-booking">Allow Instant Booking</Label>
                      <p className="text-sm text-muted-foreground">Let guests book instantly without approval</p>
                    </div>
                    <Switch id="instant-booking" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Rules
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Professional Plan</h3>
                      <p className="text-sm text-muted-foreground">$49.99 per month</p>
                      <ul className="mt-2 text-sm space-y-1">
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Up to 10 properties
                        </li>
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Advanced analytics
                        </li>
                        <li className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Priority support
                        </li>
                      </ul>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center">
                        <span className="font-bold text-blue-600">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium">Visa •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 04/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-name">Name on Card</Label>
                      <Input id="billing-name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-email">Billing Email</Label>
                      <Input id="billing-email" type="email" defaultValue="billing@acmehotels.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing-address">Billing Address</Label>
                    <Input id="billing-address" defaultValue="123 Main Street, Suite 100" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="billing-city">City</Label>
                      <Input id="billing-city" defaultValue="San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-state">State</Label>
                      <Input id="billing-state" defaultValue="CA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-zip">ZIP Code</Label>
                      <Input id="billing-zip" defaultValue="94105" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Billing Information
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your recent invoices and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "Mar 1, 2023",
                      amount: "$49.99",
                      status: "Paid",
                      invoice: "INV-12345",
                    },
                    {
                      date: "Feb 1, 2023",
                      amount: "$49.99",
                      status: "Paid",
                      invoice: "INV-12344",
                    },
                    {
                      date: "Jan 1, 2023",
                      amount: "$49.99",
                      status: "Paid",
                      invoice: "INV-12343",
                    },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Invoice #{invoice.invoice}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <p className="text-sm text-green-600">{invoice.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline">View All Invoices</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with an additional verification step
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Set Up Two-Factor Authentication
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Access</CardTitle>
                <CardDescription>Manage team members and access permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: "John Smith",
                        email: "john.smith@example.com",
                        role: "Admin",
                      },
                      {
                        name: "Sarah Johnson",
                        email: "sarah.j@example.com",
                        role: "Manager",
                      },
                      {
                        name: "Michael Chen",
                        email: "m.chen@example.com",
                        role: "Staff",
                      },
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue={member.role.toLowerCase()}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login Sessions</h3>
                  <div className="space-y-4">
                    {[
                      {
                        device: "Chrome on Windows",
                        location: "San Francisco, USA",
                        time: "Current session",
                        current: true,
                      },
                      {
                        device: "Safari on iPhone",
                        location: "San Francisco, USA",
                        time: "2 days ago",
                        current: false,
                      },
                      {
                        device: "Firefox on MacOS",
                        location: "New York, USA",
                        time: "5 days ago",
                        current: false,
                      },
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.location} • {session.time}
                          </p>
                        </div>
                        {!session.current && (
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="destructive">Sign Out All Devices</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HotelOwnerLayout>
  )
}

