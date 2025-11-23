import { Badge } from "../ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

export type RiskLevel = "low" | "medium" | "high";

interface RiskIndicatorProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function RiskIndicator({ 
  level, 
  score, 
  showIcon = true, 
  showLabel = true,
  className = ""
}: RiskIndicatorProps) {
  const config = {
    low: {
      color: "bg-[#d4edda] text-[#28a745] border-[#28a745]/20",
      icon: CheckCircle,
      label: "OK"
    },
    medium: {
      color: "bg-[#fff3cd] text-[#856404] border-[#ffc107]/20",
      icon: AlertTriangle,
      label: "Warning"
    },
    high: {
      color: "bg-[#f8d7da] text-[#dc3545] border-[#dc3545]/20",
      icon: AlertCircle,
      label: "High Risk"
    }
  };

  const { color, icon: Icon, label } = config[level];

  return (
    <Badge 
      variant="outline" 
      className={`${color} border ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 mr-1" />}
      {showLabel && <span>{label}</span>}
      {score !== undefined && <span className="ml-1">{score}/10</span>}
    </Badge>
  );
}
