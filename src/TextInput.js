import React, { useEffect, useRef, useState } from "react";
import { Html } from "react-konva-utils";

function getStyle(width, height,
  fontSize, fontStyle, fontAlign, fontColor, padding,
  background, borderRadius) {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const baseStyle = {
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    padding: `${padding}px`,
    margin: "0px",
    marginTop: "-1px",
    background: background,
    borderRadius: `${borderRadius}px`,
    outline: "none",
    resize: "none",
    color: fontColor,
    fontSize: `${fontSize}px`,
    fontFamily: "sans-serif",
    lineHeight: "1",
    fontWeight: fontStyle,
    textAlign: fontAlign
  };
  if (isFirefox) {
    return baseStyle;
  }
  return {
    ...baseStyle,
    // margintop: "-4px"
  };
}

export function TextInput({
  id,
  x,
  y,
  width,
  height,
  fontSize,
  fontStyle,
  fontAlign,
  value,
  onChange,
  onKeyDown,
  onOverflow,
  padding=0,
  fontColor="black",
  background="none",
  borderRadius=0,
  autoFocus=true,
}) {
  const style = getStyle(width, height,
    fontSize, fontStyle, fontAlign, fontColor, padding,
    background, borderRadius);
  const textareaRef = useRef(null);
  const [textareaHeight, setTextareaHeight] = useState(0);

  useEffect (() => {
    if (textareaRef.current !== null) {
      setTextareaHeight(textareaRef.current.scrollHeight);
    }
  }, [textareaRef, value]);

  return (
    <Html groupProps={{ x, y }} divProps={{ style: { opacity: 1 } }}>
      <textarea
        id={id}
        value={value}
        ref={textareaRef}
        onChange={(e)=>{
          onChange(e);
          if (textareaRef.current.scrollHeight > textareaHeight) {
            if (onOverflow) {
              onOverflow(textareaRef.current.scrollHeight);
            }
          }
        }}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        style={style}
      />
    </Html>
  );
}

