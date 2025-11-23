import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ActivityChart } from "../shared/ActivityChart";
import { RiskIndicator } from "../shared/RiskIndicator";
import { Flame, TrendingUp } from "lucide-react";

export function TrendsList() {
  const emergingTrends = [
    {
      id: 1,
      name: "Blackout Challenge",
      severity: "high" as const,
      communities: 12,
      mentions: 234,
      change: "+89%",
      description:
        "Dangerous viral challenge involving intentional oxygen deprivation. Highly active in meme subreddits.",
      data: [
        { name: "Mon", value: 12 },
        { name: "Tue", value: 18 },
        { name: "Wed", value: 25 },
        { name: "Thu", value: 34 },
        { name: "Fri", value: 52 },
        { name: "Sat", value: 67 },
        { name: "Sun", value: 89 },
      ],
    },
    {
      id: 2,
      name: "Self-Harm Discussion Increase",
      severity: "medium" as const,
      communities: 8,
      mentions: 156,
      change: "+34%",
      description:
        "Significant rise in discussions about self-harm in teen communities.",
      data: [
        { name: "Mon", value: 20 },
        { name: "Tue", value: 22 },
        { name: "Wed", value: 26 },
        { name: "Thu", value: 28 },
        { name: "Fri", value: 31 },
        { name: "Sat", value: 34 },
        { name: "Sun", value: 40 },
      ],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {emergingTrends.map((trend) => (
        <Card
          key={trend.id}
          className={`overflow-y-scroll border-t-4 shadow-sm hover:shadow-md transition-all ${
            trend.severity === "high"
              ? "border-t-red-500 border-x-red-100 border-b-red-100 dark:border-red-900/50 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/10"
              : "border-t-orange-400 border-x-orange-100 border-b-orange-100 dark:border-orange-900/50 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10"
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{trend.name}</CardTitle>
                  {trend.severity === "high" && (
                    <Flame className="h-5 w-5 text-red-500 fill-red-500" />
                  )}
                </div>
                <RiskIndicator level={trend.severity} showIcon={true} />
              </div>
              <Badge
                className={`${
                  trend.severity === "high"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend.change}
              </Badge>
            </div>
            <CardDescription className="mt-2 text-base">
              {trend.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-black/5">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reach
                </p>
                <p className="text-lg font-semibold">
                  {trend.communities} communities
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Volume
                </p>
                <p className="text-lg font-semibold">
                  {trend.mentions} mentions
                </p>
              </div>
            </div>

            <div className="h-[180px] w-full mt-2">
              <ActivityChart
                title=""
                data={trend.data}
                type="line"
                color={trend.severity === "high" ? "#ef4444" : "#f97316"}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
