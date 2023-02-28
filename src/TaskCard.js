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
            shadowColor={"gray"}
            shadowOffsetY={1.5}
            shadowOffsetX={0}
            shadowBlur={2.5}
            shadowOpacity={0.32}
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
                fontSize={18}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            <Label
            x={width/2}
            y={65}
            >
                <Tag
                fill={"#B0B3B8"}
                cornerRadius={5}
                pointerDirection={"right"}
                pointerWidth={5}
                pointerHeight={5}
                lineJoin={'round'}
                />
                <Text
                text={"Input Type"}
                fontSize={14}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            <Label
            x={width/2}
            y={95}
            >
                <Tag
                fill={"#B0B3B8"}
                cornerRadius={5}
                pointerDirection={"right"}
                pointerWidth={5}
                pointerHeight={5}
                lineJoin={'round'}
                />
                <Text
                text={"Output Type"}
                fontSize={14}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            <Label
            x={width/2+5}
            y={95}
            >
                <Tag
                fill={outputType==="Sticky Note" ? "#003A6B"
                : outputType==="Concept" ? "#5880A2"
                : outputType==="Keyword" ? "#AFC6D9" : "#80D8FF"}
                cornerRadius={5}
                pointerDirection={"left"}
                // pointerWidth={5}
                // pointerHeight={5}
                lineJoin={'round'}
                />
                <Text
                text={outputType}
                fontSize={14}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label>
            {/* <Label
            x={width/2-50}
            y={150}
            >
                <Tag
                fill={"#B0B3B8"}
                cornerRadius={5}
                pointerDirection={"down"}
                pointerWidth={5}
                pointerHeight={5}
                lineJoin={'round'}
                />
                <Text
                text={"Example Prompt"}
                fontSize={14}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label> */}
        </Group>
    )
}