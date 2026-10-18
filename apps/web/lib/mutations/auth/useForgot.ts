import useSessionStorage from "@/hooks/use-session-storage";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useToast } from "@/lib/hooks/use-toast";
import { forgotPasswordSchema } from "@/lib/validations/auth.validation";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import z from "zod";

const useForgot = () => {
  const { toast } = useToast();
  const { setValue: setEmail } = useSessionStorage<string>("reset_email");
  const api = getApiClient();
  const [wait, setWait] = React.useState<number>(0);
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof forgotPasswordSchema>) => {
      const response = await api.post(ENDPOINTS.AUTH.forgot, data);
      return response.data;
    },
    onSuccess: (response) => {
      const { data, message } = response;
      setEmail(data.email);
      toast({
        title: "Email sent",
        description: message,
        variant: "success",
      });
      const resendEmail = window.localStorage.getItem("resend_email");
      if (resendEmail) {
        const { attempt } = JSON.parse(resendEmail);
        window.localStorage.setItem(
          "resend_email",
          JSON.stringify({ attempt: attempt + 1, wait: (attempt + 1) * 30 }),
        );
        setWait((attempt + 1) * 30);
      } else {
        window.localStorage.setItem(
          "resend_email",
          JSON.stringify({ attempt: 1, wait: 30 }),
        );
        setWait(30);
      }

      // Attach the beforeunload event listener here
      const handleBeforeUnload = () => {
        window.localStorage.removeItem("resend_email");
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
    },
  });

  React.useEffect(() => {
    const resendEmail = window.localStorage.getItem("resend_email");
    if (resendEmail) {
      const { attempt, wait } = JSON.parse(resendEmail);
      if (attempt < 3 && wait > 0) {
        setWait(wait);
      }
    }
  }, []);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (wait > 0) {
      const resendEmail = window.localStorage.getItem("resend_email");
      if (resendEmail) {
        const { attempt } = JSON.parse(resendEmail);
        intervalId = setInterval(() => {
          setWait((prevWait) => prevWait - 1);
          window.localStorage.setItem(
            "resend_email",
            JSON.stringify({ attempt, wait: wait - 1 }),
          );
        }, 1000);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [wait]);

  return { ...mutation, wait };
};
export default useForgot;
