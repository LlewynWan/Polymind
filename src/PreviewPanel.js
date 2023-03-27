import React from "react";
import { Group, Rect } from "react-konva";

import Konva from "konva";

import { Icon } from "./Icon";
import { NewsTicker } from "./NewsTicker";
import { colorPalette } from "./utils/color_utils";


export function PreviewPanel ({
    x,
    y,
    width,
    height,
    tasks,
    visible,
    taskSummaryMap,
    expandAll
}) {

    return (
    <Group
    x={x-20}
    y={y}
    visible={visible}
    // listening={false}
    opacity={0.75}>
        <Rect
        x={0}
        y={-12}
        width={width+40}
        height={12}
        fill={"transparent"}/>
        {/* <Rect
        x={0}
        y={0}
        width={width+40}
        height={height}
        cornerRadius={5}
        fill={"white"}
        perfectDrawEnabled={false}/> */}
        {tasks.map((task,index)=>{
        return (
            <NewsTicker
            x={0}
            y={-20-index*15}
            width={width}
            text={taskSummaryMap[task.id]?taskSummaryMap[task.id]:""}
            color={colorPalette[task.id%colorPalette.length]}
            fontSize={10}/>
        )})}
        {tasks.length!==0?<Rect
        x={width+40}
        y={-5-tasks.length*15}
        width={10}
        height={tasks.length*15+10}
        fill={"transparent"}/>:null}
        {tasks.length!==0?<Icon
        x={width+45}
        y={-tasks.length*15/2-5}
        type={"forward"}
        onClick={expandAll}/>:null}
    </Group>
    )
}