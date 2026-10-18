import { Building2 } from "lucide-react";
import Link from "next/link";
import WhatsappIcon from "./icons/WhatsappIcon";

const UnderConstruction = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Icon and Title */}
        <div className="space-y-4">
          <Building2 className="w-20 h-20 mx-auto text-primary animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Under Construction
          </h1>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-lg md:text-xl text-muted-foreground">
            We're working hard to bring you something amazing.
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            Meanwhile, feel free to reach out to us on WhatsApp for any queries.
          </p>
        </div>

        {/* WhatsApp Button */}
        <Link
          href="https://api.whatsapp.com/send/?phone=918188881661&text=Hello%21+%0AI%E2%80%99m+interested+in+one+of+your+product+so+plz+contact+me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl animate-smooth"
        >
          <WhatsappIcon className="w-5 h-5" />
          <span className="font-medium">Chat with us on WhatsApp</span>
        </Link>

        {/* Additional Info */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Coming Soon • Stay Tuned</p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-grid-primary/[0.05] bg-[size:20px_20px]" />
      </div>
    </div>
  );
};

export default UnderConstruction;