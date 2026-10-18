import React from "react";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

type TokenExpiredProps = {
  message: string;
  onClick: () => void;
};

const TokenExpired: React.FC<TokenExpiredProps> = ({ message, onClick }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted animate-smooth">
      <div className="w-full max-w-[90%] sm:max-w-[500px] p-6 sm:p-8 bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center justify-center gap-4 sm:gap-6 text-center animate-fade-in">
        {/* Icon with animation */}
        <div className="p-4 bg-destructive/10 rounded-full animate-bounce">
          <CircleX className="w-16 h-16 text-destructive" />
        </div>

        {/* Title with animation */}
        <h2 className="text-2xl sm:text-3xl font-bold text-destructive animate-pulse">
          {message}
        </h2>

        {/* Button */}
        <Button
          onClick={onClick}
          className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300"
        >
          Resend Verification Link
        </Button>
      </div>
    </div>
  );
};

export default TokenExpired;
