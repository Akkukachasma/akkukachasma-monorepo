import { IconInterface } from "@/lib/types";
import React from "react";
const NotificationIcon: React.FC<IconInterface & { filled?: boolean }> = ({
  filled = false,
  ...rest
}) => {
  if (filled) {
    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1.6em"
        width="1.6em"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <path d="M6 8a6 6 0 1 1 12 0v2.917c0 .703.228 1.387.65 1.95L20.7 15.6a1.5 1.5 0 0 1-1.2 2.4h-15a1.5 1.5 0 0 1-1.2-2.4l2.05-2.733a3.25 3.25 0 0 0 .65-1.95Zm6 13.5A3.502 3.502 0 0 1 8.645 19h6.71A3.502 3.502 0 0 1 12 21.5Z"></path>
      </svg>
    );
  }

  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="1.6em"
      width="1.6em"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M12 1c3.681 0 7 2.565 7 6v4.539c0 .642.189 1.269.545 1.803l2.2 3.298A1.517 1.517 0 0 1 20.482 19H15.5a3.5 3.5 0 1 1-7 0H3.519a1.518 1.518 0 0 1-1.265-2.359l2.2-3.299A3.25 3.25 0 0 0 5 11.539V7c0-3.435 3.318-6 7-6ZM6.5 7v4.539a4.75 4.75 0 0 1-.797 2.635l-2.2 3.298-.003.01.001.007.004.006.006.004.007.001h16.964l.007-.001.006-.004.004-.006.001-.006a.017.017 0 0 0-.003-.01l-2.199-3.299a4.753 4.753 0 0 1-.798-2.635V7c0-2.364-2.383-4.5-5.5-4.5S6.5 4.636 6.5 7ZM14 19h-4a2 2 0 1 0 4 0Z"></path>
    </svg>
  );
};

export default NotificationIcon;
