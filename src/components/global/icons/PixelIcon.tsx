const PALETTE: Record<string, string> = {
  K: "#000000",
  W: "#ffffff",
  F: "#c8c8c8",
  S: "#808080",
  B: "#000082",
  G: "#00d000",
  C: "#00a8a8",
  R: "#a80000",
  M: "#a800a8",
};

// 16x16 glyphs. '.' = transparent; letters index into PALETTE.
const PIXEL_MAPS = {
  terminal: [
    "................",
    ".FFFFFFFFFFFFFF.",
    ".FKKKKKKKKKKKKF.",
    ".FKGKKKKKKKKKKF.",
    ".FKKGKGGGKKKKKF.",
    ".FKGKKKKKKKKKKF.",
    ".FKKKKKKKKKKKKF.",
    ".FFFFFFFFFFFFFF.",
    "......FFFF......",
    "......FFFF......",
    "...FFFFFFFFFF...",
    "...SSSSSSSSSS...",
    "................",
    "................",
    "................",
    "................",
  ],
  info: [
    "................",
    "..BBBBBBBBBBBB..",
    ".BBBBBBBBBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBBBBBBBBBB.",
    ".BBBBBWWWBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBBWWBBBBBB.",
    ".BBBBBWWWWBBBBB.",
    ".BBBBBBBBBBBBBB.",
    "..BBBBBBBBBBBB..",
    "................",
    "................",
  ],
  document: [
    "................",
    "..KKKKKKKKK.....",
    "..KWWWWWWWKK....",
    "..KWWWWWWWKWK...",
    "..KWWWWWWWKKKK..",
    "..KWWWWWWWWWWK..",
    "..KWSSSSSSSWWK..",
    "..KWWWWWWWWWWK..",
    "..KRRRRRRRRRRK..",
    "..KRWWRWWRWWRK..",
    "..KRRRRRRRRRRK..",
    "..KWWWWWWWWWWK..",
    "..KWSSSSSSSWWK..",
    "..KWWWWWWWWWWK..",
    "..KKKKKKKKKKKK..",
    "................",
  ],
  share: [
    "................",
    "..........KKKK.",
    "..........KCCK.",
    "..........KKKK.",
    "........KK.....",
    "......KK.......",
    ".KKKKK.........",
    ".KCCK..........",
    ".KCCK..........",
    ".KKKKK.........",
    "......KK.......",
    "........KK.....",
    "..........KKKK.",
    "..........KMMK.",
    "..........KKKK.",
    "................",
  ],
  mail: [
    "................",
    "................",
    "................",
    ".KKKKKKKKKKKKKK.",
    ".KWWWWWWWWWWWWK.",
    ".KWKWWWWWWWWKWK.",
    ".KWWKWWWWWWKWWK.",
    ".KWWWKWWWWKWWWK.",
    ".KWWWWKKKKWWWWK.",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
    "................",
  ],
  github: [
    "................",
    "..KK........KK..",
    "..KKK......KKK..",
    "..KKKKKKKKKKKK..",
    ".KKKKKKKKKKKKKK.",
    ".KKWWKKKKKKWWKK.",
    ".KKWWKKKKKKWWKK.",
    ".KKKKKKKKKKKKKK.",
    ".KKKKKKKKKKKKKK.",
    "..KKKKKKKKKKKK..",
    "..KKKKKWWKKKKK..",
    "...KKKKKKKKKK...",
    "....KKKKKKKK....",
    "......KKKK......",
    "................",
    "................",
  ],
  calendar: [
    "................",
    "....KK.....KK...",
    ".KKKKKKKKKKKKKK.",
    ".KBBBBBBBBBBBBK.",
    ".KBBBBBBBBBBBBK.",
    ".KKKKKKKKKKKKKK.",
    ".KWWWWWWWWWWWWK.",
    ".KWKKWKKWKKWKWK.",
    ".KWWWWWWWWWWWWK.",
    ".KWKKWKKWKKWKWK.",
    ".KWWWWWWWWWWWWK.",
    ".KWKKWKKWKKWKWK.",
    ".KWWWWWWWWWWWWK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
  ],
  music: [
    "................",
    "........KKK.....",
    "........KKKKK...",
    "........KKKKKK..",
    "........KKKKKK..",
    "........KK..KK..",
    "........KK......",
    "........KK......",
    "........KK......",
    "....KKKKKK......",
    "..KKKKKKKK......",
    "..KKKKKKKK......",
    "..KKKKKKK.......",
    "....KKK.........",
    "................",
    "................",
  ],
  globe: [
    "................",
    ".....KKKKKK.....",
    "...KKCCCCCCKK...",
    "..KCCCKCCKCCCK..",
    "..KCCCKCCKCCCK..",
    ".KCCCCKCCKCCCCK.",
    ".KKKKKKKKKKKKKK.",
    ".KCCCCKCCKCCCCK.",
    ".KCCCCKCCKCCCCK.",
    ".KKKKKKKKKKKKKK.",
    ".KCCCCKCCKCCCCK.",
    "..KCCCKCCKCCCK..",
    "..KCCCKCCKCCCK..",
    "...KKCCCCCCKK...",
    ".....KKKKKK.....",
    "................",
  ],
} as const;

export type PixelIconName = keyof typeof PIXEL_MAPS;

interface PixelIconProps {
  name: PixelIconName;
  size?: number;
  className?: string;
}

export default function PixelIcon({
  name,
  size = 32,
  className,
}: PixelIconProps) {
  const rows = PIXEL_MAPS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        Array.from(row).map((cell, x) =>
          cell === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[cell]}
            />
          ),
        ),
      )}
    </svg>
  );
}
