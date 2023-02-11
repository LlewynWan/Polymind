import React, { useState, useEffect, useRef } from "react";

import { Rect, Group,Text } from "react-konva";
import { TextInput } from "./TextInput";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;


export function Prompter({
    id,
    x,
    y,
    width,
    height,
    fontSize,
    text,
    onTextChange,
    onDragStart,
    onDragEnd,
    onHover,
    onUnhover,
    isPrompting,
    draggable=true
}) {
    const [isHover, setIsHover] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const prompterRef = useRef(null);

    useEffect(() => {
        if (!isPrompting && isEditing) {
            setIsEditing(false);
        }
      }, [isPrompting, isEditing]);

    function handleEscapeKeys(e) {
        if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
          setIsEditing(false);
        }
      }
    
    function handleTextChange(e) {
        onTextChange(e.currentTarget.value);
    }

    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={(e) => {
            setIsHover(true)
            if (onHover) {
                onHover(prompterRef.current);
            }
        }}
        onMouseLeave={(e) => {
            setIsHover(false)
            if (onUnhover) {
                onUnhover(prompterRef.current);
            }
        }}
        ref={prompterRef}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        >
        <Rect
            x={0}
            y={0}
            width={width+20}
            height={height+40}
            fill={"#D3D3D3"}
            cornerRadius={10}
            opacity={isHover?1:0.4}
            strokeWidth={0.75}
            stroke={"gray"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.25}
            shadowColor={"black"}
        />
        {isEditing?
        <TextInput
        id={id}
        x={20}
        y={20}
        width={width}
        height={height}
        fontSize={fontSize}
        onChange={handleTextChange}
        onKeyDown={handleEscapeKeys}
        value={text}
        /> :
        <Text
        x={20}
        y={20}
        width={width}
        height={height}
        text={text}
        fill="black"
        fontFamily="sans-serif"
        fontSize={fontSize}
        perfectDrawEnabled={false}
        onClick={()=>setIsEditing(true)}
        />}
        </Group>
    );
}
  