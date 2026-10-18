import React from "react";

const useCopy = () => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return { isCopied, copyText };
};

export default useCopy;
