import { useCanvas, useAnimation } from "./Canvas";

export const Hexagon = ({
  x,
  y,
  size,
  color,
  initialRotation,
  rotationSpeed
}) => {
  const context = useCanvas();

  const animatedAngle = useAnimation(
    initialRotation,
    angleValue => angleValue + rotationSpeed
  );

  if (context !== null) {
    const edgeLength = size * 0.5;

    context.beginPath();
    // This article explains all the math behind hexagons
    // https://www.redblobgames.com/grids/hexagons/
    [30, 90, 150, 210, 270, 330].forEach((angle, index) => {
      const radAngle = ((angle + animatedAngle) * Math.PI) / 180;
      const point = {
        x: x + edgeLength + edgeLength * Math.cos(radAngle),
        y: y + edgeLength + edgeLength * Math.sin(radAngle)
      };

      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.fillStyle = color;
    context.fill();
  }

  return null;
};
