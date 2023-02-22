import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Circle, Text, Transformer } from "react-konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;


export function StickyNote({
  id,
  x,
  y,
  color,
  text,
  width,
  height,
  scaleX,
  scaleY,
  isConnecting,
  onScale,
  onResize,
  fontSize,
  isNull,
  onClick,
  onConnectingHover,
  onConnectingUnhover,
  onConnected,
  isSelected,
  onTextChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onOverflow,
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

  const {canvasX, canvasY, canvasScale} = useContext(CanvasContext);

  const anchorPosition = [
    {x: (width + 35)*scaleX / 2, y: -20/canvasScale},
    {x: -20/canvasScale, y: (height + 70)*scaleY / 2},
    {x: (width + 35)*scaleX / 2, y: (height + 70)*scaleY + 20/canvasScale},
    {x: (width + 35)*scaleX + 20/canvasScale, y: (height + 70)*scaleY / 2}
  ]

  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }

    if (transformerRef.current !== null) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, width, height, scaleX, scaleY, canvasScale,
    isEditing, transformerRef]);

  const pointer2CanvasPosition = (pointerPosition) => {
    const posX = (pointerPosition.x - canvasX) / canvasScale;
    const posY = (pointerPosition.y -  canvasY) / canvasScale;
    return {x: posX, y: posY};
  }


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
        return newBox;
      }}
    />
  ) : null;

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
      setIsTransforming(false);
    }}
    onTransformEnd={(e)=>{
      const newScale = e.target.scaleX();
      onScale(newScale,
      e.target.x()+x,
      e.target.y()+y);
      e.target.setAttrs({x:0,y:0});
      setIsTransforming(false);
    }}>
      <Rect
        x={0}
        y={0}
        fill={color}
        width={width + 35}
        height={height + 70}
        shadowColor={"black"}
        shadowOffsetY={7}
        shadowOffsetX={0}
        shadowBlur={12}
        shadowOpacity={0.2}
        perfectDrawEnabled={false}
      />
      <Text
        x={20}
        y={30}
        text={"Add text"}
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
        x={20}
        y={30}
        id={id}
        width={width}
        height={height}
        fontSize={fontSize}
        onChange={handleTextChange}
        onKeyDown={handleEscapeKeys}
        value={text}
        onOverflow={onOverflow}
      /> :
      <Text
        x={20}
        y={30}
        width={width}
        height={height}
        text={text}
        fill="black"
        fontFamily="sans-serif"
        fontSize={fontSize}
        onClick={(e)=>{
          console.log(e.target.getClientRect())
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
              var offsetW = (newPosition.x !== initialPointer.x) ? 40 : 0;
              var offsetH = (newPosition.y !== initialPointer.y) ? 32 : 0;
              var offsetX = (index===1 && newPosition.x !== initialPointer.x) ? -40 : 0;
              var offsetY = (index===0 && newPosition.y !== initialPointer.y) ? -32 : 0;
              if (index % 2 === 1) {
                offsetH = 0;
              } else {
                offsetW = 0;
              }
              if (newPosition.x < initialPointer.x && index === 3) {
                offsetW *= -1;
              }
              if (newPosition.x > initialPointer.x && index === 1) {
                offsetW *= -1;
                offsetX *= -1;
              }
              if (newPosition.y > initialPointer.y && index === 0) {
                offsetH *= -1;
                offsetY *= -1;
              }
              if (newPosition.y < initialPointer.y && index === 2) {
                offsetH *= -1;
              }
              onResize(offsetW, offsetH, offsetX*scaleX, offsetY*scaleY);
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
    x={-30/canvasScale}
    y={-30/canvasScale}
    width={(width+35)*scaleX+60/canvasScale}
    height={(height+70)*scaleY+60/canvasScale}
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
  );
}

