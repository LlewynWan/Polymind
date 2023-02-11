import React, { useState, useEffect, useRef } from "react";
import { Group, Rect, Image, Text, Transformer } from "react-konva";

import { TextInput } from "./TextInput"

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;


export function Keyword({
  id,
  x,
  y,
  color,
  text,
  width,
  height,
  fontSize,
  isNull,
  onClick,
  isSelected,
  onTextChange,
  onDragStart,
  onDragEnd,
  onDeleteIconClick,
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
      borderStrokeWidth={4}
      anchorStroke={"#0096FF"}
      anchorStrokeWidth={2}
      anchorSize={12}
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
      <Rect
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
      />
      <Text
        x={15}
        y={15}
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
        x={15}
        y={15}
        id={id}
        width={width}
        height={height}
        fontSize={fontSize}
        onChange={handleTextChange}
        onKeyDown={handleEscapeKeys}
        value={text}
      /> :
      <Text
        x={15}
        y={15}
        width={width}
        height={height}
        text={text}
        fill="black"
        fontFamily="sans-serif"
        fontSize={fontSize}
        onClick={()=>{
          if (isSelected) {
            setIsEditing(true);
          }
        }}
        perfectDrawEnabled={false}
      />}
    </Group>
    {transformer}
    </>
  );
}

