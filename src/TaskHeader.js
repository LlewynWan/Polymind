import React, { useState, useEffect, useRef } from "react";

import Konva from "konva";

import { colorPalette } from "./color_utils";
import { Group, Label, Tag, Text, Rect, Circle } from "react-konva";


export function TaskHeader({
    x,y,
    tasks,
    scale,
    width,
    fontSize,
}) {
    const [isHover, setIsHover] = useState(false);

    const [offsetX, setOffsetX] = useState(5);
    const [headerPositions, setHeaderPositions] = useState([0]);
    const [fontHeight, setFontHeight] = useState(0);
    const [isHoverHeader, setIsHoverHeader] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(0);
    const [currentHoverId, setCurrentHoverId] = useState(-1);

    const curtainRef = useRef(null);
    const promptRectRef = useRef(null);
    const promptCircleRef = useRef(null);

    const handleTaskHeaderWheel = e => {
        e.evt.preventDefault();
        e.cancelBubble=true;
        const offset = e.evt.deltaY < 0 ? 20 : -20;
        setOffsetX(Math.max(
            Math.min(offsetX+offset,5),width-15-headerPositions.slice(-1)[0]));
    }

    useEffect(()=>{
        var positions = [0];
        const test = new Konva.Text({text: "test", fontSize: fontSize, fontStyle: "bold",
            align: "center", verticalAlign: "middle", padding: 2.5});
        
        tasks.map(task=>{
            const tmp = new Konva.Text({text: task.goal, fontSize: fontSize, fontStyle: "bold",
            align: "center", verticalAlign: "middle", padding: 2.5});
            const newPosition = positions.slice(-1)[0] + tmp.width()+1.5;
            positions.push(newPosition);
        });
        setHeaderPositions(positions);
        setFontHeight(test.height());
    }, [tasks, fontSize])

    return (
    <Group
    x={x}
    y={y}
    scaleX={scale}
    scaleY={scale}
    opacity={isHover?1:0.5}
    onWheel={handleTaskHeaderWheel}
    onMouseEnter={()=>{
        setIsHover(true);
    }}
    onMouseLeave={()=>{
        setIsHover(false);
        setCurrentHoverId(-1);
        clearTimeout(hoverTimeout);
        setIsHoverHeader(false)
    }}>
        {/* <Rect
        x={0}
        y={-8-fontHeight}
        width={width}
        height={fontHeight*2+8}
        cornerRadius={2.5}
        stroke={"gray"}
        strokeWidth={0.25}
        shadowBlur={5}
        shadowOffsetX={0}
        shadowOffsetY={1.5}
        shadowOpacity={0.15}
        shadowColor={"black"}
        fill={"#444444"}
        /> */}
        <Rect
        x={0}
        y={-fontHeight-12}
        width={width}
        height={fontHeight*2+16}
        stroke={"gray"}
        strokeWidth={0.25}
        cornerRadius={5}
        shadowBlur={5}
        shadowOffsetX={0}
        shadowOffsetY={1.5}
        shadowOpacity={0.15}
        shadowColor={"black"}
        fill={"white"}/>
        <Rect
        x={0}
        y={-4}
        // y={-fontHeight-12}
        width={width}
        height={fontHeight+8}
        cornerRadius={5}
        fill={"#E1E1E1"}/>

        <Circle
        x={10}
        y={-8-fontHeight/2}
        // y={fontHeight/2}
        ref={promptCircleRef}
        radius={10}
        fill={"silver"}/>
        <Label
        x={20}
        y={-8-fontHeight/2}
        // y={fontHeight/2}
        >
            <Tag
            ref={promptRectRef}
            fill={"silver"}
            cornerRadius={2.5}
            pointerDirection={"left"}
            pointerWidth={5}
            pointerHeight={5}/>
            <Text
            text={"......"}
            fontSize={fontSize}
            // width={20}
            // height={20}
            fontStyle={"bold"}
            // Ellipsis={true}
            align={"center"}
            verticalAlign={"middle"}
            fill={"white"}
            padding={2.5}
            />
        </Label>

        <Group
        x={0}
        y={0}
        // y={-fontHeight-8}
        clipX={5}
        clipY={-window.innerHeight}
        clipWidth={width-10}
        clipHeight={window.innerHeight*2}>
        {tasks.slice(0).reverse().map(task=>{
            return (
                <Label
                key={task.id}
                // x={task.id*25+offsetX}
                x={headerPositions[task.id]+offsetX}
                y={0}
                // onWheel={(e)=>{clearTimeout(hoverTimeout)}}
                onMouseEnter={(e)=>{
                    if (task.id !== currentHoverId) {
                        clearTimeout(hoverTimeout);
                        setCurrentHoverId(task.id);
                        setHoverTimeout(setTimeout(()=>{
                            setIsHoverHeader(true);
                            curtainRef.current.to({
                                fill: colorPalette[task.id%colorPalette.length],
                                width: width,
                                duration: 0.25,
                                easing: Konva.Easings.EaseOut,
                                onFinish: ()=>{
                                    promptRectRef.current.to({
                                        fill: colorPalette[task.id%colorPalette.length],
                                        opacity: 0.75,
                                        duration: 0.25
                                    });
                                    promptCircleRef.current.to({
                                        fill: colorPalette[task.id%colorPalette.length],
                                        opacity: 0.75,
                                        duration: 0.25
                                    });
                                }
                            })
                        }, 1800));
                    }
                    e.target.parent.to({y: -1, duration: 0.15})
                    e.target.to({fontSize: fontSize+2, duration: 0.15})
                    
                }}
                onMouseLeave={(e)=>{
                    if (currentHoverId === task.id) {
                        clearTimeout(hoverTimeout);
                    }
                    e.target.parent.to({y: 0, duration: 0.15})
                    e.target.to({fontSize: fontSize, duration: 0.15})
                }}>
                    <Tag
                    fill={colorPalette[task.id%colorPalette.length]}
                    cornerRadius={2.5}/>
                    <Text
                    text={task.goal}
                    fontSize={fontSize}
                    // width={20}
                    // height={20}
                    fontStyle={"bold"}
                    // Ellipsis={true}
                    align={"center"}
                    verticalAlign={"middle"}
                    fill={"white"}
                    padding={2.5}
                    />
                </Label>
                // <Circle
                // key={task.id}
                // x={task.id*15}
                // y={0}
                // radius={5}
                // fill={colorPalette[task.id%colorPalette.length]}
                // />
            )
        })}
        </Group>

        <Rect
        x={0}
        y={-4}
        width={0}
        height={fontHeight+8}
        cornerRadius={2.5}
        visible={isHoverHeader}
        ref={curtainRef}
        onMouseLeave={()=>{
            setCurrentHoverId(-1);
            clearTimeout(hoverTimeout)
            curtainRef.current.to({
                width: 0,
                duration: 0.25,
                easing: Konva.Easings.EaseOut,
                onFinish: ()=> {
                    setIsHoverHeader(false);
                    promptRectRef.current.to({
                        fill: "silver",
                        opacity: 1,
                        duration: 0.25
                    });
                    promptCircleRef.current.to({
                        fill: "silver",
                        opacity: 1,
                        duration: 0.25
                    });
                }
            });
        }}/>
    </Group>
    )
}
