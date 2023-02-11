import React, { useEffect } from "react";
import { Html } from "react-konva-utils";

function getStyle(width, height, fontSize) {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const baseStyle = {
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    padding: "0px",
    margin: "0px",
    background: "none",
    outline: "none",
    resize: "none",
    colour: "black",
    fontSize: `${fontSize}px`,
    fontFamily: "sans-serif",
    lineHeight: "1",
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
  value,
  onChange,
  onKeyDown,
}) {
  const style = getStyle(width, height, fontSize);

  useEffect(() => {
    const textarea = document.getElementById(id);
    textarea.focus();
  }, []);

  return (
    <Html groupProps={{ x, y }} divProps={{ style: { opacity: 1 } }}>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={style}
      />
    </Html>
  );
}

