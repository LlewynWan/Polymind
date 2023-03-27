import React, { useState } from "react";
import { Group, Label, Tag, Text } from "react-konva";


export function NewsTicker({
    x,
    y,
    text,
    width,
    color,
    fontSize
}) {
    const [isAnimating, setIsAnimating] = useState(false);

    return (
    <Group
    x={x}
    y={y}
    clipX={x+2.5}
    clipY={0}
    ClipWidth={width+35}
    clipHeight={25}>
    <Label
    x={2.5}
    y={0}
    onMouseEnter={(e)=>{
        if (!isAnimating) {
            setIsAnimating(true);
            e.target.setAttrs({width: width+text.length*10, ellipsis: false})
            e.target.to({
                x: -text.length*9,
                duration: text.length/15,
                onFinish: ()=>{
                    e.target.setAttrs({x: width+35});
                    e.target.to({
                        x: 0,
                        duration: 1,
                        onFinish: ()=>{
                            e.target.setAttrs({width: width+35});
                            setIsAnimating(false);
                        }
                    })
                }
            })
        }
    }}>
        <Tag
        // fill={colorPalette[task.id%colorPalette.length]}
        fill={"#EEEEEE"}
        cornerRadius={0}
        // stroke={"#010203"}
        // strokeWidth={0.12}
        lineJoin={'round'}
        perfectDrawEnabled={false}
        />
        <Text
        x={0}
        y={0}
        width={width+35}
        height={15}
        text={text}
        fontSize={fontSize}
        fontStyle={"bold"}
        fontFamily={"sans-serif"}
        fill={color}
        verticalAlign={"middle"}
        padding={2.5}
        perfectDrawEnabled={false}
        ellipsis={false}/>
    </Label>
    </Group>
    )
}