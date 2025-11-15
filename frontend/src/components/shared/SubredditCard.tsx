import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RiskIndicator, RiskLevel } from "./RiskIndicator";
import { ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";

interface SubredditCardProps {
  name: string;
  activityLevel: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskRationale: string;
  dominantTopics: string[];
  url: string;
}

export function SubredditCard({
  name,
  activityLevel,
  riskLevel,
  riskScore,
  riskRationale,
  dominantTopics,
  url
}: SubredditCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{activityLevel} posts/day</span>
            </div>
          </div>
          <RiskIndicator level={riskLevel} score={riskScore} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Risk Assessment:</p>
            <p className="text-sm">{riskRationale}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Dominant Topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {dominantTopics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View on Reddit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
