import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { RiskIndicator, RiskLevel } from "../shared/RiskIndicator";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FilterBar } from "../shared/FilterBar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  AlertCircle,
  Bell,
  Clock,
  Filter,
} from "lucide-react";

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
      muted: false,
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
      muted: false,
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
      muted: false,
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
      muted: false,
    },
  ]);

  const acknowledgeAlert = (id: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const muteAlert = (id: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, muted: !alert.muted } : alert
      )
    );
  };

  const clearFilters = () => {
    setSearchValue("");
    setRiskFilter("all");
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (!showAcknowledged && alert.acknowledged) return false;
    if (riskFilter !== "all" && alert.severity !== riskFilter) return false;
    if (
      searchValue &&
      !alert.title.toLowerCase().includes(searchValue.toLowerCase()) &&
      !alert.description.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-red-950 flex items-center gap-2">
            <Bell className="h-6 w-6 text-red-500 fill-red-500" />
            Alerts & Notifications
          </h1>
          <p className="text-red-800/80 mt-1 text-base">
            {unreadCount} unread {unreadCount === 1 ? "alert" : "alerts"}{" "}
            requiring your attention.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 shadow-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showAcknowledged ? "Hide" : "Show"} Acknowledged
        </Button>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Manage alerts from all monitored accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <FilterBar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              showRiskFilter
              riskFilter={riskFilter}
              onRiskFilterChange={setRiskFilter}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  All Caught Up!
                </h3>
                <p className="text-slate-500 max-w-sm mt-2">
                  No new alerts to display.{" "}
                  {showAcknowledged
                    ? "Try adjusting your filters."
                    : "Great job staying on top of things!"}
                </p>
                {!showAcknowledged && (
                  <Button
                    variant="link"
                    onClick={() => setShowAcknowledged(true)}
                    className="mt-4 text-primary"
                  >
                    View acknowledged history
                  </Button>
                )}
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`group transition-all border-l-4 hover:shadow-md
                    ${
                      alert.acknowledged
                        ? "opacity-75 bg-slate-50 border-l-slate-300 border-y-slate-200 border-r-slate-200"
                        : alert.severity === "high"
                        ? "bg-white border-l-red-500 border-red-100"
                        : "bg-white border-l-orange-400 border-orange-100"
                    }
                  `}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      {/* User Avatar & Badges */}
                      <div className="flex items-start gap-4 min-w-[200px]">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback
                            className={`${
                              alert.severity === "high"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {alert.childAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900">
                            {alert.childName}
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-normal bg-slate-50"
                          >
                            {alert.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">
                            {alert.title}
                          </h4>
                          <RiskIndicator
                            level={alert.severity}
                            showIcon={true}
                            showLabel={false}
                            className="h-5 px-1.5"
                          />
                          {alert.muted && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 bg-slate-100 text-slate-500"
                            >
                              <VolumeX className="h-3 w-3 mr-1" /> Muted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 md:pl-4 md:border-l border-slate-100">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm w-full justify-start"
                          >
                            <Check className="h-3.5 w-3.5 mr-2" />
                            Acknowledge
                          </Button>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => muteAlert(alert.id)}
                            className="flex-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title={
                              alert.muted
                                ? "Unmute notifications"
                                : "Mute notifications"
                            }
                          >
                            {alert.muted ? (
                              <Volume2 className="h-4 w-4" />
                            ) : (
                              <VolumeX className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(alert.url, "_blank")}
                            className="flex-1 text-slate-500 hover:text-primary hover:bg-primary/5"
                            title="View source"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
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
