import React, { useEffect, useRef, useState } from "react";
import { Html } from "react-konva-utils";

function getStyle(width, height, fontSize, fontStyle, fontAlign) {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const baseStyle = {
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    padding: "0px",
    margin: "0px",
    marginTop: "-1px",
    background: "none",
    outline: "none",
    resize: "none",
    colour: "black",
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
}) {
  const style = getStyle(width, height, fontSize, fontStyle, fontAlign);
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
            onOverflow(textareaRef.current.scrollHeight);
          }
        }}
        onKeyDown={onKeyDown}
        autoFocus={true}
        style={style}
      />
    </Html>
  );
}

