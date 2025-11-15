import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RiskIndicator } from "../shared/RiskIndicator";
import { ActivityChart } from "../shared/ActivityChart";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, MessageSquare, FileText, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface DashboardProps {
  onViewChild: () => void;
}

export function Dashboard({ onViewChild }: DashboardProps) {
  const [selectedChild, setSelectedChild] = useState("emma");

  const children = [
    { id: "emma", name: "Emma", age: 14, avatar: "E" },
    { id: "lucas", name: "Lucas", age: 12, avatar: "L" }
  ];

  const activityData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 8 },
    { name: "Thu", value: 15 },
    { name: "Fri", value: 22 },
    { name: "Sat", value: 18 },
    { name: "Sun", value: 14 }
  ];

  const topRiskySubreddits = [
    { name: "r/teenagers", risk: "medium" as const, engagement: 45 },
    { name: "r/anxiety", risk: "medium" as const, engagement: 23 },
    { name: "r/askteens", risk: "low" as const, engagement: 18 },
    { name: "r/gaming", risk: "low" as const, engagement: 67 },
    { name: "r/minecraft", risk: "low" as const, engagement: 34 }
  ];

  const currentChild = children.find(c => c.id === selectedChild) || children[0];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12 bg-primary">
            <AvatarFallback className="text-primary-foreground">
              {currentChild.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full max-w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} ({child.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Alerts Summary */}
      <Alert className="border-[#dc3545] bg-[#f8d7da]">
        <AlertCircle className="h-4 w-4 text-[#dc3545]" />
        <AlertDescription className="text-[#dc3545]">
          <span>3 New High-Risk Items detected for {currentChild.name}. </span>
          <button 
            onClick={onViewChild}
            className="underline hover:no-underline"
          >
            View details
          </button>
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Posts Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">5</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Comments Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">12</div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Subreddits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">18</div>
            <p className="text-xs text-muted-foreground">
              Active communities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Weekly Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">108</div>
            <p className="text-xs text-muted-foreground">
              Total interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <ActivityChart 
        title="Activity This Week"
        data={activityData}
        type="bar"
      />

      {/* Top 5 Riskiest Subreddits */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Riskiest Subreddits This Week</CardTitle>
          <CardDescription>
            Ranked by risk level and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRiskySubreddits.map((subreddit, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={onViewChild}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                  <span>{subreddit.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{subreddit.engagement} posts</Badge>
                  <RiskIndicator level={subreddit.risk} showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emerging Harmful Trends */}
      <Card className="border-[#ffc107] bg-[#fff3cd]">
        <CardHeader>
          <CardTitle>Emerging Harmful Trends (Global)</CardTitle>
          <CardDescription className="text-[#856404]">
            New concerning patterns detected across monitored accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[#856404] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#856404]">
                  <span className="font-medium">"Blackout Challenge"</span> - Dangerous viral trend detected in 12 communities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[#856404] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#856404]">
                  <span className="font-medium">Increase in self-harm content</span> - 34% rise in r/depression discussions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
