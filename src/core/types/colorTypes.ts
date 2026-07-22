type Alpha = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

type OptionalSpace = " " | "";
type RGBA =
  `rgba(${number},${OptionalSpace}${number},${OptionalSpace}${number},${OptionalSpace}${Alpha})`;

type RGB = `rgb(${number},${OptionalSpace}${number},${OptionalSpace}${number})`;

type HexColor = `#${string}`;

type Color = RGBA | HexColor | RGB | string;

export type { Color };
