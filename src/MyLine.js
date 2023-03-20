import { Shape } from "react-konva";

export function MyLine ({
    points,
    stroke,
    strokeWidth,
    listening,
    opacity=1,
    radius=10,
}) {
  return (
    <Shape
      points={points}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(points[0], points[1]);
        const numPoints = parseInt(points.length / 2);
        for (var i = 1; i < numPoints-1; i++) {
            const dx1 = points[i*2] - points[(i-1)*2];
            const dy1 = points[i*2+1] - points[(i-1)*2+1];
            const dx2 = points[(i+1)*2] - points[i*2];
            const dy2 = points[(i+1)*2+1] - points[i*2+1];
            if (dy1 === 0) {
                context.lineTo(Math.abs(dx1)>radius*2 ?
                points[(i-1)*2]+dx1-(dx1>0?1:-1)*radius : points[(i-1)*2]+dx1,
                points[(i-1)*2+1]);
            } else {
                context.lineTo(points[(i-1)*2]+dx1,
                Math.abs(dy1)>radius*2 ?
                points[(i-1)*2+1]+dy1-(dy1>0?1:-1)*radius : points[(i-1)*2+1]+dy1);
            }

            if (dy2 === 0) {
                if (Math.abs(dx2)>radius*2) {
                    context.quadraticCurveTo(
                        points[i*2],
                        points[i*2+1],
                        points[(i+1)*2] - dx2 - (dx2>0?-1:1)*radius,
                        points[(i+1)*2+1]
                    )
                } else {
                    context.quadraticCurveTo(
                        points[i*2],
                        points[i*2+1],
                        points[(i+1)*2] - dx2,
                        points[(i+1)*2+1]
                    )
                }   
            } else {
                if (Math.abs(dy2)>radius*2) {
                    context.quadraticCurveTo(
                        points[i*2],
                        points[i*2+1],
                        points[(i+1)*2],
                        points[(i+1)*2+1] - dy2 - (dy2>0?-1:1)*radius
                    )
                } else {
                    context.quadraticCurveTo(
                        points[i*2],
                        points[i*2+1],
                        points[(i+1)*2],
                        points[(i+1)*2+1] - dy2
                    )
                }
            }
        }
        context.lineTo(points[numPoints*2-2],points[numPoints*2-1]);
        context.fillStrokeShape(shape);
      }}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      listening={listening}
    />
  );
};