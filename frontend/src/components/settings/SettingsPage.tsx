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
import {
  User,
  Bell,
  Shield,
  Users,
  Save,
  AlertCircle,
  Trash2,
} from "lucide-react";
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

  const [children, setChildren] = useState([
    { id: "emma", name: "Emma", avatar: "E" },
    { id: "lucas", name: "Lucas", avatar: "L" },
  ]);

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated!");
  };

  const handleDeleteChild = (childName: string) => {
    toast.success(`Removed ${childName} from monitoring.`);
    // Logic to remove child would go here
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage alert preferences and monitored accounts.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Notification Preferences */}
        <Card className="shadow-sm border-t-4 border-t-red-500 h-fit">
          <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-600">
              <Bell className="h-5 w-5 fill-red-600" />
              <CardTitle>Alert Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize how you receive critical updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
              {/* Triggers */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Alert Triggers
                </h4>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-red-100/50">
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
                      className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 border-red-200"
                    />
                    <label
                      htmlFor="high"
                      className="text-sm font-medium cursor-pointer text-red-700"
                    >
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
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
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
                  <Separator className="my-2 bg-red-100" />
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
                      className="border-red-500 text-red-500 focus:ring-red-500"
                    />
                    <label
                      htmlFor="selfharm"
                      className="text-sm font-bold cursor-pointer text-red-600"
                    >
                      Critical Only (Self-Harm & Crisis)
                    </label>
                  </div>
                </div>
              </div>

              {/* Delivery Methods */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-foreground">
                  Delivery Channels
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border p-3 rounded-md bg-background hover:bg-red-50/30 transition-colors cursor-pointer">
                    <Checkbox
                      id="inApp"
                      checked={notifications.inApp}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          inApp: checked as boolean,
                        })
                      }
                      className="data-[state=checked]:bg-red-600 border-slate-300"
                    />
                    <label
                      htmlFor="inApp"
                      className="text-sm cursor-pointer w-full"
                    >
                      In-App
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md bg-background hover:bg-red-50/30 transition-colors cursor-pointer">
                    <Checkbox
                      id="email"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          email: checked as boolean,
                        })
                      }
                      className="data-[state=checked]:bg-red-600 border-slate-300"
                    />
                    <label
                      htmlFor="email"
                      className="text-sm cursor-pointer w-full"
                    >
                      Email
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Frequency */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-foreground">
                  Frequency
                </h4>
                <RadioGroup
                  value={notifications.frequency}
                  onValueChange={(value) =>
                    setNotifications({ ...notifications, frequency: value })
                  }
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer hover:bg-red-50/30 transition-colors [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50">
                    <RadioGroupItem
                      value="instant"
                      id="instant"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="instant"
                      className="cursor-pointer font-medium text-red-900"
                    >
                      Instant
                    </Label>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      As they occur
                    </span>
                  </div>
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer hover:bg-red-50/30 transition-colors [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50">
                    <RadioGroupItem
                      value="daily"
                      id="daily"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="daily"
                      className="cursor-pointer font-medium"
                    >
                      Daily
                    </Label>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      Once per day
                    </span>
                  </div>
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer hover:bg-red-50/30 transition-colors [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50">
                    <RadioGroupItem
                      value="weekly"
                      id="weekly"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="weekly"
                      className="cursor-pointer font-medium"
                    >
                      Weekly
                    </Label>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      Once per week
                    </span>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button
              onClick={handleSaveNotifications}
              className="w-full bg-red-600 hover:bg-red-700 shadow-md text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Children Management */}
        <Card className="shadow-sm border-t-4 border-t-slate-500 h-fit">
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-5 w-5" />
              <CardTitle>Manage Children</CardTitle>
            </div>
            <CardDescription>
              Add or remove accounts from monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-slate-100 border-2 border-slate-200 text-slate-600">
                      <AvatarFallback className="text-lg font-bold">
                        {child.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-base text-foreground">
                        {child.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          Monitoring Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteChild(child.name)}
                    title="Remove child"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 text-slate-500 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all mt-2"
            >
              <Users className="h-5 w-5 mr-2" />
              Add New Child
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
