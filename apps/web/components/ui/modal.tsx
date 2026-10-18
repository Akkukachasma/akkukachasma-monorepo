import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./dialog";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showCloseIcon?: boolean;
  className?: string;
  fullScreen?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  showCloseIcon = true,
  fullScreen = false,
  className = "",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[85vh]",
          fullScreen && "max-w-screen min-h-screen max-h-screen",
          className,
        )}
        showCloseIcon={showCloseIcon}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
