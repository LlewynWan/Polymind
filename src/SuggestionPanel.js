import React, { useEffect, useState } from "react";
import { Group, Rect, Label, Tag, Text } from "react-konva";

import Konva from "konva";


export function SuggestionPanel ({
    x,
    y,
    fontSize,
    pointerDirection,
    suggestions,
    fontColor,
    fill="transparent"
}) {
    // const getTextWidth = (text) => {
    //     const tmp = new Konva.Text({text: text, fontSize: fontSize,
    //         Ellipsis: true, fontStyle: "bold", padding: 5});
    //     console.log(tmp.width())
    //     return tmp.width();
    // }

    return (
    <Group
    x={x}
    y={y}>
        {pointerDirection!=="down" ? <Rect
        x={-10}
        y={-(fontSize+15)*(suggestions.slice(0,3).length-1)-20}
        width={100}
        height={(fontSize+15)*suggestions.slice(0,3).length+15}
        fill={"transparent"}/> : <Rect
        x={-60}
        y={-(fontSize+15)*suggestions.slice(0,3).length}
        width={120}
        height={(fontSize+15)*suggestions.slice(0,3).length+10}
        fill={"transparent"}/>}
        {suggestions.slice(0,3).map((suggestion,index)=>{
        return (
        <Label
        key={index}
        x={0}
        y={-(fontSize+15)*index}
        onMouseEnter={(e)=>{e.target.getStage().container().style.cursor = "pointer"}}
        onMouseLeave={(e)=>{e.target.getStage().container().style.cursor = "default"}}>
            <Tag
            fill={fill}
            cornerRadius={5}
            stroke={"#212121"}
            strokeWidth={1.5}
            pointerDirection={pointerDirection}
            />
            <Text
            text={suggestion}
            // width={Math.min(100,getTextWidth(suggestion))}
            height={fontSize+10}
            fontSize={fontSize}
            fontStyle={"bold"}
            fontFamily={"sans-serif"}
            fill={fontColor}
            // Ellipsis={true}
            padding={5}
            // onMouseEnter={(e)=>{e.target.setAttrs({Ellipsis: false, width: null})}}
            // onMouseLeave={(e)=>{e.target.setAttrs({Ellipsis: true, width: Math.min(100,getTextWidth(suggestion))})}}
            />
        </Label>
        )
        })}
    </Group>)
}