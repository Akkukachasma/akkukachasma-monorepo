"use client";

import { Button } from "@/components/ui/button";
import Google from "@/components/icons/Google";
import { baseURL } from "@/lib/api";

interface ContinueWithGoogleProps {
    disabled?: boolean;
}

const ContinueWithGoogle: React.FC<ContinueWithGoogleProps> = ({ disabled }) => {
    const handleGoogleContinue = () => {
        if (disabled) return;
        window.location.assign(`${baseURL}/auth/google`);
    };

    return (
        <Button
            variant="outline"
            type="button"
            disabled={disabled}
            onClick={handleGoogleContinue}
        >
            <Google className="size-4" />
            <span className="ml-2">Continue with Google</span>
        </Button>
    )
}
export default ContinueWithGoogle;