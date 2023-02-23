import React, { useState } from "react";

import { Rect, Group,Text, Tag, Label } from "react-konva";


export function TaskPrompt({
    x,
    y,
    width,
    height,
    color,
    fontSize,
    text
}) {
    const [isHover, setIsHover] = useState(false);
    
    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}>
            {/* <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={color}
            cornerRadius={5}
            opacity={isHover?0.75:0.4}
            strokeWidth={0.75}
            stroke={"gray"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.25}
            shadowColor={color}
            /> */}
            <Label
            x={0}
            y={0}
            opacity={isHover?0.75:0.4}
            >
                {isHover ? <Tag
                fill={color}
                cornerRadius={5}
                strokeWidth={0.5}
                stroke={"gray"}
                shadowOffsetY={0}
                shadowOffsetX={0}
                shadowBlur={2}
                shadowOpacity={0.25}
                shadowColor={"black"}
                /> : <Tag
                fill={color}
                cornerRadius={5}
                />}
                <Text
                text={text}
                fontSize={fontSize}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            {/* <Text
            x={10}
            y={10}
            width={width-20}
            height={height-20}
            fontSize={fontSize}
            text={text}
            /> */}
        </Group>
    )
}