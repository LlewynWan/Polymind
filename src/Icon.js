import React, { useState } from "react";
import { Group, Line, Circle } from "react-konva";


export function Icon({
    x,
    y,
    type,
    onClick
}) {
    const [isHover, setIsHover] = useState(false);

    return  type === "add" ? 
    (<Group
    x={x}
    y={y}
    onMouseEnter={(e)=>{
        setIsHover(true);
        e.target.getStage().container().style.cursor = "pointer"
    }}
    onMouseLeave={(e)=>{
        setIsHover(false);
        e.target.getStage().container().style.cursor = "default"
    }}
    onClick={onClick}>
        <Circle
        radius={10}
        fill={"transparent"}
        stroke={isHover?"black":"gray"}
        strokeWidth={1.5}/>
        <Line
        points={[-5,0,5,0]}
        stroke={isHover?"black":"gray"}
        strokeWidth={1.5}/>
        <Line
        points={[0,-5,0,5]}
        stroke={isHover?"black":"gray"}
        strokeWidth={1.5}/>
    </Group>)
    : type === "cross" ?
    (<Group
    x={x}
    y={y}
    opacity={isHover?1:0.75}
    onMouseEnter={(e)=>{
        setIsHover(true);
        e.target.getStage().container().style.cursor = "pointer"
    }}
    onMouseLeave={(e)=>{
        setIsHover(false);
        e.target.getStage().container().style.cursor = "default"
    }}
    onClick={onClick}>
        <Circle
        radius={10}
        fill={"transparent"}
        stroke={"#8B0000"}
        strokeWidth={1.5}/>
        <Line
        points={[-5,-5,5,5]}
        stroke={"#8B0000"}
        strokeWidth={1.5}/>
        <Line
        points={[-5,5,5,-5]}
        stroke={"#8B0000"}
        strokeWidth={1.5}/>
    </Group>) : null
    // return type === "add" ?
    // (
    //     <Circle
    //     radius={10}
    //     fill={"transparent"}
    //     stroke={isHover?"black":"gray"}
    //     strokeWidth={1.5}/>
    //     <Line
    //     points={[-5,0,5,0]}
    //     stroke={isHover?"black":"gray"}
    //     strokeWidth={1.5}/>
    //     <Line
    //     points={[0,-5,0,5]}
    //     stroke={isHover?"black":"gray"}
    //     strokeWidth={1.5}/>
    // </Group>) : 
    // type === "cross" ? 
    // (<Group
    // x={x}
    // y={y
    // }>

    // ) : null
}