import React, { useContext, useRef, useState } from "react";
import { Group, Rect, Line, Text, Ellipse } from "react-konva";

import { GlobalContext } from "./state";


export function ToolBar({
    x,
    y,
    width,
    height,
    color,
    visible,
    isArrowIconClicked,
    onArrowIconClick,
    isDoubleArrowIconClicked,
    onDoubleArrowIconClick,
    onAddStickyNote
}) {
    const [isHoverArrowIcon, setIsHoverArrowIcon] = useState(false);
    const [isHoverDoubleArrowIcon, setIsHoverDoubleArrowIcon] = useState(false);
    const [isHoverStickyNotes, setIsHoverStickyNotes] = useState(false);

    const stickyNoteRef = useRef(null);
    const dummyStickyNoteRef1 = useRef(null);
    const dummyStickyNoteRef2 = useRef(null);

    
    const handleStickyNodeDragEnd = e => {
        onAddStickyNote(e.target.x()+x+180, e.target.y()+y, 145, 110);

        stickyNoteRef.current.setAttrs({
            x: 12, y: 12, width: 60, height: 60,
            shadowOffsetY: 0,
            shadowOpacity: 0.5
        });
        dummyStickyNoteRef2.current.setAttrs({
            x: 5, y: 5
        });
        dummyStickyNoteRef1.current.setAttrs({
            x: 5, y: 100
        })

        stickyNoteRef.current.to({
            x: 19, y: 19,
            duration: 0.12,
            onFinish: ()=>setIsHoverStickyNotes(false)
        });
        dummyStickyNoteRef1.current.to({
            x: 5, y: 5,
            duration: 0.4,
        });
        dummyStickyNoteRef2.current.to({
            x: 12, y: 12,
            duration: 0.5
        })
    }


    return (
        <Group x={x} y={y} visible={visible}>
        <Rect
        x={0}
        y={0}
        fill={color}
        width={width}
        height={height}
        cornerRadius={5}
        opacity={0.9}
        perfectDrawEnabled={false}
        shadowColor={"black"}
        shadowOffsetY={0}
        shadowOffsetX={0}
        strokeWidth={0.25}
        stroke={"gray"}
        shadowBlur={5}
        shadowOpacity={0.25}
        />

        <Group x={25} y={height/2-25}
        onMouseEnter={()=>{setIsHoverArrowIcon(true)}}
        onMouseLeave={()=>{setIsHoverArrowIcon(false)}}
        onClick={onArrowIconClick}
        >
            <Rect
            x={0}
            y={0}
            cornerRadius={10}
            width={50}
            height={50}
            stroke={"#010203"}
            strokeWidth={2}
            fill={isArrowIconClicked?"#010203":
            isHoverArrowIcon?"#D5D5D5":"#D9CBA6"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={isArrowIconClicked?5:0}
            shadowOpacity={isArrowIconClicked?0.25:0}
            opacity={isArrowIconClicked?0.75:
                isHoverArrowIcon?0.27:0.2}
            />
            <Line
            points={[5,25,45,25]}
            stroke={isArrowIconClicked?"white":"black"}
            tension={0}
            pointerLength={10}
            pointerWidth={12}
            />
            <Line
            points={[38,18,45,25,38,32]}
            stroke={isArrowIconClicked?"white":"black"}
            tension={0}
            pointerLength={10}
            pointerWidth={12}
            />
        </Group>

        <Group x={100} y={height/2-25}
        onMouseEnter={()=>{setIsHoverDoubleArrowIcon(true)}}
        onMouseLeave={()=>{setIsHoverDoubleArrowIcon(false)}}
        onClick={onDoubleArrowIconClick}
        >
            <Rect
            x={0}
            y={0}
            cornerRadius={10}
            width={50}
            height={50}
            fill={isDoubleArrowIconClicked?"#010203":
            isHoverDoubleArrowIcon?"#D5D5D5":"#D9CBA6"}
            stroke={"#010203"}
            strokeWidth={2}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={isDoubleArrowIconClicked?5:0}
            shadowOpacity={isDoubleArrowIconClicked?0.25:0}
            opacity={isDoubleArrowIconClicked?0.75:
                isHoverDoubleArrowIcon?0.27:0.2}
            />
            <Line
            points={[5,25,45,25]}
            stroke={isDoubleArrowIconClicked?"white":"black"}
            tension={0}
            pointerLength={10}
            pointerWidth={12}
            />
            <Line
            points={[38,18,45,25,38,32]}
            stroke={isDoubleArrowIconClicked?"white":"black"}
            tension={0}
            pointerLength={10}
            pointerWidth={12}
            />
            <Line
            points={[12,18,5,25,12,32]}
            stroke={isDoubleArrowIconClicked?"white":"black"}
            tension={0}
            pointerLength={10}
            pointerWidth={12}
            />
        </Group>

        <Group x={180} y={0}
        onMouseEnter={()=>{
            if (!isHoverStickyNotes) {
                setIsHoverStickyNotes(true)
                stickyNoteRef.current.to({
                    x: -18,
                    y: -75,
                    width: 125,
                    height: 125,
                    duration: 0.2,
                });
            }
        }}
        onMouseLeave={()=>{
            if (isHoverStickyNotes) {
                setIsHoverStickyNotes(false);
                stickyNoteRef.current.to({
                    x: 19,
                    y: 19,
                    width: 60,
                    height: 60,
                    duration: 0.2
                });
            }
        }}
        clipX={-window.innerWidth}
        clipY={-window.innerHeight}
        clipWidth={window.innerWidth*2}
        clipHeight={height+window.innerHeight}>
            <Rect
            x={5}
            y={5}
            width={60}
            height={60}
            ref={dummyStickyNoteRef1}
            shadowColor={"black"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.5}
            fill={"#748B97"}
            />
            <Rect
            x={12}
            y={12}
            width={60}
            height={60}
            ref={dummyStickyNoteRef2}
            shadowColor={"black"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.5}
            fill={"#748B97"}
            />
            <Rect
            x={19}
            y={19}
            width={60}
            height={60}
            ref={stickyNoteRef}
            shadowColor={"black"}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={5}
            shadowOpacity={0.5}
            fill={"#748B97"}
            draggable={true}
            onDragStart={(e)=>{
                stickyNoteRef.current.setAttrs({
                    width: 180,
                    height: 180,
                    shadowOffsetY: 7,
                    shadowOpacity: 0.2
                });
            }}
            onDragEnd={handleStickyNodeDragEnd}/>
        </Group>

        <Group x={330} y={0}
        clipX={-window.innerWidth}
        clipY={-window.innerHeight}
        clipWidth={window.innerWidth*2}
        clipHeight={height+window.innerHeight}
        onMouseEnter={(e)=>{
            e.target.to({
                y: height / 2,
                radiusX: 64,
                radiusY: 35,
                duration: 0.25
            })
        }}
        onMouseLeave={(e)=>{
            e.target.to({
                y: height / 2 + 15,
                radiusX: 40,
                radiusY: 40,
                duration: 0.4
            })
        }}>
            <Ellipse
            x={0}
            y={height/2+25}
            radiusX={40}
            radiusY={40}
            stroke={"gray"}
            strokeWidth={0.5}
            fill={"#FADADD"}
            opacity={0.85}
            />
        </Group>
        </Group>
    )
}