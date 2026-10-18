'use client'
import React from "react";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NotFound: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted animate-smooth">
      <div className="w-full max-w-[500px] p-8 bg-card rounded-3xl shadow-2xl border border-border/50 flex flex-col items-center justify-center gap-6 text-center animate-fade-in">
        {/* Icon with animation */}
        <div className="p-4 bg-accent/10 rounded-full animate-bounce">
          <Ghost className="w-16 h-16 text-accent-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-accent-foreground">404</h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link href="/">
            <Button
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300"
            >
              Home
            </Button>
          </Link>
          <Button
            onClick={() => router.back()}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all duration-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;