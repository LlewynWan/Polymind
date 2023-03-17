import React, { useEffect, useState } from "react";
import { Group, Rect, Text, Label, Tag } from "react-konva";

import { colorPalette } from "./utils/color_utils";

import { Icon } from "./Icon";
import { TaskCard } from "./TaskCard";
import { TaskCardAdder } from "./TaskCardAdder";


export function TaskBoard({
    x,
    y,
    width,
    height,
    tasks,
    listening,
    deleteTask,
    toggleTaskHeaderSwitch,
    toggleDisplay,
    handlePromptTextChange,
    setIOType,
    onAddTask
})
{
    // const colorPalette = ["#FFB347", "#966FD6", "#71C562", "#FB6B89", "#B39EB5", "#D64A4A"]
    const [isHover, setIsHover] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [taskCardOffset, setTaskCardOffset] = useState(120);

    const [newTaskName, setNewTaskName] = useState("Task Name");

    const panelRef = React.useRef(null);
    const cardsRef = React.useRef(null);

    const handleTaskBoardWheel = e => {
        e.evt.preventDefault();
        e.cancelBubble=true;
        const offset = e.evt.deltaY < 0 ? 20 : -20;
        if (taskCardOffset+offset <= 120 &&
            taskCardOffset+offset >= height-(tasks.length-1)*160-205)
            {
                setTaskCardOffset(taskCardOffset+offset)
            } else if (taskCardOffset < height-(tasks.length-1)*160-205
            && taskCardOffset+offset <= 120 && offset > 0) {
                setTaskCardOffset(taskCardOffset+offset)
            }
        // if (offset < 0) {
        //     setTaskCardOffset(Math.max(Math.min(taskCardOffset+offset,
        //         height-(tasks.length-1)*145-160), 100));
        // } else {
        //     setTaskCardOffset(Math.max(Math.min(taskCardOffset+offset, 100),
        //         height-(tasks.length-1)*145-160));
        // }
        
        // if (taskCardOffset+offset + (tasks.length-1)*145+125 >= height-35) {
        //     setTaskCardOffset(Math.min(taskCardOffset+offset,100));
        // }
    }

    // useEffect(()=>{
    //     cardsRef.current.to({
    //         opacity: 1,
    //         duration: 0.25
    //     })
    // }, [tasks])

    return (
        <Group
        x={x}
        y={y}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}
        onWheel={handleTaskBoardWheel}
        listening={listening}>
            <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            cornerRadius={5}
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
            <Icon
            x={155}
            y={35}
            type={"add"}
            onClick={()=>{
                cardsRef.current.to({
                    y:30,
                    clipHeight:height-175,
                    duration: 0.32
                });
                panelRef.current.to({
                    y:140,
                    height: height-140,
                    duration: 0.32
                })
                setIsAddingCard(true);
            }}/>
            <Icon
            x={225}
            y={35}
            type={"switch"}
            onClick={toggleTaskHeaderSwitch}/>

            <TaskCardAdder
            x={0}
            y={65}
            width={width}
            visible={isAddingCard}
            taskName={newTaskName}
            onConfirm={()=>{
                setIsAddingCard(false);
                onAddTask(newTaskName);
                setNewTaskName("Task Name");
                cardsRef.current.to({
                    y:0,
                    clipHeight:height-145,
                    duration: 0.32
                });
                panelRef.current.to({
                    y:110,
                    height: height-110,
                    duration: 0.32
                })
            }}
            onCancel={()=>{
                setIsAddingCard(false);
                setNewTaskName("Task Name");
                cardsRef.current.to({
                    y:0,
                    clipHeight:height-145,
                    duration: 0.32
                });
                panelRef.current.to({
                    y:110,
                    height: height-110,
                    duration: 0.32
                });
            }}
            handleTaskNameChange={(value)=>setNewTaskName(value)}/>

            
            {/* <Group
            x={160}
            y={35}
            onMouseEnter={(e)=>{
                setIsHoverAddIcon(true);
                e.target.getStage().container().style.cursor = "pointer"
            }}
            onMouseLeave={(e)=>{
                setIsHoverAddIcon(false);
                e.target.getStage().container().style.cursor = "default"
            }}>
                <Circle
                x={0}
                y={0}
                radius={10}
                fill={"transparent"}
                stroke={isHoverAddIcon?"black":"gray"}
                strokeWidth={1.5}
                />
                <Line
                points={[-5,0,5,0]}
                stroke={isHoverAddIcon?"black":"gray"}
                strokeWidth={1.5}/>
                <Line
                points={[0,-5,0,5]}
                stroke={isHoverAddIcon?"black":"gray"}
                strokeWidth={1.5}/>
            </Group> */}

            <Group>
            <Rect
            x={0}
            y={110}
            cornerRadius={5}
            width={width}
            // height={height-135}
            height={height-110}
            opacity={0.75}
            fill={"#D3D3D3"}
            ref={panelRef}
            />
            <Group
            x={0}
            y={0}
            clipX={-window.innerWidth}
            clipY={115}
            clipWidth={window.innerWidth*2}
            clipHeight={height-145}
            ref={cardsRef}>
            {tasks.map((task,index)=>{
                return (
                    <TaskCard
                    key={task.id}
                    x={15}
                    y={taskCardOffset+160*index}
                    width={width-30}
                    height={140}
                    color={colorPalette[task.id%colorPalette.length]}
                    goal={task.goal}
                    inputType={task.inputType}
                    outputType={task.outputType}
                    examplePrompt={task.examplePrompt}
                    deleteTask={()=>deleteTask(task.id)}
                    toggleDisplay={()=>toggleDisplay(task.id)}
                    handlePromptTextChange={(value)=>handlePromptTextChange(value,task.id)}
                    setIOType={(type, IOType) => setIOType(task.id, type, IOType)}
                    />
                )
            })}
            </Group>
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