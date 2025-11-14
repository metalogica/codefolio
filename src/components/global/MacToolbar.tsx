import { useState, useEffect } from "react";
import { MdWifi } from "react-icons/md";
import { FaApple } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";

export default function MacToolbar() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatMacDate = (date: Date) => {
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const hour = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });
    const minute = date.getMinutes().toString().padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";

    return `${weekday} ${month} ${day} ${hour.replace(
      /\s?[AP]M/,
      ""
    )}:${minute} ${period}`;
  };

  return (
    <div className="sticky top-0 z-50 hidden md:flex bg-black/20 backdrop-blur-md text-white h-6 px-4 items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        <FaApple size={16} />
        <span className="font-semibold cursor-default">rei jarram</span>
        <span className="cursor-default">File</span>
        <span className="cursor-default">Edit</span>
        <span className="cursor-default">View</span>
        <span className="cursor-default">Go</span>
        <span className="cursor-default">Window</span>
        <span className="cursor-default">Help</span>
      </div>
      <div className="flex items-center space-x-4">
        <MdWifi size={16} />
        <IoSearchSharp size={16} />
        <span className="cursor-default">
          {formatMacDate(currentDateTime)}
        </span>
      </div>
    </div>
  );
}
