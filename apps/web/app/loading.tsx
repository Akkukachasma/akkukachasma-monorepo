import { LoaderOverlay } from "@/features/route-loader";
import { Loader2 } from "lucide-react";

const GlobalLoader = () => {
    return(
        <LoaderOverlay phase="entering" />
    )
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="sr-only">Loading...</p>
        </div>
    )
}
export default GlobalLoader;