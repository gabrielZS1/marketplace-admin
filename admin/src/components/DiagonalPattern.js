import Svg, { Defs, Pattern, Line, Rect } from "react-native-svg";

export default function DiagonalPattern({ width, height }) {
  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <Pattern
          id="diagonalHatch"
          patternUnits="userSpaceOnUse"
          width={10}
          height={10}
          patternTransform="rotate(45)"
        >
          <Rect width={10} height={10} fill="#d9d9d9" />
          <Line x1={0} y1={0} x2={0} y2={10} stroke="#c9c9c9" strokeWidth={2} />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#diagonalHatch)" />
    </Svg>
  );
}