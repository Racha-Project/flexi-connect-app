import { motion } from "framer-motion";
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
    <div className={`flex overflow-hidden select-none gap-4 ${className}`}>
      <motion.div
        animate={{
          x: reverse ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex min-w-full shrink-0 items-center justify-around gap-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-4">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
