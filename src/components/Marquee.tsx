import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
  className?: string;
}

export function Marquee({
  children,
  reverse = false,
  pauseOnHover = true,
  speed = 40,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`group flex overflow-hidden select-none gap-4 ${className}`}>
      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-4 animate-marquee ${
          reverse ? "direction-reverse" : ""
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-4">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
