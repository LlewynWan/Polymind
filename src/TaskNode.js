import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Tag, Text, Transformer, Ellipse } from "react-konva";

import Konva from "konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { Icon } from "./Icon";

import { sizeMap } from "./utils/size_utils";


const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function TaskNode({
    x,
    y,
    type,
    width,
    height,
    radiusX,
    radiusY,
    color,
    text,
    fontSize,
    onDragEnd,
    onConfirm
}) {
    const {canvasX, canvasY, canvasScale, microTasks} = useContext(CanvasContext);
    const [textHeight, setTextHeight] = useState(0);

    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        // if (!isSelected && isEditing) {
        //   setIsEditing(false);
        // }
        const tmp = type === "concept" ?
        new Konva.Text({text: text, width: radiusX*2, fontSize: fontSize})
        : new Konva.Text({text: text, width: width, fontSize: fontSize});
        setTextHeight(tmp.height());
    }, [fontSize]);
    
    return (
    <Group
    x={x}
    y={y}
    onDragEnd={(e)=>{
        if (onDragEnd)
          onDragEnd(e);
      }}
    draggable
    onMouseEnter={()=>setIsHover(true)}
    onMouseLeave={()=>setIsHover(false)}>
    {type === "concept" ?
    <Group
    x={0}
    y={-radiusY-12}
    scaleX={0.75}
    scaleY={0.75}
    opacity={0.75}>
    <Rect
    x={-20}
    y={-10}
    width={45}
    height={30}
    fill={"transparent"}/>
    <Icon
    x={-10}
    y={0}
    type={"cross"}
    />
    <Icon
    x={10}
    y={0}
    type={"confirm"}
    onClick={onConfirm}
    />
    </Group>
    :
    <Group
    x={12}
    y={-15}
    scaleX={0.75}
    scaleY={0.75}
    opacity={0.75}>
    <Rect
    x={-10}
    y={-10}
    width={45}
    height={30}
    fill={"transparent"}/>
    <Icon
    x={0}
    y={0}
    type={"cross"}
    />
    <Icon
    x={20}
    y={0}
    type={"confirm"}
    onClick={onConfirm}
    />
    </Group>}
    <Group
    x={0}
    y={0}
    opacity={isHover?0.6:0.25}>
        {type === "keyword" ?
        <Label>
            <Tag
            fill={color}
            cornerRadius={5}/>
            <Text
            text={text}
            fontSize={fontSize}
            fontStyle={"bold"}
            padding={10}/>
        </Label>
        : type === "sticky_note" ?
        <Group
        x={0}
        y={0}>
            <Rect
            x={0}
            y={0}
            width={width+35}
            height={Math.max(sizeMap[type].height+70,textHeight+70)}
            fill={color}
            shadowOffsetX={0}
            shadowOffsetY={5}
            shadowBlur={12}
            shadowOpacity={0.2}/>
            <Text
            x={20}
            y={30}
            width={width}
            text={text}
            fontSize={fontSize}/>
        </Group>
        // <Label>
        //     <Tag
        //     fill={color}
        //     shadowOffsetX={0}
        //     shadowOffsetY={5}
        //     shadowBlur={12}
        //     shadowOpacity={0.2}/>
        //     <Text
        //     text={text}
        //     fontSize={fontSize}
        //     padding={20}
        //     width={width}/>
        // </Label>
        : <Group>
        <Ellipse
        x={0}
        y={0}
        radiusX={radiusX}
        radiusY={Math.max(sizeMap[type].radiusY,textHeight)}
        fill={color}
        stroke={"#010203"}
        strokeWidth={0.2}
        opacity={0.85}
        />
        <Text
        x={-radiusX}
        y={-textHeight}
        width={radiusX*2}
        height={textHeight*2}
        text={text}
        align={"center"}
        fontSize={fontSize}
        verticalAlign={"middle"}
        />
        </Group>}
    </Group>
    </Group>
    )
}