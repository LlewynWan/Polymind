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
    notificationSet
}) {
    const {taskNodes} = useContext(CanvasContext);
    // const [previewTaskId, setPreviewTaskId] = useState(-1);
    const [summary, setSummary] = useState({});
    const [mainView, setMainView] = useState([-1,""]);
    const [minorView, setMinorView] = useState([-1,""]);
    const [viewIndex, setViewIndex] = useState(0);

    useEffect(()=>{
        const keys = Object.keys(summary);
        const viewThread = setInterval(()=>{
            setMainView(summary[viewIndex]);
            setMinorView(summary[(viewIndex+1)%keys.length])
            setViewIndex(viewIndex=>(viewIndex+1)%keys.length);
        },1500)
        return () => {
            clearInterval(viewThread);
        };
    },[summary])

    useEffect(()=>{
        taskNodes.filter(node=>notificationSet.has(node.task_id)).forEach(node => {
            summarize(node.prompt, node.text, (result)=>{
                setSummary(prevState=>{
                    let tmp = prevState;
                    tmp[node.id] = [node.task_id, result];
                    return tmp
                })
            })
        });
    }, [notificationSet])

    return (
    <Group
    x={x-20}
    y={y-height-5}
    visible={visible}
    listening={false}
    opacity={0.75}>
        {/* <Rect
        x={0}
        y={0}
        width={width+40}
        height={height}
        cornerRadius={5}
        fill={"white"}
        perfectDrawEnabled={false}/> */}
        {mainView[0]!==-1?<Label
        x={2.5}
        y={2.5+0*15}>
            <Tag
            fill={colorPalette[mainView[0]%colorPalette.length]}
            cornerRadius={2.5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            lineJoin={'round'}
            perfectDrawEnabled={false}
            />
            <Text
            width={width+35}
            height={12}
            text={mainView[1]?mainView[1]:""}
            fontSize={10}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={2.5}
            perfectDrawEnabled={false}
            Ellipse={true}/>
        </Label>:null}
    </Group>
    )
}