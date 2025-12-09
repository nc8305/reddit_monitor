import { useState, useEffect } from "react";
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
  Loader2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface Child {
  id: number;
  name: string;
  age: number;
  reddit_username: string;
  avatar_url?: string;
}

interface NotificationSettings {
  in_app: boolean;
  email: boolean;
  high_severity: boolean;
  medium_severity: boolean;
  low_severity: boolean;
  self_harm_only: boolean;
  frequency: string;
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    in_app: true,
    email: true,
    high_severity: true,
    medium_severity: true,
    low_severity: false,
    self_harm_only: false,
    frequency: "instant",
  });

  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:8000/api/settings/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications({
            in_app: data.in_app ?? true,
            email: data.email ?? true,
            high_severity: data.high_severity ?? true,
            medium_severity: data.medium_severity ?? true,
            low_severity: data.low_severity ?? false,
            self_harm_only: data.self_harm_only ?? false,
            frequency: data.frequency ?? "instant",
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch children
  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/children/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setChildren(data);
        }
      } catch (error) {
        toast.error("Failed to load children");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/settings/notifications",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notifications),
        }
      );

      if (response.ok) {
        toast.success("Notification preferences updated!");
      } else {
        toast.error("Failed to update preferences");
      }
    } catch (error) {
      toast.error("Error updating preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChild = (child: Child) => {
    setChildToDelete(child);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteChild = async () => {
    if (!childToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/children/${childToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success(`Removed ${childToDelete.name} from monitoring.`);
        setChildren(children.filter((c) => c.id !== childToDelete.id));
      } else {
        toast.error("Failed to remove child");
      }
    } catch (error) {
      toast.error("Error removing child");
    } finally {
      setIsDeleteDialogOpen(false);
      setChildToDelete(null);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim() || !newChildUsername.trim() || !newChildAge.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in");
        return;
      }

      const response = await fetch("http://localhost:8000/api/children/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChildName.trim(),
          age: parseInt(newChildAge),
          reddit_username: newChildUsername.trim().replace(/^u\//, ""),
        }),
      });

      if (response.ok) {
        const newChild = await response.json();
        setChildren([...children, newChild]);
        toast.success(`Added ${newChildName} to monitoring.`);
        setIsAddDialogOpen(false);
        setNewChildName("");
        setNewChildAge("");
        setNewChildUsername("");
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to add child");
      }
    } catch (error) {
      toast.error("Error adding child");
    } finally {
      setIsAdding(false);
    }
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
        <Card className="shadow-sm border-t-4 border-t-red-500 h-fit dark:border-t-red-600">
          <CardHeader className="pb-4 border-b 
            bg-red-50/50 border-red-100 
            dark:bg-red-950/20 dark:border-red-900/50">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Bell className="h-5 w-5 fill-red-600 dark:fill-red-400" />
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
                <div className="space-y-3 p-4 rounded-lg border 
                  bg-muted/30 border-red-100/50 
                  dark:bg-slate-900/50 dark:border-slate-800">
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
                      className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 border-red-200 dark:border-red-800"
                    />
                    <label
                      htmlFor="high"
                      className="text-sm font-medium cursor-pointer text-red-700 dark:text-red-300"
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
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 dark:border-slate-600"
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
                      className="dark:border-slate-600"
                    />
                    <label htmlFor="low" className="text-sm cursor-pointer">
                      Low Severity Alerts
                    </label>
                  </div>
                  <Separator className="my-2 bg-red-100 dark:bg-red-900/30" />
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
                      className="border-red-500 text-red-500 focus:ring-red-500 dark:border-red-700"
                    />
                    <label
                      htmlFor="selfharm"
                      className="text-sm font-bold cursor-pointer text-red-600 dark:text-red-400"
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
                  <div className="flex items-center space-x-2 border p-3 rounded-md transition-colors cursor-pointer
                    bg-background hover:bg-red-50/30 dark:hover:bg-red-900/10 dark:border-slate-700">
                    <Checkbox
                      id="inApp"
                      checked={notifications.inApp}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          inApp: checked as boolean,
                        })
                      }
                      className="data-[state=checked]:bg-red-600 border-slate-300 dark:border-slate-600"
                    />
                    <label
                      htmlFor="inApp"
                      className="text-sm cursor-pointer w-full"
                    >
                      In-App
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md transition-colors cursor-pointer
                    bg-background hover:bg-red-50/30 dark:hover:bg-red-900/10 dark:border-slate-700">
                    <Checkbox
                      id="email"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          email: checked as boolean,
                        })
                      }
                      className="data-[state=checked]:bg-red-600 border-slate-300 dark:border-slate-600"
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
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer transition-colors 
                    hover:bg-red-50/30 dark:hover:bg-red-900/10 dark:border-slate-700
                    [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50 dark:[&:has(:checked)]:bg-red-900/20">
                    <RadioGroupItem
                      value="instant"
                      id="instant"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="instant"
                      className="cursor-pointer font-medium text-red-900 dark:text-red-300"
                    >
                      Instant
                    </Label>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      As they occur
                    </span>
                  </div>
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer transition-colors 
                    hover:bg-red-50/30 dark:hover:bg-red-900/10 dark:border-slate-700
                    [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50 dark:[&:has(:checked)]:bg-red-900/20">
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
                  <div className="relative flex flex-col items-center justify-center space-y-2 border p-3 rounded-md cursor-pointer transition-colors 
                    hover:bg-red-50/30 dark:hover:bg-red-900/10 dark:border-slate-700
                    [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50 dark:[&:has(:checked)]:bg-red-900/20">
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
              className="w-full bg-red-600 hover:bg-red-700 shadow-md text-white dark:bg-red-700 dark:hover:bg-red-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Children Management */}
        <Card className="shadow-sm border-t-4 border-t-slate-500 h-fit dark:border-t-slate-600">
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
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
                  className="flex items-center justify-between p-4 border rounded-xl transition-all group
                    bg-white hover:shadow-sm 
                    dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 
                      bg-slate-100 border-slate-200 text-slate-600
                      dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
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
                    className="text-muted-foreground transition-colors
                      hover:text-red-600 hover:bg-red-50 
                      dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
              className="w-full h-12 border-dashed border-2 transition-all mt-2
                text-slate-500 hover:border-red-500 hover:bg-red-50 hover:text-red-600
                dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/10 dark:hover:text-red-400 dark:hover:border-red-500/50"
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