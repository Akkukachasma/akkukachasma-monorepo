import { LucideIcon } from "lucide-react";

interface FreatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FreatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent">
      <Icon className="h-8 w-8 text-primary" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
