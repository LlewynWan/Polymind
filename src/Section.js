import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Tag, Text, Transformer } from "react-konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { TaskHeader } from "./TaskHeader";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function Section({
    x,
    y,
    scaleX,
    scaleY,
    width,
    height,
    color,
    text,
    fontSize
}) {
    return (
    <Group
    x={x}
    y={y}>
        <Label
        x={0}
        y={-40}>
            <Tag
            fill={color}
            cornerRadius={5}
            opacity={0.5}
            stroke={"gray"}
            strokeWidth={0.5}/>
            <Text
            text={text}
            fontSize={fontSize}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"black"}
            padding={5}/>
        </Label>
        <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        cornerRadius={10}
        opacity={0.15}
        fill={color}
        />
    </Group>
    )
}