import RetroWindow from "./RetroWindow";
import profilePic1 from "../../assets/images/profile-pic-1.jpg";
import { BIO_SECTIONS, IDENTITY } from "../../content/bio";

const DESKTOP_POSITION = { x: 250, y: 200 };
const DESKTOP_SIZE = { width: 500, height: 350 };

interface AboutWindowProps {
  onClose: () => void;
}

export default function AboutWindow({ onClose }: AboutWindowProps) {
  return (
    <RetroWindow
      title="A:\REI\ABOUT.TXT"
      onClose={onClose}
      desktopPosition={DESKTOP_POSITION}
      desktopSize={DESKTOP_SIZE}
    >
      <div className="p-6 text-black font-bitmap text-sm h-full overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <img
            src={profilePic1.src}
            alt={IDENTITY.name}
            className="w-100 h-140 object-cover mb-4 pixelated border border-black"
          />
        </div>

        <div className="space-y-4">
          {BIO_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h3 className="text-lg font-bold mb-2">{section.heading}</h3>
              {section.body}
              {section.items && (
                <ul className="list-disc list-inside space-y-1">
                  {section.items.map((item) => (
                    <li key={item.lead ?? item.text}>
                      {item.lead ? (
                        <>
                          <strong>{item.lead}</strong>: {item.text}
                        </>
                      ) : (
                        item.text
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </RetroWindow>
  );
}
