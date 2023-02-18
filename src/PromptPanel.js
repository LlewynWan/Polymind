import React, { useContext, useRef, useState } from "react";
import { Group, Rect, Text, Circle } from "react-konva";

import { PanelItem } from "./PanelItem";


export function PromptPanel({
    x,
    y,
    width,
    height,
    fontSize,
    prompts,
    visible
}) {
    const middle = parseInt(Math.round(prompts.length / 2)) - 1;
    
    return (
        <Group
        x={x}
        y={y}
        visible={visible}
        >
            {prompts.map((prompt,index)=>{
            return <PanelItem
            key={index}
            x={-25*Math.abs(middle-index)}
            y={(height+2.5)*(index-middle)}
            width={width}
            height={height}
            text={prompt}/>
            })}
        </Group>
    )
}