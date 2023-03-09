import React, { useContext, useRef, useState } from "react";
import { Group, Rect, Line, Path, Ellipse } from "react-konva";

import Konva from "konva";

import { GlobalContext } from "./state";


export function ToolBar({
    x,
    y,
    width,
    height,
    color,
    visible,
    onHover,
    onUnhover,
    isArrowIconClicked,
    onArrowIconClick,
    isDoubleArrowIconClicked,
    onDoubleArrowIconClick,
    isSectionIconClicked,
    onSectionIconClick,
    isTextIconClicked,
    onTextIconClick,
    onAddConcept,
    onAddStickyNote,
    conceptOffset=540,
    stickyNoteOffset=385,
}) {
    const [isHoverArrowIcon, setIsHoverArrowIcon] = useState(false);
    const [isHoverDoubleArrowIcon, setIsHoverDoubleArrowIcon] = useState(false);
    const [isHoverSectionIcon, setIsHoverSectionIcon] = useState(false);
    const [isHoverTextIcon, setIsHoverTextIcon] = useState(false);
    // const [isHoverStickyNotes, setIsHoverStickyNotes] = useState(false);

    const [stickyNoteDraggable, setStickyNoteDraggable] = useState(false);
    const [ellipseDraggable, setEllipseDraggable] = useState(false);

    const stickyNoteRef = useRef(null);
    const dummyStickyNoteRef1 = useRef(null);
    const dummyStickyNoteRef2 = useRef(null);

    const ellipseRef = useRef(null);
    const dummyEllipseRef = useRef(null);

    
    const handleStickyNoteDragEnd = e => {
        onAddStickyNote(e.target.x()+x+stickyNoteOffset,
        e.target.y()+y, 145, 110);

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
            // onFinish: ()=>setIsHoverStickyNotes(false)
        });
        dummyStickyNoteRef1.current.to({
            x: 5, y: 5,
            duration: 0.55,
        });
        dummyStickyNoteRef2.current.to({
            x: 12, y: 12,
            duration: 0.45
        })
    }

    const handleEllipseDragEnd = e => {
        onAddConcept(e.target.x()+x+conceptOffset,
        e.target.y()+y, 72, 40)
        ellipseRef.current.setAttrs({
            x: 0,
            y: height + 20,
            radiusX: 40,
            radiusY: 40,
            shadowOffsetX: 5,
            shadowOffsetY: 2.5,
            shadowOpacity: 0.25,
            opacity: 1,
            shadowBlur: 5
        })
        dummyEllipseRef.current.setAttrs({
            y: height+40
        })
        ellipseRef.current.to({
            y: height/2+20
        })
    }


    return (
        <Group x={x} y={y} visible={visible}
        onMouseEnter={onHover}
        onMouseLeave={onUnhover}>
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
        shadowOffsetY={2.5}
        shadowOffsetX={0}
        strokeWidth={0.25}
        stroke={"gray"}
        shadowBlur={5}
        shadowOpacity={0.25}
        />

        <Group x={40} y={height/2-25}
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
            strokeWidth={1.5}
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
            // tension={0}
            // pointerLength={10}
            // pointerWidth={12}
            />
            <Line
            points={[38,18,45,25,38,32]}
            stroke={isArrowIconClicked?"white":"black"}
            // tension={0}
            // pointerLength={10}
            // pointerWidth={12}
            />
        </Group>

        <Group x={110} y={height/2-25}
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
            strokeWidth={1.5}
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
            // tension={0}
            // pointerLength={10}
            // pointerWidth={12}
            />
            <Line
            points={[38,18,45,25,38,32]}
            stroke={isDoubleArrowIconClicked?"white":"black"}
            // tension={0}
            // pointerLength={10}
            // pointerWidth={12}
            />
            <Line
            points={[12,18,5,25,12,32]}
            stroke={isDoubleArrowIconClicked?"white":"black"}
            // tension={0}
            // pointerLength={10}
            // pointerWidth={12}
            />
        </Group>

        <Group x={180} y={height/2-25}
        onMouseEnter={()=>{setIsHoverSectionIcon(true)}}
        onMouseLeave={()=>{setIsHoverSectionIcon(false)}}
        onClick={onSectionIconClick}
        >
            <Rect
            x={0}
            y={0}
            cornerRadius={10}
            width={50}
            height={50}
            fill={isSectionIconClicked?"#010203":
            isHoverSectionIcon?"#D5D5D5":"#D9CBA6"}
            stroke={"#010203"}
            strokeWidth={1.5}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={isSectionIconClicked?5:0}
            shadowOpacity={isSectionIconClicked?0.25:0}
            opacity={isSectionIconClicked?0.75:
                isHoverSectionIcon?0.27:0.2}
            />
            <Path
            x={8}
            y={8}
            // data={'m0,0l15,15z'}
            data={'M24,0L29,0Q34,0,34,5L34,29Q34,34,29,34L5,34Q0,34,0,29L0,15'}
            fill={"transparent"}
            stroke={isSectionIconClicked?"white":"black"}
            strokeWidth={1.75}
            />
            {/* <Line
            points={[25,10,
                30,10,35,10,
                40,10,
                40,15,40,35,
                40,40,
                35,40,15,40,10,40,
                10,35,10,20,10,15]}
            stroke={isSectionIconClicked?"white":"black"}
            tension={0.5}/> */}
            {/* <Rect
            x={8}
            y={8}
            width={34}
            height={34}
            cornerRadius={2.5}
            fill={"transparent"}
            stroke={isSectionIconClicked?"white":"black"}
            strokeWidth={2}/> */}
            <Rect
            x={8}
            y={8}
            width={20}
            height={10}
            cornerRadius={2.5}
            fill={"transparent"}
            stroke={isSectionIconClicked?"white":"black"}
            strokeWidth={1.75}/>
            {/* <Line
            points={[25,10,40,10,40,40,10,40,10,15]}
            stroke={isSectionIconClicked?"white":"black"}/> */}
        </Group>

        <Group x={300} y={height/2-25}
        onMouseEnter={()=>{setIsHoverTextIcon(true)}}
        onMouseLeave={()=>{setIsHoverTextIcon(false)}}
        onClick={onTextIconClick}
        >
            <Rect
            x={0}
            y={0}
            cornerRadius={10}
            width={50}
            height={50}
            fill={isTextIconClicked?"#010203":
            isHoverTextIcon?"#D5D5D5":"white"}
            stroke={"#010203"}
            strokeWidth={0.75}
            shadowOffsetY={0}
            shadowOffsetX={0}
            shadowBlur={isTextIconClicked?5:0}
            shadowOpacity={isTextIconClicked?0.25:0}
            opacity={isTextIconClicked?0.75:
                isHoverDoubleArrowIcon?0.27:0.2}
            />
            <Line
            points={[10,10,40,10]}
            stroke={isTextIconClicked?"white":"black"}/>
            <Line
            points={[25,10,25,40]}
            stroke={isTextIconClicked?"white":"black"}/>
        </Group>

        <Group x={conceptOffset} y={0}
        clipX={-window.innerWidth}
        clipY={-window.innerHeight}
        clipWidth={window.innerWidth*2}
        clipHeight={height+window.innerHeight}
        onMouseEnter={(e)=>{
            e.target.to({
                y: height / 2,
                radiusX: 64,
                radiusY: 35,
                duration: 0.25,
                easing: Konva.Easings.EaseOut,
                onFinish: ()=>{
                    setEllipseDraggable(true);
                }
            })
        }}
        onMouseLeave={(e)=>{
            e.target.to({
                y: height / 2 + 20,
                radiusX: 40,
                radiusY: 40,
                duration: 0.32,
                onFinish: ()=>{
                    setEllipseDraggable(false);
                }
            })
        }}>
            <Ellipse
            x={0}
            y={height+40}
            radiusX={40}
            radiusY={40}
            ref={dummyEllipseRef}
            stroke={"#010203"}
            strokeWidth={0.2}
            shadowColor={"gray"}
            shadowOffsetY={2.5}
            shadowOffsetX={5}
            shadowBlur={5}
            shadowOpacity={0.25}
            fill={"#FFB5B7"}
            opacity={0.85}
            // draggable={true}
            />
            <Ellipse
            x={0}
            y={height/2+20}
            radiusX={40}
            radiusY={40}
            ref={ellipseRef}
            stroke={"#010203"}
            strokeWidth={0.2}
            shadowColor={"gray"}
            shadowOffsetY={2.5}
            shadowOffsetX={5}
            shadowBlur={5}
            shadowOpacity={0.25}
            fill={"#FFB5B7"}
            opacity={1}
            draggable={ellipseDraggable}
            onDragStart={(e)=>{
                const stage = e.target.getStage();
                stage.container().style.cursor = "grabbing";
                ellipseRef.current.setAttrs({
                    radiusX: 72,
                    radiusY: 40,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowOpacity: 0,
                    shadowBlur: 0
                });
                dummyEllipseRef.current.to({
                    y: height + 20,
                    duration: 0.2,
                    easing: Konva.Easings.EaseOut
                })
            }}
            onDragEnd={(e)=>{
                const stage = e.target.getStage();
                stage.container().style.cursor = "default";
                handleEllipseDragEnd(e);
            }}
            />
        </Group>

        <Group x={stickyNoteOffset} y={0}
        onMouseEnter={()=>{
            stickyNoteRef.current.to({
                x: -21,
                y: -75,
                width: 125,
                height: 125,
                duration: 0.25,
                onFinish: ()=>{
                    setStickyNoteDraggable(true);
                }
            });
            // if (!isHoverStickyNotes) {
            //     setIsHoverStickyNotes(true)
            //     stickyNoteRef.current.to({
            //         x: -18,
            //         y: -75,
            //         width: 125,
            //         height: 125,
            //         duration: 0.2,
            //     });
            // }
        }}
        onMouseLeave={()=>{
            stickyNoteRef.current.to({
                x: 19,
                y: 19,
                width: 60,
                height: 60,
                duration: 0.2,
                onFinish: ()=>{
                    setStickyNoteDraggable(false);
                }
            });
            // if (isHoverStickyNotes) {
            //     setIsHoverStickyNotes(false);
            //     stickyNoteRef.current.to({
            //         x: 19,
            //         y: 19,
            //         width: 60,
            //         height: 60,
            //         duration: 0.2
            //     });
            // }
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
            draggable={stickyNoteDraggable}
            onDragStart={(e)=>{
                const stage = e.target.getStage();
                stage.container().style.cursor = "grabbing";
                stickyNoteRef.current.setAttrs({
                    width: 180,
                    height: 180,
                    shadowOffsetY: 7,
                    shadowOpacity: 0.2
                });
            }}
            onDragEnd={(e)=>{
                const stage = e.target.getStage();
                stage.container().style.cursor = "default";
                handleStickyNoteDragEnd(e);
            }}/>
        </Group>
        </Group>
    )
}