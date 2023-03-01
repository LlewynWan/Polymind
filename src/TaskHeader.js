import React, { useState, useEffect, useRef } from "react";

import { colorPalette } from "./color_utils";
import { Group, Circle } from "react-konva";


export function TaskHeader({
    x,y,
    tasks
}) {
    return (
    <Group
    x={x}
    y={y}>
        {tasks.map(task=>{
            return (
                <Circle
                key={task.id}
                x={task.id*15}
                y={0}
                radius={5}
                fill={colorPalette[task.id%colorPalette.length]}
                />
            )
        })}
    </Group>
    )
}
