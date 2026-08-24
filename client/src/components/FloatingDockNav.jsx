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
  IconBrandGithub,
} from "@tabler/icons-react";

export default function FloatingDockNav({ onNavigate, onOpenGame }) {
  const items = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-white" />,
      onClick: () => onNavigate("home"),
    },
    {
      title: "Music Quiz",
      icon: <IconHeadphones className="h-full w-full text-[#50e3c2]" />,
      onClick: () => onOpenGame({ key: "musicquiz", status: "play", clip: "RANDOM" }),
    },
    {
      title: "Heardle",
      icon: <IconPlayerPlay className="h-full w-full text-[#00dfd8]" />,
      onClick: () => onOpenGame({ key: "heardle", status: "play", clip: "INTRO" }),
    },
    {
      title: "Harmonies",
      icon: <IconGridDots className="h-full w-full text-[#7928ca]" />,
      onClick: () => onOpenGame({ key: "harmonies", status: "play" }),
    },
    {
      title: "Wordzic",
      icon: <IconSquareLetterW className="h-full w-full text-[#f9cb28]" />,
      onClick: () => onOpenGame({ key: "wordzic", status: "play" }),
    },
    {
      title: "Lyricles",
      icon: <IconMicrophone className="h-full w-full text-[#ff0080]" />,
      onClick: () => onOpenGame({ key: "lyricles", status: "play" }),
    },
    {
      title: "Crosszic",
      icon: <IconTable className="h-full w-full text-[#3df07a]" />,
      onClick: () => onOpenGame({ key: "crosszic", status: "play" }),
    },
    {
      title: "Profile",
      icon: <IconUser className="h-full w-full text-bone" />,
      onClick: () => onNavigate("profile"),
    },
    {
      title: "GitHub",
      icon: <IconBrandGithub className="h-full w-full text-dim hover:text-white" />,
      href: "https://github.com/chittranshsharma/decibel",
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
