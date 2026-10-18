import React from "react";

type Dimension = { width: number; height: number };

const useDimensionObserver = () => {
  const [dimension, setDimension] = React.useState<Dimension>({
    height: 0,
    width: 0,
  });

  const handleResize = () => {
    setDimension({
      width: window.innerWidth || 0,
      height: window.innerHeight || 0,
    });
  };

  React.useEffect(() => {
    setDimension({
      width: window.innerWidth || 0,
      height: window.innerHeight || 0,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimension;
};

export default useDimensionObserver;
