import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Tag, Text, Transformer } from "react-konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { TaskHeader } from "./TaskHeader";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function Section({
    x,
    y,
    scaleX,
    scaleY,
    width,
    height,
    color,
    text,
    fontSize,
    header,
    onClick,
    onScale,
    onTextChange,
    isSelected,
    handleDragMove,
    handleDragEnd,
    callbackTaskId,
    resetNodeCallbackTaskId
}) {
    const [isHover, setIsHover] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { canvasScale, microTasks } = useContext(CanvasContext);

    const [textInputHeight, setTextInputHeight] = useState(20);
    
    const sectionRect = useRef(null);
    const transformerRef= useRef(null);

    function handleEscapeKeys(e) {
        if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
          setIsEditing(false);
        }
      }
    
    function handleTextChange(e) {
        onTextChange(e.currentTarget.value);
    }

    useEffect(() => {
        if (!isSelected && isEditing) {
          setIsEditing(false);
        }
    
        if (transformerRef.current !== null) {
          transformerRef.current.nodes([sectionRect.current]);
          transformerRef.current.getLayer().batchDraw();
        }
      }, [isSelected, width, height, scaleX, scaleY, canvasScale,
        isEditing, transformerRef]);
    
    const transformer = isSelected && !isEditing ? (
        <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            flipEnabled={false}
            borderStroke={"#0096FF"}
            borderStrokeWidth={3.5}
            anchorStroke={"#0096FF"}
            anchorStrokeWidth={1.5}
            anchorSize={12}
            anchorCornerRadius={2}
            enabledAnchors={["top-left", "top-right",
            "bottom-left", "bottom-right"]}
            boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            newBox.height = Math.max(30, newBox.height);
            return newBox;
            }}
        />
        ) : null;
    
    return (
    <>
    <Group
    x={x}
    y={y}
    onDragMove={handleDragMove}
    onDragEnd={handleDragEnd}
    draggable={true}
    onClick={onClick}>
    {/* {header ? <TaskHeader
    x={0}
    y={-80/canvasScale}
    tasks={microTasks.filter(task=>task.inputType==="Section")}
    fontSize={14}
    width={180}
    scale={1/canvasScale}
    callbackTaskId={callbackTaskId}
    resetNodeCallbackTaskId={resetNodeCallbackTaskId}/> : null} */}
        <Label
        x={0}
        y={-40/canvasScale}
        scaleX={1/canvasScale}
        scaleY={1/canvasScale}
        onMouseEnter={()=>setIsHover(true)}
        onMouseLeave={()=>setIsHover(false)}
        onClick={()=>{
            if (isSelected) {
                setIsEditing(true);
            }
        }}>
            <Tag
            fill={color}
            cornerRadius={5}
            opacity={isHover?0.6:0.4}
            visible={!isEditing}/>
            {isEditing ?
            <TextInput
            x={5}
            y={5-0.5}
            width={window.innerWidth}
            height={textInputHeight}
            fontSize={fontSize}
            fontStyle={"bold"}
            onChange={handleTextChange}
            onKeyDown={handleEscapeKeys}
            value={text}
            onOverflow={(scrollHeight)=>setTextInputHeight(scrollHeight)}
            /> : <Text
            text={text}
            fontSize={fontSize}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={"black"}
            padding={5}/>}
        </Label>
        <Rect
        x={0}
        y={0}
        ref={sectionRect}
        width={width}
        height={height}
        scaleX={scaleX}
        scaleY={scaleY}
        cornerRadius={10}
        opacity={0.75}
        fill={"transparent"}
        stroke={color}
        strokeWidth={isHover?1.5:0.75}
        listening={false}
        onTransform={(e)=>{
            onScale(e.target.scaleX(),
            e.target.scaleY(),
            e.target.x()+x,
            e.target.y()+y);
            e.target.setAttrs({x:0,y:0});
          }}
          onTransformEnd={(e)=>{
            onScale(e.target.scaleX(),
            e.target.scaleY(),
            e.target.x()+x,
            e.target.y()+y);
            e.target.setAttrs({x:0,y:0});
          }}
        />
        <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        scaleX={scaleX}
        scaleY={scaleY}
        cornerRadius={10}
        opacity={0.05}
        fill={color}
        stroke={color}
        strokeWidth={1}
        listening={false}
        />
    </Group>
    {transformer}
    </>
    )
}