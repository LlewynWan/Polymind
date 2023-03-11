import React, { useState, useEffect, useRef, useContext } from "react";
import { Group, Rect, Circle, Label, Text, Tag, Transformer, Ellipse } from "react-konva";

import Konva from "konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { TaskHeader } from "./TaskHeader";

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
    onResize,
    fontSize,
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
    resetNodeCallbackTaskId,
    draggable=true,
    callbackTaskId=-1
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

    const {canvasX, canvasY, canvasScale, microTasks} = useContext(CanvasContext);

    const tmp = new Konva.Text({text: "test", fontSize: fontSize});
    const fontWidth = tmp.width()
    const fontHeight = tmp.height();

    const [textInputY, setTextInputY] = useState(-tmp.height()/2-0.5);
    const [textInputHeight, setTextInputHeight] = useState(tmp.height()*1.2);

    const pointer2CanvasPosition = (pointerPosition) => {
        const posX = (pointerPosition.x - canvasX) / canvasScale;
        const posY = (pointerPosition.y -  canvasY) / canvasScale;
        return {x: posX, y: posY};
    }

    const anchorPosition = [
        {x: 0, y: -radiusY*scaleY - 15/canvasScale},
        {x: -radiusX*scaleX - 15/canvasScale, y: 0},
        {x: 0, y: radiusY*scaleY + 15/canvasScale},
        {x: radiusX*scaleX + 15/canvasScale, y: 0}
    ]

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
        const tmp = new Konva.Text({
            width: radiusX*2,
            text: e.currentTarget.value,
            align: "center",
            fontSize: fontSize
        })
        setTextInputY(-tmp.height()/2-0.5);
        setTextInputHeight(tmp.height()*1.2)
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

    <TaskHeader
    x={-radiusX*scaleX}
    y={-radiusY*scaleY-40/canvasScale}
    // x={-radiusX}
    // y={-radiusY-10/canvasScale}
    tasks={microTasks}
    fontSize={14}
    width={150}
    scale={1/canvasScale}
    callbackTaskId={callbackTaskId}
    resetNodeCallbackTaskId={resetNodeCallbackTaskId}/>

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
        strokeWidth={0.2}
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
                onOverflow(scrollHeight)
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
    <Group x={0} y={0}
    visible={(isConnecting && isHover) || (isSelected && !isEditing && !isTransforming)}>
    {anchorPosition.map((anchor,index)=>{
        return (
        <Group
        key={index}
        x={anchor.x}
        y={anchor.y}
        scaleX={1/canvasScale}
        scaleY={1/canvasScale}>
        <Circle
        key={index+4}
        radius={5}
        stroke={"#0096FF"}
        strokeWidth={1}
        fill={(isHover && anchorIndex===index) ? "#0096FF" : "white"}
        opacity={isDragging?0.12:0.75}
        />
        <Circle
        key={index}
        radius={20}
        stroke={"#0096FF"}
        strokeWidth={0}
        fill={"transparent"}
        opacity={isDragging?0.12:0.75}
        onMouseEnter={(e)=>{
          if (!isConnecting) {
            const stage = e.target.getStage();
            const type = (index%2 === 0) ? "ns-resize" : "ew-resize";
            stage.container().style.cursor = type;
          }
        }}
        onMouseLeave={(e)=>{
          if (!isConnecting) {
            const stage = e.target.getStage();
            stage.container().style.cursor = "default"
            setIsResizing(false);
          }
        }}
        onMouseDown={(e)=>{
          e.cancelBubble = true;
          setIsResizing(true);
          const position = e.target.getStage().getPointerPosition();
          setInitialPointer({x: position.x, y: position.y})
        }}
        onMouseMove={(e)=>{
          if (!isConnecting) {
            e.cancelBubble = true;
            const newPosition = e.target.getStage().getPointerPosition();
            if (isResizing) {
              var offsetW = (newPosition.x !== initialPointer.x) ? 18 : 0;
              var offsetH = (newPosition.y !== initialPointer.y) ? 10 : 0;
            //   var offsetX = (index===1 && newPosition.x !== initialPointer.x) ? -40 : 0;
            //   var offsetY = (index===0 && newPosition.y !== initialPointer.y) ? -32 : 0;
              if (index % 2 === 1) {
                offsetH = 0;
              } else {
                offsetW = 0;
              }
              if ((newPosition.x < initialPointer.x && index === 3) ||
              (newPosition.x > initialPointer.x && index === 1)) {
                offsetW *= -1;
              }
              if ((newPosition.y > initialPointer.y && index === 0) ||
              (newPosition.y < initialPointer.y && index === 2)) {
                offsetH *= -1;
              }
              onResize(offsetW, offsetH);
            }
            if (newPosition.x !== initialPointer.x || newPosition.y !== initialPointer.y) {
              setIsResizing(false);
            }
          }
        }}
        onMouseUp={(e)=>{
          e.cancelBubble = true;
          setIsResizing(false);
        }}
        />
        </Group>)
      })}
    </Group>
    <Rect
    x={-radiusX*scaleX-20/canvasScale}
    y={-radiusY*scaleY-20/canvasScale}
    width={radiusX*scaleX*2+40/canvasScale}
    height={radiusY*scaleY*2+40/canvasScale}
    onMouseEnter={(e) => {
      setIsHover(true);
      const pointerPosition = e.target.getStage().getPointerPosition();
      const canvasPosition = pointer2CanvasPosition(pointerPosition);
      const distance = anchorPosition.map((position)=>{
        return Math.sqrt((canvasPosition.x-(x+position.x))**2
        + (canvasPosition.y-(y+position.y))**2)
      });
      const minIndex = distance.indexOf(Math.min(...distance));
      setAnchorIndex(minIndex);
      onConnectingHover(e,minIndex);
    }}
    onMouseLeave={(e) => {
      setIsHover(false);
      setAnchorIndex(-1);
      onConnectingUnhover(e);
    }}
    fill="transparent"
    onMouseDown={(e)=>{onConnected(e,anchorIndex)}}
    onMouseUp={(e)=>{onConnected(e,anchorIndex)}}
    visible={isConnecting}
    onMouseMove={(e)=>{
      if (isHover) {
        const pointerPosition = e.target.getStage().getPointerPosition();
        const canvasPosition = pointer2CanvasPosition(pointerPosition);
        const distance = anchorPosition.map((position)=>{
          return Math.sqrt((canvasPosition.x-(x+position.x))**2
          + (canvasPosition.y-(y+position.y))**2)
        });
        const minIndex = distance.indexOf(Math.min(...distance));
        setAnchorIndex(minIndex);
        onConnectingHover(e,minIndex);
      }
    }}
    />
    </Group>
    {transformer}
    </>
    )
}