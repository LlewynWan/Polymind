import React, { useRef, useState } from "react";
import { Group, Line, Circle, Rect, Arc } from "react-konva";


export function Icon({
    x,
    y,
    type,
    onClick
}) {
    const [isHover, setIsHover] = useState(false);
    
    const switchRef = useRef(null);
    const switchPanelRef = useRef(null);
    const [switchState, setSwitchState] = useState(0);

    
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
        x={0}
        y={0}
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
    : type === "delete" ?
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
        x={0}
        y={0}
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
    </Group>)
    : type === "switch" ?
    <Group
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
    onClick={()=>{
        if (!switchState) {
            switchPanelRef.current.to({fill: "grey", duration: 0.15});
            switchRef.current.to({
                x: 12.5,
                duration: 0.15,
                onFinish: ()=>{
                    setSwitchState((switchState+1)%2);
                    if (onClick) {
                        onClick();
                    }
                }
            })
        } else {
            switchPanelRef.current.to({fill: "#4BB543", duration: 0.15});
            switchRef.current.to({
                x: 37.5,
                duration: 0.15,
                onFinish: ()=>{
                    setSwitchState((switchState+1)%2);
                    if (onClick) {
                        onClick();
                    }
                }
            })
        }
    }}>
        <Rect
        x={0}
        y={-12.5}
        width={50}
        height={25}
        fill={"#4BB543"}
        cornerRadius={25}
        ref={switchPanelRef}
        // stroke={"silver"}
        // strokeWidth={1}
        />
        {/* <Rect
        x={27.5}
        y={-10}
        width={20}
        height={20}
        cornerRadius={5}
        fill={"white"}
        /> */}
        <Circle
        x={37.5}
        y={0}
        radius={10}
        fill={"white"}
        ref={switchRef}
        />
    </Group>
    : type === "confirm" ?
    <Group
    x={x}
    y={y}
    opacity={isHover?1:0.64}
    onMouseEnter={(e)=>{
        setIsHover(true);
        e.target.getStage().container().style.cursor = "pointer"
    }}
    onMouseLeave={(e)=>{
        setIsHover(false);
        e.target.getStage().container().style.cursor = "default"
    }}
    onClick={onClick}>
        <Rect
        x={-6}
        y={-6}
        width={18}
        height={12}
        fill={"transparent"}/>
        <Line
        points={[-6,0,0,6,12,-6]}
        stroke={"#4BB543"}
        strokeWidth={2.5}/>
    </Group>
    : type === "cross" ?
    <Group
    x={x}
    y={y}
    opacity={isHover?1:0.64}
    onMouseEnter={(e)=>{
        setIsHover(true);
        e.target.getStage().container().style.cursor = "pointer"
    }}
    onMouseLeave={(e)=>{
        setIsHover(false);
        e.target.getStage().container().style.cursor = "default"
    }}
    onClick={onClick}>
        <Rect
        x={-7}
        y={-7}
        width={14}
        height={14}
        fill={"transparent"}/>
        <Line
        points={[-7,-7,7,7]}
        stroke={"#8B0000"}
        strokeWidth={2.5}/>
        <Line
        points={[-7,7,7,-7]}
        stroke={"#8B0000"}
        strokeWidth={2.5}/>
    </Group>
    : type === "visibility" ?
    <Group
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
    onClick={(e)=>{
        setSwitchState((switchState+1)%2);
    }}>
        <Arc
        x={0}
        y={-5}
        innerRadius={13}
        outerRadius={15}
        fill={isHover?"#323232":"gray"}
        rotation={15}
        angle={150}/>
        <Circle
        x={0}
        y={0}
        radius={5}
        fill={"transparent"}
        stroke={isHover?"#323232":"gray"}
        strokeWidth={1.75}/>
        <Arc
        x={0}
        y={5}
        innerRadius={13}
        outerRadius={15}
        fill={isHover?"#323232":"gray"}
        rotation={195}
        angle={150}/>
        <Line
        x={0}
        y={0}
        visible={switchState===1}
        points={[-10,-10,10,10]}
        stroke={isHover?"#323232":"gray"}
        strokeWidth={2.5}/>
        <Rect
        x={-15}
        y={-10}
        width={30}
        height={20}
        fill={"transparent"}/>
    </Group>
    : null
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