import React, { useState } from "react";
import { Group, Label, Rect, Text } from "react-konva";

import { colorPalette } from "./color_utils";
import { TaskCard } from "./TaskCard";


export function TaskBoard({
    x,
    y,
    width,
    height,
    tasks
})
{
    // const colorPalette = ["#FFB347", "#966FD6", "#71C562", "#FB6B89", "#B39EB5", "#D64A4A"]
    const [isHover, setIsHover] = useState(false);
    const [taskCardOffset, setTaskCardOffset] = useState(100);

    const handleTaskBoardWheel = e => {
        e.evt.preventDefault();
        e.cancelBubble=true;
        const offset = e.evt.deltaY < 0 ? 15 : -15;
        if (taskCardOffset+offset + (tasks.length-1)*145+125 >= height-35) {
            setTaskCardOffset(Math.min(taskCardOffset+offset,100));
        }
        // const newScale = canvasScale * scaleBy
        // setCanvasScale(newScale);
        
        // const position = e.target.getStage().getPointerPosition();
        // const offsetX = (position.x - canvasX) * (scaleBy - 1);
        // const offsetY = (position.y - canvasY) * (scaleBy - 1);
        // setCanvasX(canvasX - offsetX);
        // setCanvasY(canvasY - offsetY);
    }

    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}
        onWheel={handleTaskBoardWheel}>
            <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            cornerRadius={10}
            fill={"#D3D3D3"}
            opacity={0.6}
            strokeWidth={0.32}
            stroke={"#010203"}
            // shadowColor={"black"}
            // shadowOffsetY={2.5}
            // shadowOffsetX={0}
            // shadowBlur={5}
            // shadowOpacity={0.25}
            />
            <Text
            x={20}
            y={25}
            text={"Task Board"}
            fontSize={20}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"black"}
            />
            <Group
            x={0}
            y={0}
            clipX={-window.innerWidth}
            clipY={95}
            clipWidth={window.innerWidth*2}
            clipHeight={height-115}>
            {tasks.map((task,index)=>{
                return (
                    <TaskCard
                    key={task.id}
                    x={15}
                    y={taskCardOffset+145*task.id}
                    width={width-30}
                    height={125}
                    color={colorPalette[task.id%colorPalette.length]}
                    goal={task.goal}
                    inputType={task.inputType}
                    outputType={task.outputType}
                    />
                )
            })}
            </Group>
            
            {/* <TaskCard
            x={25}
            y={100}
            width={width-50}
            height={125}
            color={"#FFB347"}
            goal={"Brainstorm"}
            outputType={"Keyword"}
            />
            <TaskCard
            x={25}
            y={250}
            width={width-50}
            height={125}
            color={"#966FD6"}
            goal={"Summarise"}
            outputType={"Concept"}
            />
            <TaskCard
            x={25}
            y={400}
            width={width-50}
            height={125}
            color={"#71C562"}
            goal={"Clarify"}
            outputType={"Sticky Note"}
            />
            <TaskCard
            x={25}
            y={550}
            width={width-50}
            height={125}
            color={"#FB6B89"}
            goal={"Draft"}
            outputType={"Section"}
            /> */}
        </Group>
    )
}