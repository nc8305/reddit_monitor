import { useState } from "react";
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
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  ExternalLink,
  FileDown,
  MessageSquare,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";

export function ChildMonitoring() {
  const [selectedChild, setSelectedChild] = useState("emma");
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");
  const [subredditFilter, setSubredditFilter] = useState("all");
  const [subredditRankFilter, setSubredditRankFilter] = useState("all");
  const [anonymizeReport, setAnonymizeReport] = useState(false);

  const children = [
    { id: "emma", name: "Emma", age: 14, avatar: "E" },
    { id: "lucas", name: "Lucas", age: 12, avatar: "L" },
  ];

  const interactions = [
    {
      id: 1,
      type: "comment" as const,
      content:
        "I love playing Minecraft with my friends! Just built an awesome castle.",
      subreddit: "r/minecraft",
      timestamp: "2 hours ago",
      sentiment: "Positive",
      risk: "low" as RiskLevel,
      url: "https://reddit.com/r/minecraft/...",
    },
    {
      id: 2,
      type: "post" as const,
      content:
        "Does anyone else feel like they're never good enough? I'm struggling with school lately.",
      subreddit: "r/teenagers",
      timestamp: "5 hours ago",
      sentiment: "Warning: Mental Health",
      risk: "medium" as RiskLevel,
      url: "https://reddit.com/r/teenagers/...",
    },
    {
      id: 3,
      type: "comment" as const,
      content: "That's so stupid, why would anyone think that?",
      subreddit: "r/gaming",
      timestamp: "1 day ago",
      sentiment: "Warning: Profanity",
      risk: "medium" as RiskLevel,
      url: "https://reddit.com/r/gaming/...",
    },
    {
      id: 4,
      type: "comment" as const,
      content:
        "Thanks for the tips! This really helped me understand the game better.",
      subreddit: "r/gaming",
      timestamp: "2 days ago",
      sentiment: "Positive",
      risk: "low" as RiskLevel,
      url: "https://reddit.com/r/gaming/...",
    },
  ];

  const subreddits = [
    {
      name: "r/gaming",
      activityLevel: 23,
      riskLevel: "low" as RiskLevel,
      riskScore: 9,
      riskRationale:
        "General gaming discussions. Minimal concerning content. Strong moderation.",
      dominantTopics: ["Game Reviews", "Tips & Tricks", "Gaming News"],
      url: "https://reddit.com/r/gaming",
    },
    {
      name: "r/teenagers",
      activityLevel: 15,
      riskLevel: "medium" as RiskLevel,
      riskScore: 5,
      riskRationale:
        "Teen community with varied content. Some discussions about mental health and peer pressure. Moderate monitoring recommended.",
      dominantTopics: ["School Life", "Relationships", "Mental Health"],
      url: "https://reddit.com/r/teenagers",
    },
    {
      name: "r/minecraft",
      activityLevel: 18,
      riskLevel: "low" as RiskLevel,
      riskScore: 10,
      riskRationale:
        "Family-friendly gaming community. Strong moderation and positive interactions.",
      dominantTopics: ["Building", "Multiplayer", "Game Updates"],
      url: "https://reddit.com/r/minecraft",
    },
    {
      name: "r/anxiety",
      activityLevel: 8,
      riskLevel: "medium" as RiskLevel,
      riskScore: 4,
      riskRationale:
        "Mental health support community. Contains discussions of anxiety and stress. Monitor for concerning patterns.",
      dominantTopics: ["Coping Strategies", "Support", "Personal Stories"],
      url: "https://reddit.com/r/anxiety",
    },
  ];

  const currentChild =
    children.find((c) => c.id === selectedChild) || children[0];

  const clearFilters = () => {
    setSearchValue("");
    setRiskFilter("all");
    setDateFilter("7days");
    setSubredditFilter("all");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Activity Monitor
          </h1>
          <p className="text-red-800/80 mt-1">
            Detailed breakdown of interactions and risk factors.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border">
          <Avatar className="h-10 w-10 border-2 border-background bg-white">
            <AvatarFallback className="bg-red-50 text-red-600 font-bold">
              {currentChild.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Monitoring
            </span>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[160px] h-7 border-none shadow-none bg-transparent p-0 text-sm font-semibold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} ({child.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="interactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="interactions"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
          >
            Interactions
          </TabsTrigger>
          <TabsTrigger
            value="subreddits"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
          >
            Subreddits
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        {/* INTERACTIONS TAB */}
        <TabsContent value="interactions" className="space-y-6 mt-0">
          <Card className="border-t-4 border-t-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                All posts and comments with sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                showRiskFilter
                riskFilter={riskFilter}
                onRiskFilterChange={setRiskFilter}
                showDateFilter
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                showSubredditFilter
                subredditFilter={subredditFilter}
                onSubredditFilterChange={setSubredditFilter}
                onClearFilters={clearFilters}
              />

              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className={`
                      relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md
                      ${
                        interaction.risk === "medium"
                          ? "border-orange-200 bg-orange-50/30 hover:border-orange-300"
                          : ""
                      }
                      ${
                        interaction.risk === "high"
                          ? "border-red-200 bg-red-50/30 hover:border-red-300"
                          : "hover:border-red-200/50"
                      }
                    `}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="bg-white">
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
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span>{interaction.timestamp}</span>
                        </div>
                        <RiskIndicator
                          level={interaction.risk}
                          showIcon={true}
                        />
                      </div>

                      <p className="text-base leading-relaxed text-foreground/90 pl-1 border-l-2 border-muted group-hover:border-red-300 transition-colors">
                        "{interaction.content}"
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Sentiment
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              interaction.risk === "medium"
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
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
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View on Reddit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBREDDITS TAB */}
        <TabsContent value="subreddits" className="space-y-6 mt-0">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscribed Subreddits</CardTitle>
                  <CardDescription>
                    Communities your child is active in, ranked by engagement
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  {["all", "top5", "top10"].map((filter) => (
                    <Button
                      key={filter}
                      variant={
                        subredditRankFilter === filter ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSubredditRankFilter(filter)}
                      className="h-7 text-xs capitalize"
                    >
                      {filter === "all" ? "All" : filter.replace("top", "Top ")}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {subreddits.map((subreddit, index) => (
                  <SubredditCard key={index} {...subreddit} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-sm bg-gradient-to-br from-white to-red-50/20 border-red-100">
              <CardHeader>
                <CardTitle className="text-red-900">
                  Generate Activity Report
                </CardTitle>
                <CardDescription>
                  Export comprehensive reports of {currentChild.name}'s Reddit
                  activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Report Format</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select defaultValue="30days">
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-xl bg-white/50">
                  <Checkbox
                    id="anonymize"
                    checked={anonymizeReport}
                    onCheckedChange={(checked) =>
                      setAnonymizeReport(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="anonymize"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                  >
                    Anonymize child's username in report
                  </label>
                </div>

                <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all">
                  <FileDown className="h-5 w-5 mr-2" />
                  Generate & Export Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-slate-100">
                  Report Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Complete activity timeline",
                    "Risk assessment summary",
                    "Subreddit engagement metrics",
                    "Sentiment analysis breakdown",
                    "Conversation starters",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reports are generated securely. No data is shared with third
                    parties unless explicitly authorized.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
