"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  className?: string;
  children?: React.ReactNode;
}
const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  children,
  className = "",
}) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "py-2 px-4 lg:px-10 flex justify-between items-center mb-4",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Button
          onClick={() => (onBack ? onBack() : router.back())}
          variant="ghost"
          size="icon"
        >
          <ChevronLeft className="size-8" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {!children ? "" : children}
    </div>
  );
};
export default Header;
