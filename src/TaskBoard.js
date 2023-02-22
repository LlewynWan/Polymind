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
            fill={"#0C2557"}
            opacity={0.32}
            strokeWidth={0.5}
            stroke={"gray"}
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
            height={125}
            color={"orange"}
            goal={"Brainstorm"}
            outputType={"Keyword"}
            />
            <TaskCard
            x={25}
            y={240}
            width={width-50}
            height={125}
            color={"purple"}
            goal={"Summarise"}
            outputType={"Concept"}
            />
            <TaskCard
            x={25}
            y={380}
            width={width-50}
            height={125}
            color={"green"}
            goal={"Clarify"}
            outputType={"Sticky Note"}
            />
            <TaskCard
            x={25}
            y={520}
            width={width-50}
            height={125}
            color={"#E75480"}
            goal={"Draft"}
            outputType={"Sticky Note"}
            />
        </Group>
    )
}