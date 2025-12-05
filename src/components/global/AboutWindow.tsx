import { useState, useRef, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import profilePic1 from "../../assets/images/profile-pic-1.jpg";

interface AboutWindowProps {
  onClose: () => void;
}

export default function AboutWindow({ onClose }: AboutWindowProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ x: 250, y: 200 });
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });
  const [_isResizing, setIsResizing] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Adjust position and size for mobile
      if (mobile) {
        setPosition({ x: 10, y: 100 });
        setDimensions({ width: window.innerWidth - 20, height: 400 });
      } else {
        setPosition({ x: 250, y: 200 });
        setDimensions({ width: 500, height: 350 });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      const startX = e.pageX - position.x;
      const startY = e.pageY - position.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        setPosition({
          x: moveEvent.pageX - startX,
          y: moveEvent.pageY - startY,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Disable dragging on mobile for better UX
    if (dragRef.current && e.touches.length === 1 && !isMobile) {
      e.preventDefault();
      const touch = e.touches[0];
      const startX = touch.pageX - position.x;
      const startY = touch.pageY - position.y;

      const onTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          setPosition({
            x: moveTouch.pageX - startX,
            y: moveTouch.pageY - startY,
          });
        }
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(
        200,
        startHeight + (moveEvent.clientY - startY)
      );

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const startTouchResize = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.touches.length === 1) {
      setIsResizing(true);
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startWidth = dimensions.width;
      const startHeight = dimensions.height;

      const onTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (moveEvent.touches.length === 1) {
          const moveTouch = moveEvent.touches[0];
          const newWidth = Math.max(
            300,
            startWidth + (moveTouch.clientX - startX)
          );
          const newHeight = Math.max(
            200,
            startHeight + (moveTouch.clientY - startY)
          );

          setDimensions({
            width: newWidth,
            height: newHeight,
          });
        }
      };

      const onTouchEnd = () => {
        setIsResizing(false);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }
  };

  return (
    <div className="absolute" style={{ left: position.x, top: position.y }}>
      <div
        ref={windowRef}
        className="relative shadow-lg"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          ref={dragRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className={`bg-gray-800 h-6 flex items-center space-x-2 px-4 ${
            !isMobile ? "cursor-move touch-none" : ""
          } select-none`}
          style={{
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            ...(!isMobile && { touchAction: "none" }),
          }}
        >
          <div
            className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          ></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2">
            <FaInfoCircle size={14} className="text-gray-300" />
            About Me
          </span>
        </div>
        <div
          className="bg-gray-900/95 overflow-hidden rounded-b-lg backdrop-blur-sm"
          style={{ height: `calc(${dimensions.height}px - 1.5rem)` }}
        >
          <div className="p-6 text-gray-200 h-full overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
              <img
                src={profilePic1.src}
                alt="Rei Jarram"
                className="w-100 h-140 object-cover mb-4"
              />
            </div>

            <div className="space-y-4">
              <section>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  SYN/ACK
                </h3>
                I’m a founder and full-stack dev with 5+ years working in crypto
                & fintech with a heterogenous background that jumps across
                philosophy, political economy, and fintech. I'm now building at
                the intersection of DeSci and prediction markets. Outside work
                I’m an endurance runner, autodidact, and generalist who gets way
                too excited about tech, AI, and posthuman ethics
              </section>
              <section>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  My types
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>MBTI: ENFJ</li>
                  <li>Enneagram: Type One</li>
                  <li>Sun sign: Libra</li>
                  <li>Ascendant: Scorpio</li>
                  <li>Human Design: Reflector</li>
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  To get me yapping just mention...
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>
                    Finance & crypto-economics, esp. AMMs, prediction markets &
                    social choice theory in relation top public goods discourse
                  </li>
                  <li>AI, Consciousness, Gnosticism & Posthuman Ethics</li>
                  <li>Macroeconomics & World History</li>
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  My worldview
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>
                    <strong>Stag Hunt {">"} Prisoners Dilemma</strong>: I
                    believe trust is the true currency. Most outcomes in life
                    can be optimized when people collaborate instead of treating
                    human relations as zero-sum games, even in commercial and
                    transactional relationships.
                  </li>
                  <li>
                    <strong>
                      Risk Appetite {">"} Imagination {">"} EQ {">"} IQ
                    </strong>
                    : I believe success in the world is defined in that order.
                  </li>
                  <li>
                    <strong>Action {">"} Theory</strong>: Elegant execution is
                    itself a beauty idea.
                  </li>
                  <li>
                    <strong>Warm Culture {">"} Cold Culture</strong>: I'm
                    fundamentally a very relational person. I think it's
                    important that people engage with each other on an affective
                    as well as rational level, and I always take a deep interest
                    in all the the people I meet.
                  </li>
                  <li>
                    <strong>Post-humanism {">"} Humanism</strong>: I believe
                    that humans can and will upgrade themselves to keep up in a
                    world when human history ends and AI history begins. I
                    believe life will become multi-planetary and that
                    homo-sapiens is just one stepping stone in the larger chain
                    of evolution towards ever-greater intelligence and
                    sentience.
                  </li>
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Snapshots of my life
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>
                    <strong>I've been through a TBI</strong>: I had a bizarre
                    reaction to a conventional drug during medical treatment
                    that caused some pretty nasty psychological issues including
                    chronic fatigue, derealisation and cognitive deficits. Noone
                    knew how to diagnose my condition. It lasted at least 18
                    months and during that period I was under heavy stress at
                    work. Despite that, I managed to keep my job and even get
                    promoted. I learned many things during this period,
                    including the true meaning of resilience, and it deepened my
                    capacity to believe in myself to solve my own problems. I
                    had to maintain religious discipline on sleep habits,
                    exercise and mindfulness practice. I also researched all
                    kinds of elective therapy from supplements to neuro-feedback
                    therapy.
                  </li>
                  <li>
                    <strong>I am an autodictat</strong>: I've jumped across
                    domains multiple times in my life. My B.A. was in
                    literature. I chose an 'easy' subject that would allow me to
                    renage on course material and spend hours in the library.
                    With this free time I read everything I wanted from history
                    to economics to philosophy and still graduated with
                    first-class honours despite being absent from most lectures.
                    I then jumped directly into an M.A. in Political Economy and
                    taught myself multi-variable calculus as part of it
                    graduating the top of my class that year beating a bunch of
                    people that did their bachelors program in the subject area.
                    Then I jumped into tech. As a self-taught programmer I wrote
                    my first 'Hello World' program in Ruby in my early twenties.
                    Fast-forward five years later an I'm managing a team of 5
                    software engineers at a Canadian fintech who are all on
                    paper far more qualified than me. I then ditched the
                    security of a high-salary to create my own startup at the
                    intersection of DeSci and prediction markets. I'm finally
                    happy where I landed; as a founder I can capitalize on my
                    skills as a generalist with a technical edge.
                  </li>
                  <li>
                    <strong>
                      I was brought up in an entrepreneurial environment
                    </strong>
                    : My parents weren't great as parents but they were great
                    business people. During retirement my father poured all his
                    life-saving into a high-risk startup. The business was
                    eventually a success and they managed to sell it many years
                    later. I spent a couple of years working with them. This
                    experience gave me my first insight into some very important
                    business principles. I'll never forget how my father decided
                    to commercialise technology the university R&D department
                    advised as 'premature' for the market. But it was 'good
                    enough' to meet some commercial demand. And with that
                    monetisation they bootstrapped the rest of the technical
                    development.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize touch-none"
            onMouseDown={startResize}
            onTouchStart={startTouchResize}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
