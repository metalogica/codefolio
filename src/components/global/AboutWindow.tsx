import RetroWindow from "./RetroWindow";
import profilePic1 from "../../assets/images/profile-pic-1.jpg";

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
            alt="Rei Jarram"
            className="w-100 h-140 object-cover mb-4 pixelated border border-black"
          />
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-bold mb-2">SYN/ACK</h3>
            I’m a founder and full-stack dev with 5+ years working in crypto &
            fintech with a heterogenous background that jumps across philosophy,
            economics, and computer science. I'm now building at the
            intersection of AI & prediction markets. Outside work I’m an
            endurance runner and autodidact who gets way too excited about nerdy
            subjects (ACX, Less Wrong etc).
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">My types</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>MBTI: ENFJ</li>
              <li>Enneagram: Type One</li>
              <li>Sun sign: Libra</li>
              <li>Human Design: Reflector</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">
              To get me yapping just mention...
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Market microstructure, AMMs, prediction markets, social choice
                theory, public goods, and collective action problems.
              </li>
              <li>
                AI, Consciousness, Gnosticism, Posthuman Ethics, and Science
                Fiction.
              </li>
              <li>Macroeconomics, World History, and World Literature.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">My worldview</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>P(doom)</strong>: 20.
              </li>
              <li>
                <strong>Stag Hunt {">"} Prisoners Dilemma</strong>: I believe
                trust is the true currency. Most outcomes in life can be
                optimized when people collaborate instead of treating human
                relations as zero-sum games, even in commercial and
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
                fundamentally a very relational person. I think it's important
                that people engage with each other on an affective as well as
                rational level, and I always take a deep interest in all the the
                people I meet.
              </li>
              <li>
                <strong>Post-humanism {">"} Humanism</strong>: I believe that
                humans can and will upgrade themselves to keep up in a world
                when human history ends and AI history begins. I believe life
                will become multi-planetary and that homo-sapiens is just one
                stepping stone in the larger chain of evolution towards
                ever-greater intelligence and sentience.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-bold mb-2">Snapshots of my life</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>I am an autodictat</strong>: I've jumped across domains
                multiple times in my life. My B.A. was in literature. I chose an
                'easy' subject that would allow me to quickly skim over course
                material and spend hours in the library. With this free time I
                read everything I wanted from history to economics to philosophy
                and still graduated with first-class honours despite being
                absent from most lectures. I then jumped directly into an M.A.
                in Political Economy and taught myself multi-variable calculus
                as part of it graduating the top of my class that year beating a
                bunch of people that did their bachelors program in the subject
                area. Then I jumped into tech. As a self-taught programmer I
                wrote my first 'Hello World' program in Ruby in my early
                twenties. Fast-forward five years later an I'm managing a team
                of 5 software engineers at a Canadian fintech who are all on
                paper far more qualified than me. I then ditched the security of
                a high-salary to create my own startup at the intersection of AI
                and prediction markets. I'm finally happy where I landed; as a
                founder I can capitalize on my skills as a generalist with a
                technical edge.
              </li>
              <li>
                <strong>I was brought up in an entrepreneurial environment</strong>
                : My parents weren't great as parents but they were great
                business people. During retirement my father poured all his
                life-saving into a high-risk startup. The business was
                eventually a success and they managed to sell it many years
                later. I spent a couple of years working with them after
                graduating from university. This experience gave me my first
                insight into some very important business principles. I'll never
                forget how my father decided to commercialise technology the
                university R&D department advised as 'premature' for the market.
                But it was 'good enough' to meet some commercial demand. And
                with that monetisation they bootstrapped the rest of the
                technical development.
              </li>
              <li>
                <strong>I've been through a traumatic brain injury</strong>: I
                had a bizarre reaction to a conventional drug during medical
                treatment that caused some pretty nasty psychological issues
                including chronic fatigue, derealisation and cognitive deficits.
                Noone knew how to diagnose my condition. It lasted at least 18
                months and during that period I was under heavy stress at work.
                Despite that, I managed to keep my job and even get promoted. I
                learned many things during this period, including the true
                meaning of resilience, and it deepened my capacity to believe in
                myself to solve my own problems. I had to maintain religious
                discipline on sleep habits, exercise and mindfulness practice. I
                also researched all kinds of elective therapy from supplements
                to neuro-feedback therapy. It was also during this period that I
                first developed my initial interest in Brain Computer Interfaces
                and their intersection with transhumanist philosophy.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </RetroWindow>
  );
}
