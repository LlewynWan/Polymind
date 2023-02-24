import React, { useState } from "react";
import { Group, Rect, Text } from "react-konva";

import { TaskCard } from "./TaskCard";


export function TaskBoard({
    x,
    y,
    width,
    height
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
            fill={"#D3D3D3"}
            opacity={0.6}
            strokeWidth={0.32}
            stroke={"#010203"}
            // shadowColor={"black"}
            // shadowOffsetY={2.5}
            // shadowOffsetX={0}
            // shadowBlur={5}
            // shadowOpacity={0.25}
            />
            <Text
            x={20}
            y={25}
            text={"Task Board"}
            fontSize={20}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"black"}
            />
            <TaskCard
            x={25}
            y={100}
            width={width-50}
            height={150}
            color={"#FFB347"}
            goal={"Brainstorm"}
            outputType={"Keyword"}
            />
            <TaskCard
            x={25}
            y={265}
            width={width-50}
            height={150}
            color={"#966FD6"}
            goal={"Summarise"}
            outputType={"Concept"}
            />
            <TaskCard
            x={25}
            y={430}
            width={width-50}
            height={150}
            color={"#71C562"}
            goal={"Clarify"}
            outputType={"Sticky Note"}
            />
            <TaskCard
            x={25}
            y={595}
            width={width-50}
            height={150}
            color={"#FB6B89"}
            goal={"Draft"}
            outputType={"Sticky Note"}
            />
        </Group>
    )
}