import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FilterBar } from "../shared/FilterBar";
import { RiskIndicator, RiskLevel } from "../shared/RiskIndicator";
import { SubredditCard } from "../shared/SubredditCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input"; // Import Input
import { Label } from "../ui/label"; // Import Label
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  ExternalLink,
  FileDown,
  MessageSquare,
  FileText,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  UserPlus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface Child {
  id: number;
  name: string;
  age: number;
  reddit_username: string;
  avatar_url?: string;
}

export function ChildMonitoring() {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // State cho Form Add Child
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter States
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");
  const [subredditFilter, setSubredditFilter] = useState("all");
  const [subredditRankFilter, setSubredditRankFilter] = useState("all");
  const [anonymizeReport, setAnonymizeReport] = useState(false);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/children/", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChildrenList(data);
        if (data.length > 0) {
            const stillExists = data.find((c: Child) => c.id.toString() === selectedChildId);
            if (!selectedChildId || !stillExists) {
                setSelectedChildId(data[0].id.toString());
            }
        } else {
            setSelectedChildId(""); 
        }
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  // --- HÀM XỬ LÝ THÊM TRẺ EM ---
  const handleAddChild = async () => {
    if (!newChildName || !newChildUsername) {
        toast.error("Enter Reddit username and display name.");
        return;
    }

    setIsAdding(true);
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/children/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newChildName,
                age: parseInt(newChildAge) || 0,
                reddit_username: newChildUsername.replace("u/", "") // Xử lý nếu user nhập u/
            })
        });

        if (response.ok) {
            toast.success("Add user successfully!");
            setIsAddDialogOpen(false);
            // Reset form
            setNewChildName("");
            setNewChildAge("");
            setNewChildUsername("");
            // Reload list
            fetchChildren();
        } else {
            const err = await response.json();
            toast.error(err.detail || "Failed to add user.");
        }
    } catch (e) {
        toast.error("Server connection error.");
    } finally {
        setIsAdding(false);
    }
  };

  // --- HÀM XỬ LÝ XÓA TRẺ EM ---
  const handleDeleteChild = async () => {
    if (!selectedChildId) return;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/children/${selectedChildId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
            toast.success("Deleted successfully");
            fetchChildren(); // Reload list -> Tự động chọn bé khác hoặc hiện màn hình trống
        } else {
            toast.error("Delete failed");
        }
    } catch (e) {
        toast.error("Server connection error.");
    }
  };

  const currentChild = childrenList.find(c => c.id.toString() === selectedChildId);

  // Mock Data (Giữ nguyên)
  const interactions = [
    { id: 1, type: "comment" as const, content: "I love playing Minecraft...", subreddit: "r/minecraft", timestamp: "2 hours ago", sentiment: "Positive", risk: "low" as RiskLevel, url: "#" },
    { id: 2, type: "post" as const, content: "Does anyone else feel...", subreddit: "r/teenagers", timestamp: "5 hours ago", sentiment: "Warning: Mental Health", risk: "medium" as RiskLevel, url: "#" },
  ];
  const subreddits = [{ name: "r/gaming", activityLevel: 23, riskLevel: "low" as RiskLevel, riskScore: 9, riskRationale: "General gaming...", dominantTopics: ["Game Reviews"], url: "#" }];

  // --- UI KHI LOADING ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- UI KHI DANH SÁCH RỖNG ---
  if (!isLoading && childrenList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="p-5 bg-red-50 rounded-full">
            <UserPlus className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Reddit monitor</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
            Please add your child account to the system.
            </p>
        </div>
        
        {/* Nút mở Dialog Add Child khi chưa có ai */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 gap-2 shadow-lg shadow-red-200">
                    <Plus className="h-4 w-4" /> Add your first account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add profile</DialogTitle>
                    <DialogDescription>Add information of the reddit account.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nick name</Label>
                        <Input id="name" placeholder="Ex: Peter, Mary" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" placeholder="15" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Reddit Username</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">u/</span>
                            <Input id="username" className="pl-8" placeholder="username123" value={newChildUsername} onChange={(e) => setNewChildUsername(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleAddChild} disabled={isAdding} className="bg-red-600 hover:bg-red-700">
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- UI CHÍNH ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Activity Monitor
          </h1>
          <p className="text-red-800/80 mt-1">
            Showing <span className="font-semibold text-red-700">{currentChild?.name}</span> account activity
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <Avatar className="h-10 w-10 border-2 border-red-100">
            <AvatarFallback className="bg-red-50 text-red-600 font-bold">
              {currentChild?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2">
            {/* Dropdown chọn Child */}
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Account</span>
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-[180px] h-8 border-none shadow-none bg-transparent p-1 text-sm font-semibold focus:ring-0">
                    <SelectValue placeholder="Choose child" />
                </SelectTrigger>
                <SelectContent>
                    {childrenList.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                        {child.name} <span className="text-muted-foreground text-xs">(u/{child.reddit_username})</span>
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            {/* Nút Thêm (+) */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Plus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>    
                        <DialogTitle>Add new account</DialogTitle>
                        <DialogDescription>Add information of your children account</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nick name</Label>
                            <Input placeholder="Ex: Can" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Age</Label>
                            <Input type="number" placeholder="14" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Reddit Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">u/</span>
                                <Input className="pl-8" placeholder="username" value={newChildUsername} onChange={(e) => setNewChildUsername(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddChild} disabled={isAdding} className="bg-red-600 hover:bg-red-700">
                            {isAdding ? "Adding..." : "Add Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Nút Xóa (Trash) */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" disabled={!selectedChildId}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Do you want to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete  <strong>{currentChild?.name}</strong> out of your monitored list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChild} className="bg-red-600 hover:bg-red-700">
                            Deleting account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Tabs Content (Giữ nguyên) */}
      <Tabs defaultValue="interactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="interactions" className="rounded-lg">Interactions</TabsTrigger>
          <TabsTrigger value="subreddits" className="rounded-lg">Subreddits</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-6 mt-0">
          <Card className="border-t-4 border-t-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Recent activity from u/{currentChild?.reddit_username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} showRiskFilter riskFilter={riskFilter} onRiskFilterChange={setRiskFilter} />
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="bg-white">{interaction.type}</Badge>
                                <span>in <span className="font-semibold text-foreground">{interaction.subreddit}</span></span>
                                <span>• {interaction.timestamp}</span>
                            </div>
                            <RiskIndicator level={interaction.risk} showIcon={true} />
                        </div>
                        <p className="text-base text-foreground/90 pl-1 border-l-2 border-muted">"{interaction.content}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subreddits" className="space-y-6 mt-0">
            <div className="grid gap-4 md:grid-cols-2">
                {subreddits.map((sub, idx) => <SubredditCard key={idx} {...sub} />)}
            </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-0">
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Export Report</CardTitle></CardHeader>
                <CardContent>
                    <Button className="bg-red-600"><FileDown className="mr-2 h-4 w-4"/> Download Report</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}