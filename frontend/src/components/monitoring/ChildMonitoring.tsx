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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import {
  ExternalLink,
  FileDown,
  MessageSquare,
  FileText,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  RefreshCcw,
  Clock,
  ChevronDown,
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
import { InteractionSkeleton } from "../shared/InteractionSkeleton";
import { SubredditSkeleton } from "../shared/SubredditSkeleton";

interface Child {
  id: number;
  name: string;
  age: number;
  reddit_username: string;
  avatar_url?: string;
}

interface Interaction {
  id: string;
  type: "post" | "comment";
  content: string;
  subreddit: string;
  created_at: string;
  score?: number;
  sentiment: string;
  risk_level: RiskLevel;
  url: string;
}

interface SubredditData {
  name: string;
  activityLevel: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskRationale: string;
  dominantTopics: string[];
  url: string;
}

export function ChildMonitoring() {
  // --- STATES ---
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Data for Streaming
  const [rawInteractions, setRawInteractions] = useState<Interaction[]>([]); 
  const [displayedInteractions, setDisplayedInteractions] = useState<Interaction[]>([]); 
  const [subredditsList, setSubredditsList] = useState<SubredditData[]>([]);

  // Loading status
  const [isFetchingInteractions, setIsFetchingInteractions] = useState(false);
  const [isFetchingSubreddits, setIsFetchingSubreddits] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); 

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<string | null>(null);

  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [subredditFilter, setSubredditFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [anonymizeReport, setAnonymizeReport] = useState(false);

  // --- STATE FOR TIMESTAMP UPDATE (1s refresh) ---
  const [timeUpdateKey, setTimeUpdateKey] = useState(0);

  // Helper: Format Time
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // --- API FUNCTIONS ---

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
        setChildrenList(data);

        if (data.length > 0) {
          const currentExists = data.find(
            (c: Child) => c.id.toString() === selectedChildId
          );
          if (!selectedChildId || !currentExists) {
            setSelectedChildId(data[0].id.toString());
          }
        } else {
          setSelectedChildId("");
          setDisplayedInteractions([]);
          setSubredditsList([]);
        }
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInteractions = async () => {
    if (!selectedChildId) return;

    setIsFetchingInteractions(true);
    setDisplayedInteractions([]); 
    setRawInteractions([]);
    
    try {
      const token = localStorage.getItem("token");
      const url = new URL(
        `http://localhost:8000/api/children/${selectedChildId}/interactions`
      );
      if (riskFilter !== "all") url.searchParams.append("risk_level", riskFilter);
      if (sentimentFilter !== "all") url.searchParams.append("sentiment", sentimentFilter);
      if (searchValue.trim()) url.searchParams.append("search", searchValue.trim());
      if (subredditFilter !== "all") url.searchParams.append("subreddit", subredditFilter);
      if (dateFilter !== "all") url.searchParams.append("date_range", dateFilter);
      url.searchParams.append("limit", "100");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: Interaction[] = await res.json();
        setRawInteractions(data); 
        
        if (data.length > 0) {
          setLastActivityTime(data[0].created_at);
        } else {
          setLastActivityTime(null);
        }
      } else {
        setRawInteractions([]);
        setLastActivityTime(null);
      }
    } catch (e) {
      console.error(e);
      setRawInteractions([]);
      setLastActivityTime(null);
    } finally {
      setIsFetchingInteractions(false);
    }
  };

  const fetchSubreddits = async () => {
    if (!selectedChildId) return;
    setIsFetchingSubreddits(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/children/${selectedChildId}/subreddits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubredditsList(data);
      } else {
        setSubredditsList([]);
      }
    } catch (error) {
      console.error("Error fetching Reddit data:", error);
    } finally {
      setIsFetchingSubreddits(false);
    }
  };

  // Handle manual scan trigger (optional - user có thể trigger scan ngay lập tức)
  const handleScan = async () => {
    if (!selectedChildId) return;
    setIsScanning(true);
    toast.info("Đang gửi yêu cầu scan...");

    try {
      const token = localStorage.getItem("token");
      const currentChildId = selectedChildId; // Lưu lại child_id hiện tại
      
      const res = await fetch(
        `http://localhost:8000/api/children/${selectedChildId}/scan`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Yêu cầu scan đã được gửi! Dữ liệu mới sẽ xuất hiện tự động...");
        setIsScanning(false);
        
        // Auto-polling sẽ tự động fetch data sau 5 giây
        // Không cần manual polling nữa vì đã có auto-polling
        setTimeout(() => {
          if (selectedChildId === currentChildId) {
            fetchInteractions();
          }
        }, 5000);
      } else {
        toast.error("Lỗi khi gửi yêu cầu scan.");
        setIsScanning(false);
      }
    } catch (e) {
      toast.error("Lỗi kết nối server.");
      setIsScanning(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName || !newChildUsername) {
      toast.error("Please enter a display name and Reddit username.");
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/children/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChildName,
          age: parseInt(newChildAge) || 0,
          reddit_username: newChildUsername.replace("u/", ""),
        }),
      });

      if (response.ok) {
        toast.success("Account added successfully!");
        setIsAddDialogOpen(false);
        setNewChildName("");
        setNewChildAge("");
        setNewChildUsername("");
        fetchChildren();
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to add account.");
      }
    } catch (e) {
      toast.error("Connection error.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChildId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/children/${selectedChildId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Account deleted successfully.");
        fetchChildren();
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (e) {
      toast.error("Connection error.");
    }
  };

  // --- CORE EFFECTS ---

  useEffect(() => {
    fetchChildren();
    const intervalId = setInterval(() => {
      setTimeUpdateKey((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Reset data when child changes
  useEffect(() => {
    // Clean up và reset data khi chuyển child
    setDisplayedInteractions([]);
    setRawInteractions([]);
    setIsStreaming(false);
    setIsFetchingInteractions(false);
    setLastActivityTime(null);
  }, [selectedChildId]);

  // Streaming effect - chỉ chạy khi có rawInteractions mới
  useEffect(() => {
    if (rawInteractions.length === 0) {
      setDisplayedInteractions([]);
      setIsStreaming(false);
      return;
    }

    // Reset displayed interactions trước khi stream
    setDisplayedInteractions([]);
    setIsStreaming(true);

    let index = 0;
    const streamInterval = setInterval(() => {
      if (index < rawInteractions.length) {
        setDisplayedInteractions(prev => [rawInteractions[index], ...prev]);
        index++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 200);

    // Cleanup function để dừng stream khi:
    // - rawInteractions thay đổi (child mới)
    // - Component unmount
    return () => {
      clearInterval(streamInterval);
      setIsStreaming(false);
    };
  }, [rawInteractions]);

  // Fetch data when child or filters change
  useEffect(() => {
    if (!selectedChildId) return;
    
    // Reset data trước khi fetch
    setDisplayedInteractions([]);
    setRawInteractions([]);
    setIsStreaming(false);

    // Chỉ fetch khi không đang stream
    if (!isStreaming) {
      fetchInteractions();
    }
    fetchSubreddits();
  }, [selectedChildId, riskFilter, sentimentFilter, subredditFilter, searchValue, dateFilter]);

  // Auto-polling: Tự động fetch data mới từ DB mỗi 30 giây
  // Kafka worker đang xử lý streaming, frontend chỉ cần pull data mới từ DB
  // Note: fetchInteractions được định nghĩa trong component nên có thể dùng trực tiếp
  useEffect(() => {
    if (!selectedChildId) return;
    
    // Polling interval: 30 giây - tự động cập nhật data mới từ DB
    const pollingInterval = setInterval(() => {
      // Chỉ fetch khi không đang stream và không đang scan
      if (!isStreaming && !isScanning) {
        fetchInteractions();
      }
    }, 30000); // 30 giây

    return () => clearInterval(pollingInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, isStreaming, isScanning]);
  // Note: fetchInteractions không cần trong deps vì nó được định nghĩa trong cùng component

  const currentChild = childrenList.find(
    (c) => c.id.toString() === selectedChildId
  );

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  if (!isLoading && childrenList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="p-5 bg-red-50 rounded-full">
          <UserPlus className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome to Reddit Monitor
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You are not monitoring any accounts. Add your child's Reddit account
            to start.
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 gap-2 shadow-lg shadow-red-200">
              <Plus className="h-4 w-4" /> Add First Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Profile</DialogTitle>
              <DialogDescription>
                Enter the exact Reddit username for the system to scan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="Ex: Son, Alex"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Reddit Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    u/
                  </span>
                  <Input
                    className="pl-8"
                    placeholder="username123"
                    value={newChildUsername}
                    onChange={(e) => setNewChildUsername(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddChild}
                disabled={isAdding}
                className="bg-red-600 hover:bg-red-700"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add Account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 animate-in fade-in duration-500"
    >
      {/* Header & Controls */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border shadow-sm 
        bg-gradient-to-r from-red-50 to-white border-red-100 
        dark:from-slate-900 dark:to-slate-950 dark:border-red-900/30"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Activity Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Viewing data for{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">
              {currentChild?.name}
            </span>{" "}
            (u/{currentChild?.reddit_username})
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {lastActivityTime ? (
              <>
                <Clock className="h-3 w-3" />
                Last Activity: {formatTimeAgo(lastActivityTime)}
              </>
            ) : (
              "No activity data yet."
            )}
          </p>
        </div>

        <div
          className="flex items-center gap-3 p-2 rounded-xl border shadow-sm 
          bg-white border-slate-200 
          dark:bg-slate-950 dark:border-slate-800"
        >
          <Avatar className="h-10 w-10 border-2 border-red-100 dark:border-red-900">
            <AvatarFallback className="bg-red-50 text-red-600 font-bold dark:bg-red-900 dark:text-red-100">
              {currentChild?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            {/* ACCOUNT SWITCHER */}
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-[180px] h-9 bg-background/50 border focus:ring-1 focus:ring-red-200">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {childrenList.map((child) => (
                  <SelectItem key={child.id} value={child.id.toString()}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleScan}
              disabled={isScanning || isStreaming}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              title="Kafka đang xử lý streaming tự động. Nút này chỉ để trigger scan ngay lập tức."
            >
              <RefreshCcw
                className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`}
              />
              {isScanning
                ? "Đang scan..."
                : isStreaming
                ? "Đang stream..."
                : "Scan ngay"}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary border hover:bg-slate-100"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Profile</DialogTitle>
                  <DialogDescription>
                    Enter the Reddit username to monitor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Display Name</Label>
                    <Input
                      placeholder="Ex: Son, Alex"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={newChildAge}
                      onChange={(e) => setNewChildAge(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Reddit Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                        u/
                      </span>
                      <Input
                        className="pl-8"
                        placeholder="username123"
                        value={newChildUsername}
                        onChange={(e) => setNewChildUsername(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddChild}
                    disabled={isAdding}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-red-600 border hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will remove{" "}
                    <strong>{currentChild?.name}</strong> from your monitoring
                    list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChild}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="interactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted rounded-xl">
          <TabsTrigger value="interactions" className="rounded-lg">
            Interactions
          </TabsTrigger>
          <TabsTrigger value="subreddits" className="rounded-lg">
            Subreddits
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-6 mt-0">
          <Card className="border-t-4 border-t-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Recent posts and comments from u/{currentChild?.reddit_username}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Bar Updated with Sentiment Filter */}
              <FilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                showRiskFilter
                riskFilter={riskFilter}
                onRiskFilterChange={setRiskFilter}
                showSentimentFilter
                sentimentFilter={sentimentFilter}
                onSentimentFilterChange={setSentimentFilter}
                showSubredditFilter
                subredditFilter={subredditFilter}
                onSubredditFilterChange={setSubredditFilter}
                subredditOptions={subredditsList.map((s) => s.name)}
                showDateFilter
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                onClearFilters={() => {
                  setSearchValue("");
                  setRiskFilter("all");
                  setSentimentFilter("all");
                  setSubredditFilter("all");
                  setDateFilter("all");
                }}
              />

              {/* RENDER LOGIC FOR STREAMING / DISPLAYED DATA */}
              {isStreaming || (isFetchingInteractions && displayedInteractions.length === 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 py-4 text-red-600 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span className="font-medium">
                      Streaming new activity in real-time...
                    </span>
                  </div>
                  {/* Show skeletons while streaming/fetching */}
                  {Array.from({ length: rawInteractions.length === 0 ? 5 : rawInteractions.length - displayedInteractions.length }).map((_, index) => (
                    <InteractionSkeleton key={index} />
                  ))}
                  {/* Display already streamed items below */}
                  {displayedInteractions.map((interaction) => (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="bg-background">
                              {interaction.type === "post" ? (
                                <FileText className="h-3 w-3 mr-1" />
                              ) : (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              )}
                              {interaction.type === "post" ? "Post" : "Comment"}
                            </Badge>
                            <span>
                              in{" "}
                              <span className="font-semibold text-foreground">
                                {interaction.subreddit}
                              </span>
                            </span>
                            <span>
                              • {formatTimeAgo(interaction.created_at)}
                            </span>
                          </div>
                          <RiskIndicator level={interaction.risk_level} showIcon={true} />
                        </div>
                        <p className="text-base text-foreground/90 pl-1 border-l-2 border-muted">
                          "{interaction.content}"
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase text-muted-foreground">
                              Sentiment
                            </span>
                            <Badge
                              variant="secondary"
                              className={
                                interaction.sentiment === "Negative"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : ""
                              }
                            >
                              {interaction.sentiment}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(interaction.url, "_blank")}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                            on Reddit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : displayedInteractions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent interaction data found.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedInteractions.map((interaction) => (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="bg-background">
                              {interaction.type === "post" ? (
                                <FileText className="h-3 w-3 mr-1" />
                              ) : (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              )}
                              {interaction.type === "post" ? "Post" : "Comment"}
                            </Badge>
                            <span>
                              in{" "}
                              <span className="font-semibold text-foreground">
                                {interaction.subreddit}
                              </span>
                            </span>
                            <span>
                              • {formatTimeAgo(interaction.created_at)}
                            </span>
                          </div>
                          <RiskIndicator level={interaction.risk_level} showIcon={true} />
                        </div>
                        <p className="text-base text-foreground/90 pl-1 border-l-2 border-muted">
                          "{interaction.content}"
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase text-muted-foreground">
                              Sentiment
                            </span>
                            <Badge
                              variant="secondary"
                              className={
                                interaction.sentiment === "Negative"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : ""
                              }
                            >
                              {interaction.sentiment}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(interaction.url, "_blank")}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                            on Reddit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subreddits" className="space-y-6 mt-0">
          {isFetchingSubreddits ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SubredditSkeleton key={index} />
              ))}
              <div className="md:col-span-2 text-center text-sm text-muted-foreground pt-4">
                Analyzing Reddit data for u/{currentChild?.reddit_username}...
              </div>
            </div>
          ) : subredditsList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
              <p className="text-muted-foreground">
                No community participation found. This account may not have
                public activity.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-foreground">
                  Top 10 Most Active Communities
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {subredditsList.map((sub, index) => (
                  <SubredditCard key={index} {...sub} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-0">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>
                Generate and download a comprehensive activity report for{" "}
                {currentChild?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anon"
                  checked={anonymizeReport}
                  onCheckedChange={(c) => setAnonymizeReport(c as boolean)}
                />
                <label htmlFor="anon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Anonymize username in report
                </label>
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  if (!selectedChildId) {
                    toast.error("Please select a child account first.");
                    return;
                  }
                  try {
                    const token = localStorage.getItem("token");
                    const url = new URL(
                      `http://localhost:8000/api/children/${selectedChildId}/report`
                    );
                    if (anonymizeReport) {
                      url.searchParams.append("anonymize", "true");
                    }
                    
                    const response = await fetch(url.toString(), {
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = `report_${currentChild?.name}_${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(downloadUrl);
                      toast.success("Report downloaded successfully!");
                    } else {
                      toast.error("Failed to generate report.");
                    }
                  } catch (error) {
                    console.error(error);
                    toast.error("Error generating report.");
                  }
                }}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}