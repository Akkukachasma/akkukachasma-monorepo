import React from "react";

const PartnerLogo: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="flex items-center justify-center h-16 rounded-lg border bg-background/50 hover:bg-accent transition-colors duration-200">
      {/* Replace this with actual logo image */}
      <div className="text-sm font-medium text-muted-foreground">{name}</div>
    </div>
  );
};
export default PartnerLogo;
