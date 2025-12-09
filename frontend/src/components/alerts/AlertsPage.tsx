import { useState } from "react";
import { useEffect } from "react";
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

  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
      const fetchAlerts = async () => {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:8000/api/alerts/", {
              headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) setAlerts(await res.json());
      };
      fetchAlerts();
  }, []);

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
      {/* --- HEADER SECTION (Đã sửa Dark Mode) --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 
        p-6 rounded-2xl border shadow-sm
        bg-gradient-to-r from-red-50 to-white border-red-100 
        dark:from-red-950/30 dark:to-slate-950 dark:border-red-900/50"> 
        {/* ^^^ Thêm dark:from... dark:to... dark:border... */}
        
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 
            text-red-950 dark:text-red-100"> {/* ^^^ Sửa màu chữ tiêu đề */}
            <Bell className="h-6 w-6 text-red-500 fill-red-500" />
            Alerts & Notifications
          </h1>
          <p className="mt-1 text-base 
            text-red-800/80 dark:text-red-200/70"> {/* ^^^ Sửa màu chữ mô tả */}
            {unreadCount} unread {unreadCount === 1 ? "alert" : "alerts"}{" "}
            requiring your attention.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className="shadow-sm border-red-200 
            bg-white text-red-700 hover:bg-red-50 hover:text-red-800 
            dark:bg-slate-900 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showAcknowledged ? "Hide" : "Show"} Acknowledged
        </Button>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground"> {/* Thêm text-foreground */}
                Recent Activity
              </CardTitle>
              <CardDescription>
                Manage alerts from all monitored accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-6">
          {/* --- FILTERS (Đã sửa Dark Mode) --- */}
          <div className="p-4 rounded-xl border shadow-sm 
            bg-white border-slate-200
            dark:bg-slate-900 dark:border-slate-800">
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
              /* --- EMPTY STATE (Đã sửa Dark Mode) --- */
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed
                bg-white border-slate-200
                dark:bg-slate-900/50 dark:border-slate-800">
                <div className="p-4 rounded-full mb-4 bg-slate-50 dark:bg-slate-800">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  All Caught Up!
                </h3>
                <p className="max-w-sm mt-2 text-slate-500 dark:text-slate-400">
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
                  /* --- ALERT CARD (Đã sửa Dark Mode) --- */
                  className={`group transition-all border-l-4 hover:shadow-md dark:bg-slate-900
                    ${
                      alert.acknowledged
                        ? "opacity-75 bg-slate-50 border-l-slate-300 border-y-slate-200 border-r-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
                        : alert.severity === "high"
                        ? "bg-white border-l-red-500 border-red-100 dark:border-red-900 dark:border-l-red-600"
                        : "bg-white border-l-orange-400 border-orange-100 dark:border-orange-900 dark:border-l-orange-500"
                    }
                  `}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      {/* User Avatar & Badges */}
                      <div className="flex items-start gap-4 min-w-[200px]">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm dark:border-slate-800">
                          <AvatarFallback
                            className={`${
                              alert.severity === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200"
                            }`}
                          >
                            {alert.childAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {alert.childName}
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-normal bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {alert.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
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
                              className="text-[10px] h-5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            >
                              <VolumeX className="h-3 w-3 mr-1" /> Muted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 md:pl-4 md:border-l border-slate-100 dark:border-slate-800">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm w-full justify-start dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
                            className="flex-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
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
                            className="flex-1 text-slate-500 hover:text-primary hover:bg-primary/5 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-primary/10"
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