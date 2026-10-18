import React from "react";
import { Loader } from "lucide-react";

const Verifying: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted animate-smooth">
      <div className="w-full max-w-[90%] sm:max-w-[500px] p-6 sm:p-8 bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center justify-center gap-4 sm:gap-6 text-center animate-fade-in">
        {/* Spinner with animation */}
        <div className="p-3 sm:p-4 bg-accent/10 rounded-full animate-spin-slow">
          <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-accent-foreground" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-accent-foreground">
          Please wait!
        </h2>

        {/* Description with pulsating animation */}
        <p className="text-sm sm:text-lg text-muted-foreground animate-pulse">
          Email Verifying ...
        </p>
      </div>
    </div>
  );
};

export default Verifying;
