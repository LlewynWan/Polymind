import React, { useState, useRef, useEffect } from "react";

import { Rect, Group,Text, Tag, Label } from "react-konva";


export function TaskPrompt({
    x,
    y,
    width,
    height,
    color,
    fontSize,
    text
}) {
    const [isHover, setIsHover] = useState(false);
    const taskPromptRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (isHover) {
            if (taskPromptRef.current) {
                taskPromptRef.current.setAttrs({visible: false});
                if (textRef.current) {
                    textRef.current.setAttrs({visible: false, width: null});
                    const newWidth = textRef.current.getClientRect().width;
                    textRef.current.setAttrs({visible: true, width: width});
                    taskPromptRef.current.setAttrs({visible: true});
                    textRef.current.to({
                        width: newWidth,
                        ellipsis: false,
                        duration: 0.25,
                    })
                }
            }
        } else {
            if (textRef.current) {
                textRef.current.to({
                    width: width,
                    ellipsis: true
                })
            }
        }
    }, [isHover])
    
    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}>
            {/* <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={color}
            cornerRadius={5}
            opacity={isHover?0.75:0.4}
            strokeWidth={0.75}
            stroke={"gray"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.25}
            shadowColor={color}
            /> */}
            <Label
            x={0}
            y={0}
            ref={taskPromptRef}
            opacity={isHover?1:0.75}
            >
                {/* {isHover ? <Tag
                fill={color}
                cornerRadius={5}
                // strokeWidth={0.15}
                // stroke={"gray"}
                // shadowOffsetY={1}
                // shadowOffsetX={0}
                // shadowBlur={1}
                // shadowOpacity={0.25}
                // shadowColor={"gray"}
                /> : */}
                <Tag
                fill={color}
                cornerRadius={5}
                />
                <Text
                ref={textRef}
                text={text}
                fontSize={fontSize}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                width={width}
                height={height}
                ellipsis={true}
                padding={5}/>
            </Label>
            {/* <Text
            x={10}
            y={10}
            width={width-20}
            height={height-20}
            fontSize={fontSize}
            text={text}
            /> */}
        </Group>
    )
}