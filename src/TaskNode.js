import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Tag, Text, Transformer, Ellipse } from "react-konva";

import Konva from "konva";

import { CanvasContext } from "./state";
import { sizeMap } from "./utils/size_utils";

import { Icon } from "./Icon";
import { SuggestionPanel } from "./SuggestionPanel";

import { explain } from "./utils/GPT_utils";


export function TaskNode({
    x,
    y,
    type,
    width,
    height,
    radiusX,
    radiusY,
    color,
    text,
    prompt,
    fontSize,
    onDragMove,
    onDragEnd,
    onConfirm,
    onDelete,
    onTextSizeChange,
    onTextHeightOverflow,
    handleRegenerate,
    listening,
    suggestions=["Be brief.", "Be more specific.", "Be creative."]
}) {
    const {canvasX, canvasY, canvasScale, microTasks} = useContext(CanvasContext);
    const [textHeight, setTextHeight] = useState(0);

    const [isHover, setIsHover] = useState(false);
    const [isHoverIcons, setIsHoverIcons] = useState(false);
    const [needsExplanation, setNeedsExplanation] = useState(false);
    const [explanation, setExplanation] = useState("......");

    const nodeRef = useRef(null);
    const suggestionRef = useRef(null);

    // const RETURN_KEY = 13;
    // const ESCAPE_KEY = 27;
    // function handleEscapeKeys(e) {
    //     if (e.keyCode === ESCAPE_KEY) {
    //         setNeedsExplanation(false);
    //         setExplanation("Why ...");
    //     }

    //     if ((e.keyCode === RETURN_KEY && !e.shiftKey)) {
    //         setExplanation((explanation)=>explanation+"\n\nBecause ...")
    //     }
    // }

    const handleLongText = text => {
        var pos = 0;
        var prev = 0;
        while (pos !== -1) {
            pos = text.indexOf(' ', pos+1);
            if (pos - prev > 30) {
                text = text.substring(0,pos)+'\n'+text.substring(pos+1);
                prev = pos;
            }
        }
        return text;
    }

    useEffect(() => {
        if (onTextHeightOverflow) {
            onTextHeightOverflow(textHeight);
        }
    }, [textHeight]);

    useEffect(() => {
        // if (!isSelected && isEditing) {
        //   setIsEditing(false);
        // }
        if (nodeRef.current) {
            // setAnchorPosition(calcAnchorPosition());
            if (onTextSizeChange) {
              onTextSizeChange(nodeRef.current.getClientRect());
            }
        }  
        
        const tmp = type === "concept" ?
        new Konva.Text({text: text, width: radiusX*2, fontSize: fontSize})
        : new Konva.Text({text: text, width: width, fontSize: fontSize});
        // if (type==="sticky_note")
        //     console.log(tmp.height());
        setTextHeight(tmp.height());
        tmp.destroy();
    }, [text, fontSize, canvasScale]);
    
    return (
    <Group
    x={x}
    y={y}
    onDragMove={(e)=>{
        if (onDragMove)
            onDragMove(e);
    }}
    onDragEnd={(e)=>{
        if (onDragEnd)
          onDragEnd(e);
    }}
    draggable
    onMouseEnter={()=>setIsHover(true)}
    onMouseLeave={()=>setIsHover(false)}
    listening={listening}>
    {type === "concept" ?
    <Group
    x={0}
    y={-Math.max(sizeMap[type].radiusY,textHeight)-12}
    scaleX={0.75}
    scaleY={0.75}
    // opacity={0.9}
    onMouseEnter={()=>{
        // suggestionRef.current.setAttrs({text: suggestions[Math.floor(Math.random()*suggestions.length)]})
        setIsHoverIcons(true);
    }}
    onMouseLeave={()=>setIsHoverIcons(false)}
    >
        <Rect
        x={-20}
        y={-15}
        width={45}
        height={30}
        fill={"transparent"}
        perfectDrawEnabled={false}/>
        <Group
        x={0}
        y={-15}
        visible={isHoverIcons?1:needsExplanation?1:0}
        // opacity={isHoverIcons?1:needsExplanation?1:0}
        >
            {needsExplanation ? 
            <Label
            x={30}
            y={-5}>
                <Tag
                fill={"white"}
                stroke={color}
                strokeWidth={1.5}
                cornerRadius={5}
                pointerDirection={"down"}
                perfectDrawEnabled={false}/>
                <Text
                text={explanation}
                fontSize={13.5}
                // fontStyle={"bold"}
                padding={5}
                perfectDrawEnabled={false}/>
            </Label> :
            <SuggestionPanel
            x={0}
            y={0}
            fontSize={14}
            fontColor={"#444444"}
            pointerDirection={"down"}
            suggestions={suggestions.slice(0,3)}
            handleRegenerate={handleRegenerate}/>}
            {/* <Label
            x={0}
            y={0}
            visible={isHoverIcons}
            onMouseEnter={(e)=>{e.target.getStage().container().style.cursor = "pointer"}}
            onMouseLeave={(e)=>{e.target.getStage().container().style.cursor = "default"}}
            >
                <Tag
                fill={"silver"}
                cornerRadius={5}
                pointerDirection={"down"}
                />
                <Text
                ref={suggestionRef}
                text={suggestions[0]}
                fontSize={16}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label> */}
        </Group>
        <Icon
        x={-20}
        y={0}
        type={"cross"}
        onClick={onDelete}
        />
        <Icon
        x={0}
        y={0}
        type={"confirm"}
        onClick={onConfirm}
        />
        <Icon
        x={20}
        y={0}
        type={"question"}
        enabled={needsExplanation}
        onClick={()=>{
            if (!needsExplanation) {
                explain(prompt, text, (result)=>{
                    // console.log(result.replace(/(.{30})/g,"$1\n"))
                    // setExplanation(result.replace(/(.{30})/g,"$1\n"));
                    setExplanation(handleLongText(result));
                });
            } else {
                setExplanation("......")
            }
            setNeedsExplanation(!needsExplanation);
        }}
        />
    </Group>
    :
    <Group
    x={12}
    y={-15}
    scaleX={0.75}
    scaleY={0.75}
    // opacity={0.9}
    onMouseEnter={()=>{
        // suggestionRef.current.setAttrs({text: suggestions[Math.floor(Math.random()*suggestions.length)]})
        setIsHoverIcons(true);
    }}
    onMouseLeave={()=>setIsHoverIcons(false)}>
        <Rect
        x={-10}
        y={-15}
        width={100}
        height={35}
        fill={"transparent"}
        perfectDrawEnabled={false}/>
        {type === "sticky_note" ? <Group
        x={70}
        y={0}
        visible={isHoverIcons?1:needsExplanation?1:0}
        // opacity={isHoverIcons?1:needsExplanation?1:0}
        >
            {needsExplanation ?
            <Label
            x={120}
            y={0}>
                <Tag
                fill={"white"}
                stroke={color}
                strokeWidth={1.5}
                cornerRadius={5}
                pointerDirection={"down"}
                perfectDrawEnabled={false}/>
                <Text
                text={explanation}
                fontSize={13.5}
                // fontStyle={"bold"}
                padding={5}
                perfectDrawEnabled={false}/>
            </Label>
            // <Group>
            //     <Rect
            //     x={-5}
            //     y={-25}
            //     width={150}
            //     height={40}
            //     cornerRadius={3}
            //     fill={"transparent"}
            //     stroke={color}
            //     strokeWidth={1.5}
            //     />
            //     <TextInput
            //     x={0}
            //     y={-20}
            //     width={140}
            //     height={20}
            //     fontSize={15}
            //     padding={5}
            //     value={explanation}
            //     onKeyDown={handleEscapeKeys}
            //     onChange={(e)=>{setExplanation(e.target.value)}}/>
            // </Group>
            : <SuggestionPanel
            x={0}
            y={0}
            fontSize={14}
            fontColor={"#444444"}
            pointerDirection={"left"}
            suggestions={suggestions.slice(0,3)}
            handleRegenerate={handleRegenerate}/>}
            {/* <Label
            x={0}
            y={0}
            visible={isHoverIcons}
            onMouseEnter={(e)=>{e.target.getStage().container().style.cursor = "pointer"}}
            onMouseLeave={(e)=>{e.target.getStage().container().style.cursor = "default"}}
            >
                <Tag
                fill={"silver"}
                cornerRadius={5}
                pointerDirection={"left"}
                />
                <Text
                ref={suggestionRef}
                text={suggestions[0]}
                fontSize={16}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label> */}
        </Group> : <Group
        x={-12}
        y={-27}
        visible={isHoverIcons?1:needsExplanation?1:0}
        // opacity={isHoverIcons?1:needsExplanation?1:0}
        >
            {needsExplanation ?
            <Label
            x={20}
            y={10}>
                <Tag
                fill={"white"}
                stroke={color}
                strokeWidth={1.5}
                cornerRadius={5}
                pointerDirection={"down"}
                perfectDrawEnabled={false}/>
                <Text
                text={explanation}
                fontSize={13.5}
                // fontStyle={"bold"}
                padding={5}
                perfectDrawEnabled={false}/>
            </Label> :
            <SuggestionPanel
            x={0}
            y={0}
            fontSize={14}
            fontColor={"#444444"}
            pointerDirection={"left"}
            suggestions={suggestions.slice(0,3)}
            handleRegenerate={handleRegenerate}/>}
            {/* <Label
            x={0}
            y={0}
            visible={isHoverIcons}
            onMouseEnter={(e)=>{e.target.getStage().container().style.cursor = "pointer"}}
            onMouseLeave={(e)=>{e.target.getStage().container().style.cursor = "default"}}
            >
                <Tag
                fill={"silver"}
                cornerRadius={5}
                pointerDirection={"left"}
                />
                <Text
                ref={suggestionRef}
                text={suggestions[0]}
                fontSize={16}
                fontStyle={"bold"}
                fontFamily={"sans-serif"}
                fill={"white"}
                padding={5}/>
            </Label> */}
        </Group>}
        <Icon
        x={0}
        y={0}
        type={"cross"}
        onClick={onDelete}
        />
        <Icon
        x={20}
        y={0}
        type={"confirm"}
        onClick={onConfirm}
        />
        <Icon
        x={40}
        y={0}
        type={"question"}
        enabled={needsExplanation}
        onClick={()=>{
            if (!needsExplanation) {
                explain(prompt, text, (result)=>{
                // console.log(result.replace(/(.{30})/g,"$1\n"))
                // setExplanation(result.replace(/(.{30})/g,"$1\n"));
                setExplanation(handleLongText(result));
                });
            } else {
                setExplanation("......")
            }
            setNeedsExplanation(!needsExplanation);
        }}
        />
    </Group>}
    <Group
    x={0}
    y={0}
    ref={nodeRef}
    opacity={isHover?1:0.64}>
        {type === "keyword" ?
        <Label>
            <Tag
            // fill={color}
            fill={"white"}
            stroke={color}
            strokeWidth={2.5}
            cornerRadius={5}
            perfectDrawEnabled={false}/>
            <Text
            text={text}
            fontSize={fontSize}
            fontStyle={"bold"}
            padding={10}
            perfectDrawEnabled={false}/>
        </Label>
        : type === "sticky_note" ?
        <Group
        x={0}
        y={0}>
            <Rect
            x={0}
            y={0}
            width={width+35}
            height={Math.max(sizeMap[type].height+70,textHeight+70)}
            // fill={color}
            fill={"white"}
            stroke={color}
            strokeWidth={2.5}
            shadowOffsetX={0}
            shadowOffsetY={5}
            shadowBlur={12}
            shadowOpacity={0.2}
            perfectDrawEnabled={false}/>
            <Text
            x={20}
            y={30}
            width={width}
            text={text}
            fontSize={fontSize}
            perfectDrawEnabled={false}/>
        </Group>
        // <Label>
        //     <Tag
        //     fill={color}
        //     shadowOffsetX={0}
        //     shadowOffsetY={5}
        //     shadowBlur={12}
        //     shadowOpacity={0.2}/>
        //     <Text
        //     text={text}
        //     fontSize={fontSize}
        //     padding={20}
        //     width={width}/>
        // </Label>
        : <Group>
        <Ellipse
        x={0}
        y={0}
        radiusX={radiusX}
        radiusY={Math.max(sizeMap[type].radiusY,textHeight)}
        // fill={color}
        fill={"white"}
        stroke={color}
        strokeWidth={2.5}
        // stroke={"#010203"}
        // strokeWidth={0.2}
        opacity={0.85}
        perfectDrawEnabled={false}
        />
        <Text
        x={-radiusX}
        y={-textHeight}
        width={radiusX*2}
        height={textHeight*2}
        text={text}
        align={"center"}
        fontSize={fontSize}
        verticalAlign={"middle"}
        perfectDrawEnabled={false}
        />
        </Group>}
    </Group>
    </Group>
    )
}