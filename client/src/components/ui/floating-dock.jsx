import { cn } from "../../lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      {open && (
        <div className="absolute inset-x-0 bottom-full mb-3 flex flex-col gap-2.5 items-center animate-rise">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setOpen(false);
                if (item.onClick) item.onClick();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#121218]/95 shadow-xl text-white backdrop-blur-xl active:scale-95 transition-transform"
            >
              <div className="h-5 w-5">{item.icon}</div>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#121218]/95 text-white shadow-2xl backdrop-blur-xl active:scale-95 transition-transform"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-[#50e3c2]" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div
      onMouseLeave={() => setHoveredIdx(null)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-3 rounded-2xl border border-white/15 bg-[#0e0e14]/90 px-4 pb-3 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        let scaleClass = "w-10 h-10";
        let iconScale = "w-5 h-5";

        if (hoveredIdx !== null) {
          const dist = Math.abs(hoveredIdx - idx);
          if (dist === 0) {
            scaleClass = "w-14 h-14 -translate-y-2";
            iconScale = "w-7 h-7";
          } else if (dist === 1) {
            scaleClass = "w-12 h-12 -translate-y-1";
            iconScale = "w-6 h-6";
          }
        }

        const content = (
          <div
            onMouseEnter={() => setHoveredIdx(idx)}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-full border border-white/10 bg-[#161622]/90 text-white shadow-lg backdrop-blur-md transition-all duration-200 ease-out hover:border-[#50e3c2]/50 hover:bg-[#1a1a28]",
              scaleClass
            )}
          >
            {hoveredIdx === idx && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-fit rounded-lg border border-white/15 bg-black/90 px-2.5 py-1 font-geist text-[11px] font-semibold tracking-wide text-white whitespace-pre shadow-xl backdrop-blur-xl pointer-events-none animate-rise">
                {item.title}
              </div>
            )}
            <div className={cn("flex items-center justify-center transition-all duration-200", iconScale)}>
              {item.icon}
            </div>
          </div>
        );

        if (item.href) {
          return (
            <a key={item.title} href={item.href} target="_blank" rel="noreferrer noopener">
              {content}
            </a>
          );
        }

        return (
          <button key={item.title} type="button" onClick={item.onClick} className="cursor-pointer">
            {content}
          </button>
        );
      })}
    </div>
  );
};

