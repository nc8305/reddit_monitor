import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { RiskIndicator, RiskLevel } from "../shared/RiskIndicator";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FilterBar } from "../shared/FilterBar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Check, Volume2, VolumeX, ExternalLink, AlertCircle } from "lucide-react";

interface Alert {
  id: number;
  childName: string;
  childAvatar: string;
  severity: RiskLevel;
  category: string;
  title: string;
  description: string;
  timestamp: string;
  url: string;
  acknowledged: boolean;
  muted: boolean;
}

export function AlertsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      childName: "Emma",
      childAvatar: "E",
      severity: "high",
      category: "Self-Harm",
      title: "High-risk content detected",
      description: "Posted in r/depression about feeling hopeless",
      timestamp: "2 hours ago",
      url: "https://reddit.com/...",
      acknowledged: false,
      muted: false
    },
    {
      id: 2,
      childName: "Emma",
      childAvatar: "E",
      severity: "high",
      category: "Mental Health",
      title: "Concerning language pattern",
      description: "Comment contains phrases associated with anxiety",
      timestamp: "5 hours ago",
      url: "https://reddit.com/...",
      acknowledged: false,
      muted: false
    },
    {
      id: 3,
      childName: "Lucas",
      childAvatar: "L",
      severity: "medium",
      category: "Profanity",
      title: "Inappropriate language used",
      description: "Comment in r/gaming contains profanity",
      timestamp: "1 day ago",
      url: "https://reddit.com/...",
      acknowledged: true,
      muted: false
    },
    {
      id: 4,
      childName: "Emma",
      childAvatar: "E",
      severity: "medium",
      category: "Peer Pressure",
      title: "Potential peer pressure detected",
      description: "Discussion about trying something 'everyone else is doing'",
      timestamp: "2 days ago",
      url: "https://reddit.com/...",
      acknowledged: true,
      muted: false
    },
  ]);

  const acknowledgeAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const muteAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, muted: !alert.muted } : alert
    ));
  };

  const clearFilters = () => {
    setSearchValue("");
    setRiskFilter("all");
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (riskFilter !== "all" && alert.severity !== riskFilter) return false;
    if (searchValue && !alert.title.toLowerCase().includes(searchValue.toLowerCase()) &&
        !alert.description.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAcknowledged(!showAcknowledged)}
        >
          {showAcknowledged ? "Hide" : "Show"} Acknowledged
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>
            Review and manage alerts from all monitored children
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            showRiskFilter
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
            onClearFilters={clearFilters}
          />

          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No alerts to display</p>
                <p className="text-sm">
                  {showAcknowledged ? "Try showing acknowledged alerts" : "All alerts have been acknowledged"}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`transition-all ${
                    alert.acknowledged ? "opacity-60" : ""
                  } ${alert.muted ? "border-muted" : ""}`}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10 bg-primary">
                            <AvatarFallback className="text-primary-foreground">
                              {alert.childAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span>{alert.childName}</span>
                              <Badge variant="outline">{alert.category}</Badge>
                              <RiskIndicator level={alert.severity} showIcon={false} />
                              {alert.muted && (
                                <Badge variant="secondary" className="text-xs">
                                  <VolumeX className="h-3 w-3 mr-1" />
                                  Muted
                                </Badge>
                              )}
                            </div>
                            <h4 className="mb-1">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {alert.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {alert.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        {!alert.acknowledged && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => muteAlert(alert.id)}
                        >
                          {alert.muted ? (
                            <Volume2 className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <VolumeX className="h-3.5 w-3.5 mr-1" />
                          )}
                          {alert.muted ? "Unmute" : "Mute"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(alert.url, '_blank')}
                          className="ml-auto"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
