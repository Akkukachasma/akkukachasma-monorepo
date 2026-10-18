import React, { useLayoutEffect, useState } from "react";

const useDimension = (ref?: React.RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (ref?.current) {
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
      } else {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ref]);

  return { width, height };
};

export default useDimension;