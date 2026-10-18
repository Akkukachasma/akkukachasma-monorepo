import { LucideIcon } from "lucide-react";
import React from "react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label }) => {
  return (
    <div className="group rounded-lg p-4 text-center transition-colors hover:bg-accent">
      <div className="flex justify-center mb-2">
        <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};
export default StatCard;
