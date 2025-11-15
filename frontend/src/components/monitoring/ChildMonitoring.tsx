import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FilterBar } from "../shared/FilterBar";
import { RiskIndicator, RiskLevel } from "../shared/RiskIndicator";
import { SubredditCard } from "../shared/SubredditCard";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ExternalLink, FileDown, MessageSquare, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export function ChildMonitoring() {
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");
  const [subredditFilter, setSubredditFilter] = useState("all");
  const [subredditRankFilter, setSubredditRankFilter] = useState("all");
  const [anonymizeReport, setAnonymizeReport] = useState(false);

  const interactions = [
    {
      id: 1,
      type: "comment" as const,
      content: "I love playing Minecraft with my friends! Just built an awesome castle.",
      subreddit: "r/minecraft",
      timestamp: "2 hours ago",
      sentiment: "Positive",
      risk: "low" as RiskLevel,
      url: "https://reddit.com/r/minecraft/..."
    },
    {
      id: 2,
      type: "post" as const,
      content: "Does anyone else feel like they're never good enough? I'm struggling with school lately.",
      subreddit: "r/teenagers",
      timestamp: "5 hours ago",
      sentiment: "Warning: Mental Health",
      risk: "medium" as RiskLevel,
      url: "https://reddit.com/r/teenagers/..."
    },
    {
      id: 3,
      type: "comment" as const,
      content: "That's so stupid, why would anyone think that?",
      subreddit: "r/gaming",
      timestamp: "1 day ago",
      sentiment: "Warning: Profanity",
      risk: "medium" as RiskLevel,
      url: "https://reddit.com/r/gaming/..."
    },
    {
      id: 4,
      type: "comment" as const,
      content: "Thanks for the tips! This really helped me understand the game better.",
      subreddit: "r/gaming",
      timestamp: "2 days ago",
      sentiment: "Positive",
      risk: "low" as RiskLevel,
      url: "https://reddit.com/r/gaming/..."
    }
  ];

  const subreddits = [
    {
      name: "r/gaming",
      activityLevel: 23,
      riskLevel: "low" as RiskLevel,
      riskScore: 9,
      riskRationale: "General gaming discussions. Minimal concerning content. Strong moderation.",
      dominantTopics: ["Game Reviews", "Tips & Tricks", "Gaming News"],
      url: "https://reddit.com/r/gaming"
    },
    {
      name: "r/teenagers",
      activityLevel: 15,
      riskLevel: "medium" as RiskLevel,
      riskScore: 5,
      riskRationale: "Teen community with varied content. Some discussions about mental health and peer pressure. Moderate monitoring recommended.",
      dominantTopics: ["School Life", "Relationships", "Mental Health"],
      url: "https://reddit.com/r/teenagers"
    },
    {
      name: "r/minecraft",
      activityLevel: 18,
      riskLevel: "low" as RiskLevel,
      riskScore: 10,
      riskRationale: "Family-friendly gaming community. Strong moderation and positive interactions.",
      dominantTopics: ["Building", "Multiplayer", "Game Updates"],
      url: "https://reddit.com/r/minecraft"
    },
    {
      name: "r/anxiety",
      activityLevel: 8,
      riskLevel: "medium" as RiskLevel,
      riskScore: 4,
      riskRationale: "Mental health support community. Contains discussions of anxiety and stress. Monitor for concerning patterns.",
      dominantTopics: ["Coping Strategies", "Support", "Personal Stories"],
      url: "https://reddit.com/r/anxiety"
    }
  ];

  const clearFilters = () => {
    setSearchValue("");
    setRiskFilter("all");
    setDateFilter("7days");
    setSubredditFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <Avatar className="h-12 w-12 bg-primary">
          <AvatarFallback className="text-primary-foreground">E</AvatarFallback>
        </Avatar>
        <div>
          <h2>Emma's Activity</h2>
          <p className="text-sm text-muted-foreground">14 years old • Joined Reddit 2 years ago</p>
        </div>
      </div>

      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="subreddits">Subreddits</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                All posts and comments with sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <Card key={interaction.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {interaction.type === "post" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {interaction.type === "post" ? "Posted" : "Commented"} in{" "}
                              <span className="font-medium">{interaction.subreddit}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{interaction.timestamp}</span>
                          </div>
                          <RiskIndicator level={interaction.risk} showIcon={false} />
                        </div>

                        <p className="text-sm">{interaction.content}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Sentiment: <span className={interaction.risk === "medium" ? "text-[#856404]" : ""}>{interaction.sentiment}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(interaction.url, '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View on Reddit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subreddits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscribed Subreddits</CardTitle>
              <CardDescription>
                Communities your child is active in, ranked by engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={subredditRankFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubredditRankFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={subredditRankFilter === "top5" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubredditRankFilter("top5")}
                >
                  Top 5
                </Button>
                <Button
                  variant={subredditRankFilter === "top10" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubredditRankFilter("top10")}
                >
                  Top 10
                </Button>
                <Button
                  variant={subredditRankFilter === "top20" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubredditRankFilter("top20")}
                >
                  Top 20
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {subreddits.map((subreddit, index) => (
                  <SubredditCard key={index} {...subreddit} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Activity Report</CardTitle>
              <CardDescription>
                Export comprehensive reports of your child's Reddit activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Report Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Date Range</label>
                  <Select defaultValue="30days">
                    <SelectTrigger>
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymize"
                    checked={anonymizeReport}
                    onCheckedChange={(checked) => setAnonymizeReport(checked as boolean)}
                  />
                  <label
                    htmlFor="anonymize"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Anonymize child's username in report
                  </label>
                </div>
              </div>

              <Button className="w-full">
                <FileDown className="h-4 w-4 mr-2" />
                Generate & Export Report
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm mb-2">Report Includes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete activity timeline</li>
                  <li>• Risk assessment summary</li>
                  <li>• Subreddit engagement metrics</li>
                  <li>• Sentiment analysis breakdown</li>
                  <li>• Conversation starters and recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
