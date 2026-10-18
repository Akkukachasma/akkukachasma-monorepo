import { cn } from "@/lib/utils";
interface ReceiptDetailProps {
  title: string;
  value: string | number;
  extraBold?: boolean;
}
const ReceiptDetail: React.FC<ReceiptDetailProps> = ({
  title,
  value,
  extraBold = false,
}) => {
  return (
    <div className="flex items-center justify-between tracking-tight">
      <h4
        className={cn(
          "text-foreground/50 text-lg",
          extraBold && "font-bold text-xl",
        )}
      >
        {title}
      </h4>
      <p
        className={cn(
          "text-foreground/70 text-lg",
          extraBold && "font-bold text-xl",
        )}
      >
        {value}
      </p>
    </div>
  );
};
export default ReceiptDetail;
