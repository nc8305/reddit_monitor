import { useEffect, useState } from "react";
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
import { Flame, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TrendsList() {
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/trends/emerging", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setTrends(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
  
  if (trends.length === 0) return <div className="text-center p-10 text-muted-foreground">Chưa có đủ dữ liệu để phân tích xu hướng.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-500">
      {trends.map((trend) => (
        <Card
          key={trend.id}
          className={`border-t-4 shadow-sm hover:shadow-md transition-all ${
            trend.severity === "high"
              ? "border-t-red-500 border-x-red-100 border-b-red-100 dark:border-red-900/50 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/10"
              : "border-t-blue-400 border-x-blue-100 border-b-blue-100 dark:border-blue-900/50 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/10"
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
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
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
                  Communities
                </p>
                <p className="text-lg font-semibold">
                  {trend.communities} subreddits
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Volume
                </p>
                <p className="text-lg font-semibold">
                  {trend.mentions} posts
                </p>
              </div>
            </div>

            <div className="h-[180px] w-full mt-2">
              <ActivityChart
                title=""
                data={trend.data}
                type="line"
                color={trend.severity === "high" ? "#ef4444" : "#0ea5e9"}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}