import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Tag, Text, Transformer } from "react-konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { TaskHeader } from "./TaskHeader";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function TaskNode({
    x,
    y,
    type,
    width,
    height,
    color,
    text,
    fontSize
}) {
    const {canvasX, canvasY, canvasScale, microTasks} = useContext(CanvasContext);
    
    return (
    <Group
    x={x}
    y={y}
    opacity={0.2}
    draggable>
        {type === "keyword" ?
        <Label>
            <Tag
            fill={color}
            cornerRadius={5}/>
            <Text
            text={text}
            fontSize={fontSize}
            padding={10}/>
        </Label>
        : type === "sticky_note" ?
        <Label>
            <Tag
            fill={color}
            shadowOffsetX={0}
            shadowOffsetY={5}
            shadowBlur={12}
            shadowOpacity={0.2}/>
            <Text
            text={text}
            fontSize={fontSize}
            padding={15}
            width={width}/>
        </Label>: null}
    </Group>
    )
}