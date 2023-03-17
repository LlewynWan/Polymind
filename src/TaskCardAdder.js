import React, { useEffect, useState } from "react";
import { Group, Rect, Label, Tag, Text, Arrow } from "react-konva";

import { Icon } from "./Icon";
import { TextInput } from "./TextInput";


export function TaskCardAdder({
    x,
    y,
    width,
    visible,
    onConfirm,
    onCancel,
    taskName,
    handleTaskNameChange
}) {
    const handleTextHover = (e) => {
        e.target.getStage().container().style.cursor = "pointer"
        // e.target.setAttrs({fill: "black", stroke: "black"});
    }
    const handleTextUnhover = (e) => {
        e.target.getStage().container().style.cursor = "default"
        // e.target.setAttrs({fill: "#646464", stroke: "#646464"});
    }

    const [isEditingTaskName, setIsEditingTaskName] = useState(false);
    const RETURN_KEY = 13;
    const ESCAPE_KEY = 27;
    function handleEscapeKeys(e) {
        if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
            setIsEditingTaskName(false);
        }
    }

    return (
    <Group
    x={x}
    y={y}
    visible={visible}>
        <Rect
        x={15}
        y={0}
        height={50}
        width={width-30}
        fill={"silver"}
        cornerRadius={5}
        />
                
        <Label
        x={25}
        y={10}
        >
            <Tag
            fill={"#646464"}
            cornerRadius={5}
            visible={!isEditingTaskName}
            />
            {isEditingTaskName ?
            <TextInput
            x={5}
            y={4.5}
            width={width-110}
            height={20}
            value={taskName}
            fontSize={18}
            fontStyle={"bold"}
            fontColor={"white"}
            onKeyDown={handleEscapeKeys}
            onChange={(e)=>handleTaskNameChange(e.target.value)}
            /> :
            <Text
            text={taskName}
            fontSize={18}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}
            onMouseEnter={handleTextHover}
            onMouseLeave={handleTextUnhover}
            onClick={()=>setIsEditingTaskName(true)}/>
            }
        </Label>

        <Icon
        x={width-35}
        y={32}
        type={"confirm"}
        onClick={()=>{
            setIsEditingTaskName(false);
            onConfirm();
        }}/>
        <Icon
        x={width-60}
        y={32}
        type={"cross"}
        onClick={()=>{
            setIsEditingTaskName(false);
            onCancel();
        }}/>

        {/* <Label
        x={width/2-25}
        y={65}
        >
            <Tag
            // fill={"#B0B3B8"}
            // fill={"#C0C2CE"}
            fill={"#646464"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"right"}
            pointerWidth={5}
            pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            text={"Input Type"}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>
        <Label
        x={width/2-25}
        y={95}
        >
            <Tag
            // fill={"#B0B3B8"}
            // fill={"#C0C2CE"}
            fill={"#646464"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"right"}
            pointerWidth={5}
            pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            text={"Output Type"}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>
        <Label
        x={width/2}
        y={120}
        >
            <Tag
            // fill={"#B0B3B8"}
            // fill={"#C0C2CE"}
            fill={"#646464"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"up"}
            lineJoin={'round'}
            />
            <Text
            width={width-200}
            text={"Prompt"}
            fontSize={12}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            align={"center"}
            padding={5}/>
        </Label>

        <Icon
        x={width-35}
        y={145}
        type={"confirm"}
        onClick={onConfirm}/>
        <Icon
        x={width-60}
        y={145}
        type={"cross"}
        onClick={()=>{}}/>

        <Arrow
        x={width/2-10}
        y={53}
        points={[12.5,12,10,12,7.5,12]}
        fill={"#646464"}
        stroke={"#646464"}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowUnhover}/>
        <Label
        x={width/2+10}
        y={65}
        >
            <Tag
            // fill={"#B0B3B8"}
            fill={"transparent"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"left"}
            lineJoin={'round'}
            />
            <Text
            width={width/2-60}
            text={"Sticky Note"}
            fontSize={12}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"#212121"}
            align={"center"}
            verticalAlign={"middle"}
            padding={3}/>
        </Label>
        <Arrow
        x={width/2-30}
        y={53}
        points={[width/2-12.5,12,width/2-10,12,width/2-7.5,12]}
        fill={"#646464"}
        stroke={"#646464"}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowUnhover}/>

        <Arrow
        x={width/2-10}
        y={83}
        points={[12.5,12,10,12,7.5,12]}
        fill={"#646464"}
        stroke={"#646464"}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowUnhover}/>
        <Label
        x={width/2+10}
        y={95}
        >
            <Tag
            // fill={"#B0B3B8"}
            fill={"transparent"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"left"}
            lineJoin={'round'}
            />
            <Text
            width={width/2-60}
            text={"Sticky Note"}
            fontSize={12}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"#212121"}
            align={"center"}
            verticalAlign={"middle"}
            padding={3}/>
        </Label>
        <Arrow
        x={width/2-30}
        y={83}
        points={[width/2-12.5,12,width/2-10,12,width/2-7.5,12]}
        fill={"#646464"}
        stroke={"#646464"}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={handleArrowHover}
        onMouseLeave={handleArrowUnhover}/> */}
    </Group>
    )
}