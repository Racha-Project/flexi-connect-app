import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Project {
  id: string;
  title: string;
  thumbnail: string | null;
  slug: string;
  category: string | null;
}

interface ProjectSliderProps {
  projects: Project[];
}

export function ProjectSlider({ projects }: ProjectSliderProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextProject = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const prevProject = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    const timer = setInterval(nextProject, 5000);
    return () => clearInterval(timer);
  }, [nextProject]);

  if (!projects.length) return null;

  const project = projects[index];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="group relative z-10 aspect-[4/5] w-full overflow-hidden rounded-[3rem] border-2 border-border/40 bg-surface shadow-2xl">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={project.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 h-full w-full"
        >
          {project.thumbnail && (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-8 pt-20 text-white">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">
              <span className="rounded-full bg-primary/20 px-2 py-0.5 backdrop-blur-md">
                {project.category}
              </span>
            </div>
            <h3 className="font-display mt-3 text-3xl font-black italic tracking-tighter">
              {project.title}
            </h3>
            <Link
              to="/portfolio/$slug"
              params={{ slug: project.slug }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              View Project <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Controls */}
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevProject();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextProject();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-1.5">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Advertisement Badge */}
      <div className="absolute left-8 top-8 z-20 rounded-full bg-primary/90 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-primary-foreground shadow-glow">
        Featured Work
      </div>
    </div>
  );
}
