"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Globe,
  Key,
  Loader2,
  Lock,
  Mail,
  Save,
  Shield,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";

// Default user data structure
const defaultUserData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  avatar: "/placeholder.svg?height=100&width=100",
  address: "",
  language: "english",
  currency: "usd",
  bio: "",
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
  },
  paymentMethods: [],
  createdAt: "",
  role: "user",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(defaultUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [activities, setActivities] = useState([]);

  // Fetch user data from Firestore
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...defaultUserData,
            ...data,
            email: user.email || data.email || "",
            preferences: {
              ...defaultUserData.preferences,
              ...(data.preferences || {}),
            },
          });

          // Also fetch user activity logs if they exist
          try {
            const activityRef = doc(db, "userActivity", user.uid);
            const activityDoc = await getDoc(activityRef);

            if (activityDoc.exists()) {
              const activityData = activityDoc.data().activities || [];
              setActivities(activityData);
            }
          } catch (error) {
            console.error("Error fetching user activity:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Only update specific fields
      await updateDoc(userDocRef, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        language: userData.language,
        currency: userData.currency,
        bio: userData.bio,
        preferences: userData.preferences,
        // Don't update role or email directly
      });

      // Log this activity
      const timestamp = new Date().toISOString();
      const activityData = {
        action: "Profile updated",
        date: new Date().toLocaleDateString(),
        device: `${
          navigator.userAgent.includes("Chrome")
            ? "Chrome"
            : navigator.userAgent.includes("Firefox")
            ? "Firefox"
            : "Browser"
        } on ${
          navigator.platform.includes("Win")
            ? "Windows"
            : navigator.platform.includes("Mac")
            ? "MacOS"
            : navigator.platform.includes("iPhone") ||
              navigator.platform.includes("iPad")
            ? "iOS"
            : navigator.platform.includes("Android")
            ? "Android"
            : "Unknown"
        }`,
        location: "Unknown", // We could add IP-based location if needed
        timestamp: timestamp,
      };

      // Add to activity log in Firestore
      try {
        const activityRef = doc(db, "userActivity", user.uid);
        const activityDoc = await getDoc(activityRef);

        if (activityDoc.exists()) {
          await updateDoc(activityRef, {
            activities: [
              activityData,
              ...activityDoc.data().activities.slice(0, 9),
            ], // Keep last 10
          });
        } else {
          await updateDoc(activityRef, {
            activities: [activityData],
          });
        }
      } catch (error) {
        console.error("Error updating activity log:", error);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!user) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, passwordData.newPassword);

      // Log activity
      const timestamp = new Date().toISOString();
      const activityData = {
        action: "Password changed",
        date: new Date().toLocaleDateString(),
        device: `${
          navigator.userAgent.includes("Chrome")
            ? "Chrome"
            : navigator.userAgent.includes("Firefox")
            ? "Firefox"
            : "Browser"
        } on ${
          navigator.platform.includes("Win")
            ? "Windows"
            : navigator.platform.includes("Mac")
            ? "MacOS"
            : navigator.platform.includes("iPhone") ||
              navigator.platform.includes("iPad")
            ? "iOS"
            : navigator.platform.includes("Android")
            ? "Android"
            : "Unknown"
        }`,
        location: "Unknown",
        timestamp: timestamp,
      };

      try {
        const activityRef = doc(db, "userActivity", user.uid);
        const activityDoc = await getDoc(activityRef);

        if (activityDoc.exists()) {
          await updateDoc(activityRef, {
            activities: [
              activityData,
              ...activityDoc.data().activities.slice(0, 9),
            ],
          });
        } else {
          await updateDoc(activityRef, {
            activities: [activityData],
          });
        }
      } catch (error) {
        console.error("Error updating activity log:", error);
      }

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error updating password:", error);

      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else {
        setPasswordError(error.message || "Failed to update password");
      }

      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setUserData({
      ...userData,
      preferences: {
        ...userData.preferences,
        [key]: value,
      },
    });
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={userData.avatar}
                        alt={`${userData.firstName} ${userData.lastName}`}
                      />
                      <AvatarFallback>
                        {userData.firstName ? userData.firstName.charAt(0) : ""}
                        {userData.lastName ? userData.lastName.charAt(0) : ""}
                      </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={userData.firstName}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={userData.lastName}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={userData.address}
                        onChange={(e) =>
                          setUserData({ ...userData, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={userData.language}
                          onValueChange={(value) =>
                            setUserData({ ...userData, language: value })
                          }
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="japanese">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={userData.currency}
                          onValueChange={(value) =>
                            setUserData({ ...userData, currency: value })
                          }
                        >
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself"
                        className="min-h-[100px]"
                        value={userData.bio || ""}
                        onChange={(e) =>
                          setUserData({ ...userData, bio: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
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
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive booking confirmations and updates via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={userData.preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive booking confirmations and updates via SMS
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={userData.preferences.smsNotifications}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("smsNotifications", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and travel deals
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={userData.preferences.marketingEmails}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("marketingEmails", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userData.paymentMethods && userData.paymentMethods.length > 0 ? (
                userData.paymentMethods.map((method: any, index: number) => (
                  <div
                    key={method.id || index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center">
                        {method.type === "visa" ? (
                          <span className="font-bold text-blue-600">VISA</span>
                        ) : (
                          <span className="font-bold text-red-600">MC</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type === "visa" ? "Visa" : "Mastercard"} ••••{" "}
                          {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiry}
                          {method.default && " (Default)"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No payment methods saved yet.
                </p>
              )}

              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Add New Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with an additional verification step
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={userData.preferences.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("twoFactorAuth", checked)
                  }
                />
              </div>

              {userData.preferences.twoFactorAuth && (
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">
                        Two-factor authentication is enabled
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll be asked for a verification code when signing in
                        from a new device.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {userData.preferences.twoFactorAuth ? (
                <Button variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Manage 2FA Settings
                </Button>
              ) : (
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Set Up Two-Factor Authentication
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>
                Monitor recent activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        {activity.action.includes("Password") ? (
                          <Key className="h-4 w-4 text-primary" />
                        ) : activity.action.includes("Login") ? (
                          <UserIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.date} • {activity.device} •{" "}
                          {activity.location}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No recent activity to display.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
