import type { JSX } from "react";
import RetroWindow from "./RetroWindow";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const DESKTOP_POSITION = { x: 300, y: 150 };
const DESKTOP_SIZE = { width: 550, height: 350 };

interface SocialsWindowProps {
  onClose: () => void;
}

interface SocialLink {
  name: string;
  icon: JSX.Element;
  url: string;
}

export default function SocialsWindow({ onClose }: SocialsWindowProps) {
  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      icon: <FaInstagram size={48} />,
      url: "https://instagram.com/moreofthesame",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={48} />,
      url: "https://linkedin.com/in/rjarram",
    },
    {
      name: "Twitter",
      icon: <FaXTwitter size={48} />,
      url: "https://twitter.com/0xmoreofthesame",
    },
    {
      name: "Bluesky",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
        </svg>
      ),
      url: "https://bsky.app/profile/cybershades.bsky.social",
    },
    {
      name: "Farcaster",
      icon: (
        <svg viewBox="0 0 1000 1000" fill="currentColor" className="w-12 h-12">
          <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
          <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
          <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
        </svg>
      ),
      url: "https://warpcast.com/moreofthesame",
    },
  ];

  return (
    <RetroWindow
      title="A:\REI\SOCIALS.EXE"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
    >
      <div className="p-8 h-full flex items-center justify-center overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bevel-out active:bevel-in bg-pc98-face text-black hover:bg-pc98-title hover:text-white"
            >
              {social.icon}
              <span className="mt-3 text-sm font-bitmap">{social.name}</span>
            </a>
          ))}
        </div>
      </div>
    </RetroWindow>
  );
}
