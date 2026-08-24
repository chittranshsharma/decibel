import { FloatingDock } from "./ui/floating-dock";
import {
  IconHome,
  IconHeadphones,
  IconPlayerPlay,
  IconGridDots,
  IconSquareLetterW,
  IconMicrophone,
  IconTable,
  IconUser,
  IconMenu2,
} from "@tabler/icons-react";

export default function FloatingDockNav({ onNavigate, onOpenGame, onMenu }) {
  const items = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-white" />,
      onClick: () => onNavigate("home"),
    },
    {
      title: "Music Quiz",
      icon: <IconHeadphones className="h-full w-full text-amber-400" />,
      onClick: () => onOpenGame({ key: "musicquiz", status: "play", clip: "RANDOM" }),
    },
    {
      title: "Heardle",
      icon: <IconPlayerPlay className="h-full w-full text-white/90" />,
      onClick: () => onOpenGame({ key: "heardle", status: "play", clip: "INTRO" }),
    },
    {
      title: "Harmonies",
      icon: <IconGridDots className="h-full w-full text-white/90" />,
      onClick: () => onOpenGame({ key: "harmonies", status: "play" }),
    },
    {
      title: "Wordzic",
      icon: <IconSquareLetterW className="h-full w-full text-white/90" />,
      onClick: () => onOpenGame({ key: "wordzic", status: "play" }),
    },
    {
      title: "Lyricles",
      icon: <IconMicrophone className="h-full w-full text-white/90" />,
      onClick: () => onOpenGame({ key: "lyricles", status: "play" }),
    },
    {
      title: "Crosszic",
      icon: <IconTable className="h-full w-full text-white/90" />,
      onClick: () => onOpenGame({ key: "crosszic", status: "play" }),
    },
    {
      title: "Profile",
      icon: <IconUser className="h-full w-full text-white/80" />,
      onClick: () => onNavigate("profile"),
    },
    {
      title: "Menu",
      icon: <IconMenu2 className="h-full w-full text-neutral-400" />,
      onClick: () => onMenu && onMenu(),
    },
  ];

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto">
        <FloatingDock
          items={items}
          desktopClassName="shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          mobileClassName="fixed bottom-5 right-5 z-50"
        />
      </div>
    </div>
  );
}
