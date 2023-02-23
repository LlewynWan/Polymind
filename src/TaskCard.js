import React, { useState } from "react";
import { Group, Rect, Label, Tag, Text } from "react-konva";


export function TaskCard({
    x,y,
    width,
    height,
    color,
    goal,
    outputType
})
{
    const [isHover, setIsHover] = useState(false);

    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}>
            <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            cornerRadius={10}
            fill={"#F7F7F7"}
            strokeWidth={0.12}
            stroke={"#010203"}
            shadowColor={"black"}
            shadowOffsetY={2.5}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.25}
            />
            <Label
            x={10}
            y={10}
            >
                <Tag
                fill={color}
                cornerRadius={5}
                />
                <Text
                text={goal}
                fontSize={16}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            <Label
            x={10}
            y={40}
            >
                <Tag
                fill={outputType==="Sticky Note" ? "#002275"
                : outputType==="Concept" ? "#444EAA"
                : outputType==="Keyword" ? "#9999FF" : "black"}
                cornerRadius={5}
                />
                <Text
                text={outputType}
                fontSize={16}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
        </Group>
    )
}