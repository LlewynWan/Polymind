import React, { useEffect, useState } from "react";
import { Group, Rect, Label, Tag, Text, Line } from "react-konva";

import { Icon } from "./Icon";
import { TextInput } from "./TextInput";

import { colorMap } from "./utils/color_utils";
import { getTextWidth } from "./utils/size_utils";
import { nextType, prevType } from "./utils/task_utils";


export function TaskCard({
    x,y,
    width,
    height,
    color,
    goal,
    suggestions,
    inputType,
    outputType,
    examplePrompt,
    deleteTask,
    toggleDisplay,
    handlePromptTextChange,
    setIOType
})
{
    const [isHover, setIsHover] = useState(false);
    const [pageNum, setPageNum] = useState(0);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    
    const rectRef = React.useRef(null);
    const cardRef = React.useRef(null);
    const expandIconRef = React.useRef(null);
    const page1Ref = React.useRef(null);
    const page2Ref = React.useRef(null);
    // const colorMap = {
    //     "Keyword": "#AFC6D9",
    //     "Concept": "#5880A2",
    //     "Sticky Note": "#003A6B",
    //     "Section": "#80D8FF",
    //     "Nodes": "#112233",
    //     "Lines": "#C3E7FD"
    // }

    const RETURN_KEY = 13;
    const ESCAPE_KEY = 27;
    function handleEscapeKeys(e) {
        if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
            setIsEditingPrompt(false);
        }
    }

    useEffect(()=>{
        if (pageNum===0) {
            page1Ref.current.setAttrs({opacity: 0});
            page1Ref.current.to({opacity: 1});
        } else {
            page2Ref.current.setAttrs({opacity: 0});
            page2Ref.current.to({opacity: 1});
        }
    }, [pageNum])

    return (
    <Group
    x={x}
    y={y}
    ref={cardRef}
    onMouseEnter={()=>{
        setIsHover(true);
        // rectRef.current.to({height: height+75, duration: 0.25})
    }}
    onMouseLeave={()=>{
        setIsHover(false);
        // rectRef.current.to({height: height, duration: 0.25})
    }}>
        <Rect
        x={0}
        y={0}
        ref={rectRef}
        width={width}
        height={height}
        cornerRadius={10}
        fill={"#F7F7F7"}
        strokeWidth={0.12}
        stroke={"#010203"}
        shadowColor={"grey"}
        shadowOffsetY={1.5}
        shadowOffsetX={0}
        shadowBlur={2.5}
        shadowOpacity={0.32}
        // strokeWidth={0.25}
        // stroke={"grey"}
        // shadowColor={"black"}
        // shadowOffsetY={1.5}
        // shadowOffsetX={0}
        // shadowBlur={2.5}
        // shadowOpacity={0.32}
        />

        <Group
        x={width/2}
        y={height-15}
        onMouseEnter={(e)=>{
            // e.target.setAttrs({stroke: "black"});
            e.target.getStage().container().style.cursor = "pointer"
        }}
        onMouseLeave={(e)=>{
            // e.target.setAttrs({stroke: "silver"});
            e.target.getStage().container().style.cursor = "default"
        }}
        onClick={()=>{
            setPageNum((pageNum+1)%2);
        }}
        ref={expandIconRef}>
            {pageNum===0? <Line
            points={[-15,0,0,5,15,0]}
            stroke={"silver"}
            /> : <Line
            points={[-15,5,0,0,15,5]}
            stroke={"silver"}
            />}
            <Rect
            x={-17.5}
            y={-2.5}
            width={35}
            height={7.5}
            fill={"transparent"}/>
        </Group>

        <Icon
        x={width-20}
        y={20}
        type={"delete"}
        onClick={deleteTask}/>
        <Icon
        x={width-50}
        y={20}
        type={"visibility"}
        onClick={toggleDisplay}
        />
        
        <Label
        x={10}
        y={10}
        >
            <Tag
            fill={color}
            cornerRadius={5}
            />
            <Text
            text={goal}
            fontSize={18}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>

        <Group
        ref={page1Ref}
        visible={!pageNum}>

        <Icon
        x={width/2-5}
        y={80}
        type={"LArrow"}
        onClick={()=>setIOType(prevType(inputType),"input")}/>
        <Icon
        x={width-20}
        y={80}
        type={"RArrow"}
        onClick={()=>setIOType(nextType(inputType),"input")}/>
        <Icon
        x={width/2-5}
        y={110}
        type={"LArrow"}
        onClick={()=>setIOType(prevType(outputType),"output")}/>
        <Icon
        x={width-20}
        y={110}
        type={"RArrow"}
        onClick={()=>setIOType(nextType(outputType),"output")}/>
        
        <Label
        x={width/2-20}
        y={80}
        >
            <Tag
            // fill={"#B0B3B8"}
            fill={"#C0C2CE"}
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
        x={width/2+10}
        y={80}
        >
            <Tag
            fill={colorMap[inputType]}
            // fill={inputType==="Sticky Note" ? "#003A6B"
            // : inputType==="Concept" ? "#5880A2"
            // : inputType==="Keyword" ? "#AFC6D9" : "#80D8FF"}
            cornerRadius={5}
            pointerDirection={"left"}
            // pointerWidth={5}
            // pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            width={width/2-45}
            align={"center"}
            text={inputType}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>
        
        <Label
        x={width/2-20}
        y={110}
        >
            <Tag
            // fill={"#B0B3B8"}
            fill={"#C0C2CE"}
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
        x={width/2+10}
        y={110}
        >
            <Tag
            fill={colorMap[outputType]}
            // fill={outputType==="Sticky Note" ? "#003A6B"
            // : outputType==="Concept" ? "#5880A2"
            // : outputType==="Keyword" ? "#AFC6D9"  : "#80D8FF"}
            cornerRadius={5}
            pointerDirection={"left"}
            // pointerWidth={5}
            // pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            width={width/2-45}
            align={"center"}
            text={outputType}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>
        </Group>

        <Group
        ref={page2Ref}
        visible={pageNum===1}>
        <Label
        x={width/2-57.5}
        y={95}
        >
            <Tag
            // fill={"#B0B3B8"}
            fill={"#C0C2CE"}
            cornerRadius={5}
            // stroke={"#010203"}
            // strokeWidth={0.12}
            pointerDirection={"right"}
            pointerWidth={5}
            pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            text={"Prompt"}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label>
        <Group
        x={width/2-47.5}
        y={70}>
        <Label
        x={0}
        y={0}>
            <Tag
            // x={0}
            // y={-17}
            fill={"#222233"}
            opacity={0.85}
            cornerRadius={5}
            // pointerDirection={"left"}
            // lineJoin={'round'}
            />
            {isEditingPrompt && pageNum===1 ?
            <TextInput
            x={5}
            y={4.5}
            width={width/2+18}
            height={61}
            // height={height-79}
            // height={height-99}
            fontSize={12}
            fontStyle={"bold"}
            fontColor={"silver"}
            // padding={5}
            value={examplePrompt}
            onChange={(e)=>handlePromptTextChange(e.currentTarget.value)}
            onKeyDown={handleEscapeKeys}/>
            : <Text
            // x={0}
            // y={-17}
            text={examplePrompt}
            width={width/2+35}
            // height={height-70}
            height={70}
            ellipsis={true}
            fontSize={12}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"silver"}
            padding={5}
            onDblClick={(e)=>{
                e.cancelBubble = true;
                setIsEditingPrompt(!isEditingPrompt);
            }}
            />}
        </Label>
        {suggestions.length>0 ?
        <Group
        x={0}
        y={-10}>
            {/* <Icon
            // x={width/2+25-getTextWidth(suggestions[suggestionIndex], 11, "bold", 3.5)}
            x={width/2+30}
            y={0}
            type={"RArrow"}
            onClick={()=>{
                setSuggestionIndex((suggestionIndex+1)%suggestions.length);
            }}/> */}
            {suggestions.slice(0,3).map((suggestion,index)=>{
                // return width/2+35-(index+1)*55 > 0 ?
                return <Label
                key={index}
                x={width/2+35-(2-index)*55}
                y={0}
                onMouseEnter={(e)=>{e.target.getStage().container().style.cursor = "pointer"}}
                onMouseLeave={(e)=>{e.target.getStage().container().style.cursor = "default"}}>
                    <Tag
                    cornerRadius={5}
                    // stroke={"#222233"}
                    // strokeWidth={1.5}
                    fill={"silver"}
                    pointerDirection={"right"}/>
                    <Text
                    text={suggestion}
                    width={55}
                    height={18}
                    padding={3.5}
                    fontSize={11}
                    align={"center"}
                    ellipsis={true}
                    fontStyle={"bold"}
                    fill={"#444444"}
                    onMouseEnter={(e)=>{
                        if (getTextWidth(suggestion,11,"bold",3.5) > 55)
                            e.target.setAttrs({Ellipsis: false, width: null})
                    }}
                    onMouseLeave={(e)=>{e.target.setAttrs({Ellipsis: true, width: 55})}}
                    />
                </Label>
            })}
        </Group> : null}
        {/* <SuggestionPanel
        x={width/2+35}
        y={-11}
        padding={1}
        fontSize={10}
        fontColor={"#444444"}
        pointerDirection={"right"}
        // stroke={false}
        suggestions={suggestions.slice(0,1)}/> */}
        </Group>
        </Group>
        {/* <Label
        x={width/2-50}
        y={150}
        >
            <Tag
            fill={"#B0B3B8"}
            cornerRadius={5}
            pointerDirection={"down"}
            pointerWidth={5}
            pointerHeight={5}
            lineJoin={'round'}
            />
            <Text
            text={"Example Prompt"}
            fontSize={14}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"white"}
            padding={5}/>
        </Label> */}
    </Group>
    )
}