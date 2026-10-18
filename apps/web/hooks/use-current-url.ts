import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const useCurrentUrl = () => {
  const [url, setUrl] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    setUrl((prev) =>
      window.location.href !== prev ? window.location.href : prev,
    );
  });

  return url;
};
export default useCurrentUrl;
