import React, { useState, useEffect, useRef, useContext } from "react";

import { Rect, Group,Text } from "react-konva";
// import { TextInput } from "./TextInput";

// import { PrompterContext } from "./state";


// const RETURN_KEY = 13;
// const ESCAPE_KEY = 27;


export function Textbox({
    x,
    y,
    width,
    height,
    fontSize,
    fontStyle,
    text,
    // onTextChange,
    // onDragStart,
    // onDragEnd,
    onHover,
    onUnhover,
    // isPrompting,
    draggable
}) {
    const [isHover, setIsHover] = useState(false);
    // const [isEditing, setIsEditing] = useState(false);

    const prompterRef = useRef(null);
    // const {promptCardsRef} = useContext(PrompterContext);
 
    // useEffect(() => {
    //     if (!isPrompting && isEditing) {
    //         setIsEditing(false);
    //     }

    //     if (prompterRef.current) {
    //         promptCardsRef.current[id] = prompterRef;
    //     }
    //   }, [prompterRef, isPrompting, isEditing]);

    // function handleEscapeKeys(e) {
    //     if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
    //       setIsEditing(false);
    //     }
    //   }
    
    // function handleTextChange(e) {
    //     onTextChange(e.currentTarget.value);
    // }

    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={(e) => {
            e.cancelBubble = true;
            setIsHover(true)
            if (onHover) {
                onHover(prompterRef.current);
            }
        }}
        onMouseLeave={(e) => {
            e.cancelBubble = true;
            setIsHover(false)
            if (onUnhover) {
                onUnhover(prompterRef.current);
            }
        }}
        ref={prompterRef}
        draggable={draggable}
        opacity={isHover?1:0.4}
        // onDragStart={onDragStart}
        // onDragEnd={onDragEnd}
        >
        <Rect
            x={0}
            y={0}
            width={width+20}
            height={height+40}
            fill={"#D3D3D3"}
            cornerRadius={10}
            // opacity={isHover?1:0.4}
            strokeWidth={0.75}
            stroke={"silver"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={6}
            shadowOpacity={0.32}
            shadowColor={"gray"}
            perfectDrawEnabled={false}
            listening={isHover}
        />
        <Rect
            x={width/2-30}
            y={0}
            width={80}
            height={20}
            fill={"transparent"}
            perfectDrawEnabled={false}
        />
        <Text
        x={20}
        y={20}
        width={width}
        height={height}
        text={text}
        fill="#2A2A35"
        fontFamily="sans-serif"
        fontSize={fontSize}
        fontStyle={fontStyle}
        perfectDrawEnabled={false}
        // onClick={()=>setIsEditing(true)}
        />
        {/* {isEditing?
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
        />} */}
        </Group>
    );
}
  