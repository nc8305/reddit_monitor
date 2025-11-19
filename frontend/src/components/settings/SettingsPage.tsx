import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { User, Bell, Shield, Users, Save } from "lucide-react";
import { toast } from "sonner";
export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    inApp: true,
    email: true,
    highSeverity: true,
    mediumSeverity: true,
    lowSeverity: false,
    selfHarmOnly: false,
    frequency: "instant",
  });

  const handleSaveProfile = () => {
    toast.success("Profile settings saved successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Control how and when you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inApp"
                      checked={notifications.inApp}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          inApp: checked as boolean,
                        })
                      }
                    />
                    <label htmlFor="inApp" className="text-sm cursor-pointer">
                      In-App Dashboard Notifications
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          email: checked as boolean,
                        })
                      }
                    />
                    <label htmlFor="email" className="text-sm cursor-pointer">
                      Email Notifications
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3">Alert Triggers</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high"
                      checked={notifications.highSeverity}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          highSeverity: checked as boolean,
                        })
                      }
                    />
                    <label htmlFor="high" className="text-sm cursor-pointer">
                      High Severity Alerts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medium"
                      checked={notifications.mediumSeverity}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          mediumSeverity: checked as boolean,
                        })
                      }
                    />
                    <label htmlFor="medium" className="text-sm cursor-pointer">
                      Medium Severity Alerts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="low"
                      checked={notifications.lowSeverity}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          lowSeverity: checked as boolean,
                        })
                      }
                    />
                    <label htmlFor="low" className="text-sm cursor-pointer">
                      Low Severity Alerts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selfharm"
                      checked={notifications.selfHarmOnly}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          selfHarmOnly: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="selfharm"
                      className="text-sm cursor-pointer"
                    >
                      Self-Harm & Crisis Only (overrides other settings)
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3">Notification Frequency</h4>
                <RadioGroup
                  value={notifications.frequency}
                  onValueChange={(value) =>
                    setNotifications({ ...notifications, frequency: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instant" id="instant" />
                    <label htmlFor="instant" className="text-sm cursor-pointer">
                      Instant (as they occur)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <label htmlFor="daily" className="text-sm cursor-pointer">
                      Daily Digest (once per day)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <label htmlFor="weekly" className="text-sm cursor-pointer">
                      Weekly Digest (once per week)
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button onClick={handleSaveNotifications}>
              <Save className="h-4 w-4 mr-2" />
              Save Notification Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Children Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Manage Children</CardTitle>
            </div>
            <CardDescription>
              Add or remove children from monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary">
                    <AvatarFallback className="text-primary-foreground">
                      E
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>Emma</p>
                    <p className="text-sm text-muted-foreground">
                      14 years old
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary">
                    <AvatarFallback className="text-primary-foreground">
                      L
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>Lucas</p>
                    <p className="text-sm text-muted-foreground">
                      12 years old
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Add New Child
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
