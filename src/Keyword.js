import React, { useState, useEffect, useRef } from "react";
import { Group, Rect, Label, Text, Tag, Transformer } from "react-konva";

import { TextInput } from "./TextInput"

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;


export function Keyword({
  x,
  y,
  color,
  text,
  fontSize,
  padding,
  isNull,
  onClick,
  isSelected,
  onTextChange,
  onDragStart,
  onDragEnd,
  draggable=true
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const nodeRef = useRef(null);
  const transformerRef= useRef(null);

  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }

    if (transformerRef.current !== null) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing]);

  const transformer = isSelected && !isEditing ? (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      flipEnabled={false}
      borderStroke={"#0096FF"}
      borderStrokeWidth={3.5}
      anchorStroke={"#0096FF"}
      anchorStrokeWidth={1.5}
      anchorSize={10}
      anchorCornerRadius={2}
      enabledAnchors={["top-left", "top-right",
      "bottom-left",
      "bottom-right"]}
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

  function onHoverIcon(e) {
    e.target.to({
      scaleX: 1.1,
      scaleY: 1.1
    });
  };
  function onUnhoverIcon(e) {
    e.target.to({
      scaleX: 1,
      scaleY: 1
    });
  };

  return (
    <>
    <Group x={x} y={y} draggable={draggable}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onMouseEnter={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
    ref={nodeRef}
    onClick={onClick}>
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
        />
        {isEditing ?
        <TextInput
          x={padding}
          y={padding-1}
          fontSize={fontSize}
          fontStyle={"bold"}
          onChange={handleTextChange}
          onKeyDown={handleEscapeKeys}
          value={text}
        /> :
        <Text
        text={isNull?"Keyword":text}
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
        }}/>}
      </Label>
    </Group>
    {transformer}
    </>
  );
}

