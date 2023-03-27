import React, { useState, useRef, useContext, useEffect } from "react";
import { Group, Rect, Label, Tag, Text, Ellipse } from "react-konva";

import { colorPalette } from "./utils/color_utils";
import { summarize } from "./utils/GPT_utils";
import { CanvasContext } from "./state";


export function PreviewPanel ({
    x,
    y,
    width,
    height,
    visible,
    tasks
}) {
    const {taskNodes} = useContext(CanvasContext);
    // const [previewTaskId, setPreviewTaskId] = useState(-1);
    const [summary, setSummary] = useState({});

    useEffect(()=>{
        taskNodes.forEach(node => {
            summarize(node.prompt, node.text, (result)=>{
                setSummary(prevState=>{
                    let tmp = prevState;
                    tmp[node.id] = result;
                    return tmp
                })
            })
        });
    }, [tasks])

    return (
    <Group
    x={x}
    y={y-height-5}
    visible={visible}
    listening={false}
    opacity={0.75}>
        <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        cornerRadius={5}
        fill={"white"}
        perfectDrawEnabled={false}/>
        {taskNodes.map((node,index)=>{
            return (
                <Label
                x={5}
                y={5+index*17.5}
                key={node.id}>
                    <Tag
                    fill={colorPalette[node.task_id%colorPalette.length]}
                    cornerRadius={2.5}
                    // stroke={"#010203"}
                    // strokeWidth={0.12}
                    lineJoin={'round'}
                    perfectDrawEnabled={false}
                    />
                    <Text
                    width={width-5}
                    text={summary[node.id]?summary[node.id]:""}
                    fontSize={10}
                    fontStyle={"bold"}
                    fontFamily={"sans-serif"}
                    fill={"white"}
                    padding={2.5}
                    perfectDrawEnabled={false}/>
                </Label>
            )
            // summarize(node.prompt,node.text,(err,summary)=>{
            //     console.log(summary)
            // })
        })}
    </Group>
    )
}