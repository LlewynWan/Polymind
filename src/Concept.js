import React, { useState, useEffect, useRef, useContext } from "react";
import { Group, Rect, Circle, Label, Text, Tag, Transformer, Ellipse } from "react-konva";

import Konva from "konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function Concept({
    x,
    y,
    radiusX,
    radiusY,
    color,
    text,
    scaleX,
    scaleY,
    onScale,
    fontSize,
    padding,
    isNull,
    onClick,
    isSelected,
    isConnecting,
    onConnectingHover,
    onConnectingUnhover,
    onConnected,
    onTextChange,
    onOverflow,
    onDragStart,
    onDragMove,
    onDragEnd,
    draggable=true
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [initialPointer, setInitialPointer] = useState({x:0,y:0});
    const [isTransforming, setIsTransforming] = useState(false);
    const [anchorIndex, setAnchorIndex] = useState(-1);

    const nodeRef = useRef(null);
    const transformerRef= useRef(null);
    const textRef = useRef(null);
    const addTextRef = useRef(null);

    const {canvasX, canvasY, canvasScale} = useContext(CanvasContext);

    const tmp = new Konva.Text({text: "test", fontSize: fontSize});
    const fontWidth = tmp.width()
    const fontHeight = tmp.height();

    const [textInputY, setTextInputY] = useState(-tmp.height()/2-0.5);
    const [textInputHeight, setTextInputHeight] = useState(tmp.height()*1.2);

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
            newBox.height = Math.max(20, newBox.height);
            return newBox;
            }}
        />
        ) : null;

    useEffect(() => {
        if (!isSelected && isEditing) {
            setIsEditing(false);
        }

        if (transformerRef.current !== null) {
            transformerRef.current.nodes([nodeRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected, radiusX, radiusY, scaleX, scaleY, canvasScale,
    isEditing, transformerRef]);

    function handleEscapeKeys(e) {
        if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
            setIsEditing(false);
        }
    }

    function handleTextChange(e) {
        onTextChange(e.currentTarget.value);
    }

    return (
    <>
    <Group
     x={x} y={y}
     draggable={draggable}
     onDragStart={(e)=>{
       setIsDragging(true);
       if (onDragStart)
         onDragStart(e);
     }}
     onDragMove={onDragMove}
     onDragEnd={(e)=>{
       setIsDragging(false);
       if (onDragEnd)
         onDragEnd(e);
     }}>
    <Group
    x={0}
    y={0}
    ref={nodeRef}
    onClick={onClick}
    scaleX={scaleX}
    scaleY={scaleY}
    onTransformStart={()=>setIsTransforming(true)}
    onTransform={(e)=>{
    const newScale = e.target.scaleX();
    onScale(newScale,
    e.target.x()+x,
    e.target.y()+y);
    e.target.setAttrs({x:0,y:0});
    // setIsTransforming(false);
    }}
    onTransformEnd={(e)=>{
    const newScale = e.target.scaleX();
    onScale(newScale,
    e.target.x()+x,
    e.target.y()+y);
    e.target.setAttrs({x:0,y:0});
    setIsTransforming(false);
    }}>
        <Ellipse
        x={0}
        y={0}
        radiusX={radiusX}
        radiusY={radiusY}
        fill={color}
        stroke={"#010203"}
        strokeWidth={0.12}
        opacity={0.85}
        />
        <Text
        x={-radiusX}
        y={-radiusY}
        width={radiusX*2}
        height={radiusY*2}
        align={"center"}
        verticalAlign={"middle"}
        ref={addTextRef}
        text={"Add concept"}
        fill="black"
        fontFamily="sans-serif"
        fontSize={fontSize}
        opacity={0.5}
        visible={isNull}
        onClick={(e)=>{
          if (isNull && isSelected) {
            e.cancelBubble = true;
            setIsEditing(true);
          }
        }}
        perfectDrawEnabled={false}
      />
        {isEditing ?
        <TextInput
            x={-radiusX}
            y={textInputY}
            width={radiusX*2}
            height={textInputHeight}
            // width={textInputWidth}
            // height={radiusY}
            // width={radiusX*2}
            // height={radiusY*2}
            fontSize={fontSize}
            fontAlign={"center"}
            onChange={handleTextChange}
            onKeyDown={handleEscapeKeys}
            value={text}
            onOverflow={(scrollHeight)=>{
                setTextInputY(textInputY-(scrollHeight-textInputHeight)/2-1);
                setTextInputHeight(scrollHeight)
                // if ((scrollHeight-textInputHeight) % 2 === 0) {
                //     setTextInputY(textInputY-(scrollHeight-textInputHeight)/2);
                //     setTextInputHeight(scrollHeight)
                // } else {
                //     setTextInputY(textInputY-(scrollHeight-textInputHeight)/2-1);
                //     setTextInputHeight(scrollHeight)
                // }
                // if (scrollHeight > radiusY) {
                //     onOverflow(radiusY+fontHeight)
                // }
            }}
        /> :
        <Text
            x={-radiusX}
            y={-radiusY}
            width={radiusX*2}
            height={radiusY*2}
            text={text}
            ref={textRef}
            fill="black"
            align="center"
            verticalAlign="middle"
            fontFamily="sans-serif"
            fontSize={fontSize}
            onClick={(e)=>{
            if (isSelected) {
                setIsEditing(true);
            }
            }}
            perfectDrawEnabled={false}
        />}
    </Group>
    </Group>
    {transformer}
    </>
    )
}