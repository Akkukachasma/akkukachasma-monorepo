import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const WomenFashionBanner = () => {
  return (
    <Card className="w-full border-none bg-card shadow-none">
      <div className="bg-muted py-6">
        <div className="pt-2 text-center text-lg font-normal tracking-wider text-foreground md:text-xl">
          Save Up | What a great Deal | Don't think Do It!
        </div>
        <div className="py-2 text-center">
          <h1 className="py-2 text-xl font-bold tracking-wider text-foreground md:text-3xl">
            OMG! JUST LOOK AT THE GREAT DEALS!
          </h1>
        </div>
      </div>
      <CardContent>
        <div className="relative">
          <Image
            src="/banner5.png"
            alt="GalleryImages"
            width={200}
            height={100}
            className="w-full object-cover max-h-96"
          />
          <div className="py-6 flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative text-center">
              <p className="px-2 py-2 text-sm uppercase tracking-widest text-muted-foreground sm:text-lg md:text-lg">
                save up to 30% off
              </p>
              <h2 className="text-lg font-bold tracking-widest sm:text-2xl md:text-3xl lg:text-7xl">
                <span className="text-sky-500 dark:text-sky-400">women</span>
                <span className="text-blue-900 dark:text-blue-200">fashion</span>
              </h2>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WomenFashionBanner;
