import React, { useState, useEffect, useRef, useContext } from "react";
import { Group, Rect, Circle, Label, Text, Tag, Transformer } from "react-konva";

import Konva from "konva";

import { CanvasContext } from "./state";
import { TextInput } from "./TextInput"
import { TaskHeader } from "./TaskHeader";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;


export function Keyword({
  x,
  y,
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
  onTextSizeChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  headerListening,
  onHeaderTaskClick,
  onHeaderCurtainClick,
  resetHeaderCurtain,
  disabledSet,
  displaySet,
  notificationSet,
  setNotificationSet,
  resetNodeCallbackTaskId,
  listening,
  header=true,
  draggable=true,
  callbackTaskId=-1
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isHoverBoundingBox, setIsHoverBoundingBox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState([]);
  const [anchorIndex, setAnchorIndex] = useState(-1);

  const [textInputHeight, setTextInputHeight] = useState(20);

  const nodeRef = useRef(null);
  const transformerRef= useRef(null);

  const {canvasX, canvasY, canvasScale, microTasks} = useContext(CanvasContext);

  const calcAnchorPosition = () => {
    const clientRect = nodeRef.current.getClientRect();
    return [
      {x: clientRect.width/canvasScale / 2, y: -15/canvasScale},
      {x: -15/canvasScale, y: clientRect.height/canvasScale / 2},
      {x: clientRect.width/canvasScale / 2, y: clientRect.height/canvasScale + 15/canvasScale},
      {x: clientRect.width/canvasScale + 15/canvasScale, y: clientRect.height/canvasScale / 2}
    ]
  }

  const pointer2CanvasPosition = (pointerPosition) => {
    const posX = (pointerPosition.x - canvasX) / canvasScale;
    const posY = (pointerPosition.y -  canvasY) / canvasScale;
    return {x: posX, y: posY};
  }

  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }

    if (nodeRef.current) {
      setAnchorPosition(calcAnchorPosition());
      if (onTextSizeChange) {
        onTextSizeChange(nodeRef.current.getClientRect());
      }
    }

    if (transformerRef.current !== null) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing, scaleX, scaleY, canvasScale]);

  const transformer = isSelected && !isEditing ? (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      flipEnabled={false}
      borderStroke={"#0096FF"}
      borderStrokeWidth={3.5}
      anchorStroke={"#0096FF"}
      anchorStrokeWidth={1.5}
      anchorSize={8}
      anchorCornerRadius={2}
      enabledAnchors={["top-left", "top-right",
      "bottom-left",
      "bottom-right"]}
      boundBoxFunc={(oldBox, newBox) => {
        newBox.width = Math.max(12, newBox.width);
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
    }}
    listening={listening}>
    
    {header ? <TaskHeader
    x={0}
    y={-40/canvasScale}
    tasks={microTasks.filter(task=>task.inputType==="Keyword"||task.inputType==="Nodes")}
    fontSize={14}
    width={150}
    scale={1/canvasScale}
    listening={headerListening}
    onTaskClick={onHeaderTaskClick}
    onCurtainClick={onHeaderCurtainClick}
    resetCurtain={resetHeaderCurtain}
    disabledSet={disabledSet}
    displaySet={displaySet}
    notificationSet={notificationSet}
    setNotificationSet={setNotificationSet}
    callbackTaskId={callbackTaskId}
    resetCallbackTaskId={resetNodeCallbackTaskId}/> : null}

    <Group x={0} y={0}
    // draggable={draggable}
    // onDragStart={onDragStart}
    // onDragEnd={onDragEnd}
    scaleX={scaleX}
    scaleY={scaleY}
    onMouseEnter={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
    ref={nodeRef}
    onClick={onClick}
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
      {/* <Rect
        x={0}
        y={0}
        fill={color}
        cornerRadius={7}
        width={width+12}
        height={height}
        stroke={"gray"}
        strokeWidth={0.75}
        opacity={isHover?0.3:0.15}
        perfectDrawEnabled={false}
      /> */}
      {/* <Text
        x={20}
        y={30}
        text={"Keyword"}
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
      /> */}
      <Label
      x={0}
      y={0}
      >
        <Tag
        fill={color}
        cornerRadius={5}
        stroke={"gray"}
        strokeWidth={0.75}
        opacity={isHover?0.3:0.15}
        visible={!isEditing}
        perfectDrawEnabled={false}
        />
        {isEditing ?
        <TextInput
          x={padding}
          y={padding-0.5}
          width={window.innerWidth}
          height={textInputHeight}
          fontSize={fontSize}
          fontStyle={"bold"}
          onChange={handleTextChange}
          onKeyDown={handleEscapeKeys}
          value={text}
          onOverflow={(scrollHeight)=>setTextInputHeight(scrollHeight)}
        /> :
        <Text
        text={isNull?"Add keyword":text}
        fontSize={fontSize}
        fontStyle={"bold"}
        fontFamily={"sans-serif"}
        fill={"black"}
        opacity={isNull?0.5:1}
        padding={padding}
        onClick={()=>{
          if (isSelected) {
            setIsEditing(true);
          }
        }}
        perfectDrawEnabled={false}/>}
      </Label>
    </Group>
    <Group x={0} y={0}
    visible={(isConnecting && isHoverBoundingBox) || (isSelected && !isEditing && !isTransforming)}>
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
        radius={4}
        stroke={"#0096FF"}
        strokeWidth={1}
        fill={(isHoverBoundingBox && anchorIndex===index) ? "#0096FF" : "white"}
        opacity={isDragging?0.12:0.75}
        perfectDrawEnabled={false}
        />
        <Circle
        key={index}
        radius={20}
        stroke={"#0096FF"}
        strokeWidth={0}
        fill={"transparent"}
        opacity={isDragging?0.12:0.75}
        perfectDrawEnabled={false}
        />
        </Group>)
      })}
    </Group>
    {anchorPosition.length>0 ?
    <Rect
    x={-20/canvasScale}
    y={-20/canvasScale}
    width={anchorPosition[3].x-anchorPosition[1].x+10/canvasScale}
    height={anchorPosition[2].y-anchorPosition[0].y+10/canvasScale}
    onMouseEnter={(e) => {
      setIsHoverBoundingBox(true);
      const pointerPosition = e.target.getStage().getPointerPosition();
      const canvasPosition = pointer2CanvasPosition(pointerPosition);
      const distance = anchorPosition.map((position)=>{
        return Math.sqrt((canvasPosition.x-(x+position.x))**2
        + (canvasPosition.y-(y+position.y))**2)
      });
      const minIndex = distance.indexOf(Math.min(...distance));
      setAnchorIndex(minIndex);
      if (onConnectingHover) {
        onConnectingHover(e,minIndex);
      }
    }}
    onMouseLeave={(e) => {
      setIsHoverBoundingBox(false);
      setAnchorIndex(-1);
      if (onConnectingUnhover) {
        onConnectingUnhover(e);
      }
    }}
    fill="transparent"
    onMouseDown={(e)=>{onConnected(e,anchorIndex)}}
    onMouseUp={(e)=>{onConnected(e,anchorIndex)}}
    visible={isConnecting}
    onMouseMove={(e)=>{
      if (isHoverBoundingBox) {
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
    perfectDrawEnabled={false}
    />: null}
    </Group>
    {transformer}
    </>
  );
}

