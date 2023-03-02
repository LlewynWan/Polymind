import React, { useState, useEffect, useRef } from "react";

import Konva from "konva";

import { colorPalette } from "./color_utils";
import { Group, Label, Tag, Text, Rect } from "react-konva";


export function TaskHeader({
    x,y,
    tasks,
    scale,
    fontSize,
}) {
    const [offsetX, setOffsetX] = useState(5);
    const [headerPositions, setHeaderPositions] = useState([0]);
    const [fontHeight, setFontHeight] = useState(0);
    const [isHoverHeader, setIsHoverHeader] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(0);
    const [currentHoverId, setCurrentHoverId] = useState(-1);

    const curtainRef = useRef(null);

    const handleTaskHeaderWheel = e => {
        e.evt.preventDefault();
        e.cancelBubble=true;
        const offset = e.evt.deltaY < 0 ? 20 : -20;
        setOffsetX(Math.max(
            Math.min(offsetX+offset,5),135-headerPositions.slice(-1)[0]));
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
    onWheel={handleTaskHeaderWheel}
    onMouseLeave={()=>{
        setCurrentHoverId(-1);
        clearTimeout(hoverTimeout);
        setIsHoverHeader(false)
    }}>
        <Rect
        x={0}
        y={-4}
        width={150}
        height={fontHeight+8}
        stroke={"gray"}
        strokeWidth={0.25}
        cornerRadius={2.5}
        shadowBlur={5}
        shadowOffsetX={0}
        shadowOffsetY={1.5}
        shadowOpacity={0.15}
        shadowColor={"black"}
        fill={"#E1E1E1"}/>

        <Group
        x={0}
        y={0}
        clipX={5}
        clipY={-window.innerHeight}
        clipWidth={140}
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
                                width: 150,
                                duration: 0.25,
                                easing: Konva.Easings.EaseOut,
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
                onFinish: ()=>setIsHoverHeader(false)
            });
        }}/>
    </Group>
    )
}
