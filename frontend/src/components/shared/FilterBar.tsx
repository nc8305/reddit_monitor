import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showRiskFilter?: boolean;
  riskFilter?: string;
  onRiskFilterChange?: (value: string) => void;
  showDateFilter?: boolean;
  dateFilter?: string;
  onDateFilterChange?: (value: string) => void;
  showSubredditFilter?: boolean;
  subredditFilter?: string;
  onSubredditFilterChange?: (value: string) => void;
  onClearFilters?: () => void;
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  showRiskFilter = false,
  riskFilter = "all",
  onRiskFilterChange,
  showDateFilter = false,
  dateFilter = "7days",
  onDateFilterChange,
  showSubredditFilter = false,
  subredditFilter = "all",
  onSubredditFilterChange,
  onClearFilters
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by keyword..."
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {showDateFilter && (
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showRiskFilter && (
        <Select value={riskFilter} onValueChange={onRiskFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showSubredditFilter && (
        <Select value={subredditFilter} onValueChange={onSubredditFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subreddits</SelectItem>
            <SelectItem value="r/gaming">r/gaming</SelectItem>
            <SelectItem value="r/teenagers">r/teenagers</SelectItem>
            <SelectItem value="r/minecraft">r/minecraft</SelectItem>
          </SelectContent>
        </Select>
      )}

      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}
