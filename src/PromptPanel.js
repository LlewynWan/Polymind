import React, { useContext, useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";

import { GlobalContext } from "./state";


export function PromptPanel({
    x,
    y,
    width,
    height,
    fontSize,
    prompts,
    visible
}) {
    const [isHover, setIsHover] = React.useState(
        Array(prompts.length).fill(false)
    );

    const middle = parseInt(Math.round(prompts.length / 2)) - 1;
    
    return (
        <Group
        x={x}
        y={y}
        visible={visible}
        >
            {prompts.map((prompt,index)=>{
            return <Group
            key={index}
            x={-24*Math.abs(middle-index)}
            y={(height+5)*(index-middle)}
            opacity={isHover[index]?0.75:0.5}
            onMouseEnter={(e)=>setIsHover([
                ...isHover.slice(0,index), true, ...isHover.slice(index+1)
            ])}
            onMouseLeave={(e)=>setIsHover([
                ...isHover.slice(0,index), false, ...isHover.slice(index+1)
            ])}
            >
            <Rect
            x={0}
            y={0}
            fill={"#888A7C"}
            stroke={"#010203"}
            strokeWidth={0.25}
            cornerRadius={7}
            width={width}
            height={height}
            />
            <Text
            x={8}
            y={8}
            text={prompt}
            width={width}
            height={height}
            fontSize={fontSize}
            fill={"black"}
            fontStyle={"italic bold"}
            fontFamily={"sans-serif"}
            />
            </Group>
            })}
        </Group>
    )
}