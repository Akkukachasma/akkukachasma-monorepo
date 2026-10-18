import React from "react";
import { CheckCircle } from "lucide-react";

const Verified: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted animate-smooth">
      <div className="w-full max-w-[90%] sm:max-w-[500px] p-6 sm:p-8 bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center justify-center gap-4 sm:gap-6 text-center animate-fade-in">
        {/* Icon with animation */}
        <div className="p-4 bg-success/10 rounded-full animate-bounce">
          <CheckCircle className="w-16 h-16 text-success" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-accent-foreground">
          Thank you!
        </h2>

        {/* Description with animation */}
        <p className="text-sm sm:text-lg text-success animate-pulse">
          Email successfully verified!
        </p>
      </div>
    </div>
  );
};

export default Verified;
