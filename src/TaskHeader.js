import React, { useState, useEffect, useRef } from "react";

import Konva from "konva";

import { colorPalette } from "./utils/color_utils";
import { Group, Label, Tag, Text, Rect, Arrow } from "react-konva";

import { Icon } from "./Icon";


export function TaskHeader({
    x,y,
    tasks,
    scale,
    width,
    fontSize,
    listening,
    onTaskClick,
    onCurtainClick,
    resetCurtain,
    disabledSet,
    resetNodeCallbackTaskId,
    callbackTaskId=-1
}) {
    const [isHover, setIsHover] = useState(false);

    const [offsetX, setOffsetX] = useState(25);
    const [headerPositions, setHeaderPositions] = useState(Array(tasks.length+1).fill(0));
    const [fontHeight, setFontHeight] = useState(0);
    const [isHoverHeader, setIsHoverHeader] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(0);
    const [callbackTimeout, setCallbackTimeout] = useState(-1);
    const [currentHoverId, setCurrentHoverId] = useState(-1);
    const [curtainId, setCurtainId] = useState(-1);

    const [isHoverLeftArrow, setIsHoverLeftArrow] = useState(false);
    const [isHoverRightArrow, setIsHoverRightArrow] = useState(false);
    const [hoverLeftArrowInterval, setHoverLeftArrowInterval] = useState(null);
    const [hoverRightArrowInterval, setHoverRightArrowInterval] = useState(null);

    const [isCurtainDrawn, setIsCurtainDrawn] = useState(false);
    const [isCurtainFixed, setIsCurtainFixed] = useState(false);

    const curtainRef = useRef(null);
    // const promptRectRef = useRef(null);
    // const promptCircleRef = useRef(null);


    const handleScroll = (offset) => {
        setOffsetX(previousOffsetX => {
            if (previousOffsetX+offset <= 25 &&
                previousOffsetX+offset >= width-35-headerPositions.slice(-1)[0])
                {
                    return previousOffsetX+offset;
                }
            else if (previousOffsetX < width-35-headerPositions.slice(-1)[0]
            && previousOffsetX+offset <= 25 && offset > 0) {
                return previousOffsetX+offset;
            }
            else {
                return previousOffsetX;
            }
        })
    }

    const handleTaskHeaderWheel = e => {
        e.evt.preventDefault();
        e.cancelBubble=true;
        const offset = e.evt.deltaY < 0 ? 20 : -20;
        handleScroll(offset);
        // if (offsetX+offset <= 25 &&
        //     offsetX+offset >= width-35-headerPositions.slice(-1)[0])
        //     {
        //         setOffsetX(offsetX+offset)
        //     }
        // setOffsetX(Math.max(
        //     Math.min(offsetX+offset,5),width-15-headerPositions.slice(-1)[0]));
    }

    useEffect(()=>{
        if (callbackTaskId !== -1 && !isHover && !isCurtainFixed) {
            clearTimeout(hoverTimeout);
            clearTimeout(callbackTimeout);
            curtainRef.current.to({
                fill: colorPalette[callbackTaskId%colorPalette.length],
                width: width,
                visible: true,
                duration: 0.25,
                easing: Konva.Easings.EaseOut,
                onFinish: ()=>{
                    setIsCurtainDrawn(true);
                    setCurtainId(callbackTaskId);
                    setCallbackTimeout(setTimeout(()=>{
                        setIsCurtainDrawn(false);
                        curtainRef.current.getStage().container().style.cursor = "default"
                        curtainRef.current.to({
                            width: 0,
                            visible: false,
                            duration: 0.15,
                            onFinish: ()=>resetNodeCallbackTaskId()
                        });
                    }, 2000));
                }
            })
        }
    }, [callbackTaskId]);

    useEffect(()=>{
        var positions = [0];
        const test = new Konva.Text({text: "test", fontSize: fontSize, fontStyle: "bold",
            align: "center", verticalAlign: "middle", padding: 2.5});
        
        tasks.map(task=>{
            const tmp = new Konva.Text({text: task.goal, fontSize: fontSize, fontStyle: "bold",
            align: "center", verticalAlign: "middle", padding: 2.5});
            const newPosition = positions.slice(-1)[0] + tmp.width()+1.5;
            positions.push(newPosition);
        });
        setHeaderPositions(positions);
        setFontHeight(test.height());
    }, [tasks, fontSize, offsetX])

    useEffect(()=>{
        clearTimeout(callbackTimeout);
        resetNodeCallbackTaskId();
    }, [isCurtainFixed])

    // return (
    //     <Group
    //     x={x}
    //     y={y}
    //     scaleX={scale}
    //     scaleY={scale}
    //     opacity={isHover?1:0.5}
    //     onMouseEnter={()=>{setIsHover(true)}}
    //     onMouseLeave={()=>{setIsHover(false)}}>
    //         <Rect
    //         x={0}
    //         y={-25}
    //         width={(tasks.length-1)*12}
    //         height={35}
    //         fill={"transparent"}
    //         />
    //         <Group>
    //         {tasks.slice(0).reverse().map(task=>{
    //             return (
    //             <Group>
    //             <Rect
    //             // x={12*task.id}
    //             x={12*task.id}
    //             y={-10}
    //             width={10}
    //             height={10}
    //             // cornerRadius={5}
    //             // shadowOffsetX={0}
    //             // shadowOffsetY={2.5}
    //             // shadowBlur={5}
    //             // shadowOpacity={0.25}
    //             // shadowColor={"gray"}
    //             fill={colorPalette[task.id%colorPalette.length]}/>
    //             <Rect
    //             // x={12*task.id}
    //             x={12*task.id}
    //             y={-35}
    //             width={10}
    //             height={25}
    //             // cornerRadius={5}
    //             // shadowOffsetX={2.5}
    //             // shadowOffsetY={5}
    //             // shadowBlur={5}
    //             // shadowOpacity={0.5}
    //             // shadowColor={"gray"}
    //             opacity={0.25}
    //             fill={"silver"}/>
    //             {/* <Label
    //             x={12*task.id}
    //             y={-4}
    //             // y={fontHeight/2}
    //             >
    //                 <Tag
    //                 // ref={promptRectRef}
    //                 fill={colorPalette[task.id%colorPalette.length]}/>
    //                 <Text
    //                 text={task.goal[0]}
    //                 fontSize={fontSize+4}
    //                 // width={20}
    //                 // height={20}
    //                 fontStyle={"bold"}
    //                 // Ellipsis={true}
    //                 align={"center"}
    //                 verticalAlign={"middle"}
    //                 fill={"white"}
    //                 padding={1}
    //                 />
    //             </Label> */}
    //             </Group>)
    //         })}
    //         </Group>
    //     </Group>
    // )

    return (
    <Group
    x={x}
    y={y}
    scaleX={scale}
    scaleY={scale}

    onWheel={handleTaskHeaderWheel}
    onMouseEnter={()=>{
        setIsHover(true);
    }}
    onMouseLeave={()=>{
        setIsHover(false);
        setCurrentHoverId(-1);
        clearTimeout(hoverTimeout);
        // setIsHoverHeader(false);
    }}
    listening={listening}>
        {/* <Rect
        x={0}
        y={-8-fontHeight}
        width={width}
        height={fontHeight*2+8}
        cornerRadius={2.5}
        stroke={"gray"}
        strokeWidth={0.25}
        shadowBlur={5}
        shadowOffsetX={0}
        shadowOffsetY={1.5}
        shadowOpacity={0.15}
        shadowColor={"black"}
        fill={"#444444"}
        /> */}
    <Group
    // opacity={isHover?1:0.75}
    >
        <Rect
        x={0}
        // y={-fontHeight-12}
        y={-4}
        width={width}
        // height={fontHeight*2+16}
        height={fontHeight+8}
        stroke={"gray"}
        strokeWidth={0.25}
        cornerRadius={5}
        shadowBlur={5}
        shadowOffsetX={0}
        shadowOffsetY={1.5}
        shadowOpacity={0.15}
        shadowColor={"black"}
        // fill={"#646464"}
        fill={"white"}
        />
        {/* <Rect
        x={0}
        y={-4}
        // y={-fontHeight-12}
        width={width}
        height={fontHeight+8}
        cornerRadius={5}
        fill={"#E1E1E1"}/> */}

        {/* <Circle
        x={10}
        y={-8-fontHeight/2}
        // y={fontHeight/2}
        ref={promptCircleRef}
        radius={10}
        fill={"silver"}/>
        <Label
        x={20}
        y={-8-fontHeight/2}
        // y={fontHeight/2}
        >
            <Tag
            ref={promptRectRef}
            fill={"silver"}
            cornerRadius={2.5}
            pointerDirection={"left"}
            pointerWidth={5}
            pointerHeight={5}/>
            <Text
            text={"......"}
            fontSize={fontSize}
            // width={20}
            // height={20}
            fontStyle={"bold"}
            // Ellipsis={true}
            align={"center"}
            verticalAlign={"middle"}
            fill={"white"}
            padding={2.5}
            />
        </Label> */}

        <Group
        x={0}
        y={0}
        // y={-fontHeight-8}
        clipX={20}
        clipY={-window.innerHeight}
        clipWidth={width-40}
        clipHeight={window.innerHeight*2}>
        {tasks.slice().reverse().map((task,index)=>{
            return (
                <Label
                key={task.id}
                // x={task.id*25+offsetX}
                x={headerPositions[tasks.length-index-1]+offsetX}
                y={0}
                // onWheel={(e)=>{clearTimeout(hoverTimeout)}}
                onMouseEnter={(e)=>{
                    if (task.id !== currentHoverId) {
                        clearTimeout(hoverTimeout);
                        setCurrentHoverId(task.id);
                        setHoverTimeout(setTimeout(()=>{
                            setIsHoverHeader(true);
                            curtainRef.current.to({
                                fill: colorPalette[task.id%colorPalette.length],
                                width: width,
                                duration: 0.25,
                                easing: Konva.Easings.EaseOut,
                                onFinish: ()=>{
                                    setIsCurtainDrawn(true);
                                    setCurtainId(task.id);
                                }
                                // onFinish: ()=>{
                                //     promptRectRef.current.to({
                                //         fill: colorPalette[task.id%colorPalette.length],
                                //         opacity: 0.75,
                                //         duration: 0.25
                                //     });
                                //     promptCircleRef.current.to({
                                //         fill: colorPalette[task.id%colorPalette.length],
                                //         opacity: 0.75,
                                //         duration: 0.25
                                //     });
                                // }
                            })
                        }, 1800));
                    }
                    e.target.getStage().container().style.cursor = "pointer"
                    e.target.parent.to({y: -1, duration: 0.15})
                    e.target.to({fontSize: fontSize+2, duration: 0.15})
                    
                }}
                onMouseLeave={(e)=>{
                    if (currentHoverId === task.id) {
                        clearTimeout(hoverTimeout);
                    }
                    e.target.getStage().container().style.cursor = "default"
                    e.target.parent.to({y: 0, duration: 0.15})
                    e.target.to({fontSize: fontSize, duration: 0.15})
                }}
                onClick={()=>onTaskClick(task.id)}
                >
                    <Tag
                    fill={disabledSet.has(task.id)?
                        "#C0C2CE":colorPalette[task.id%colorPalette.length]}
                    opacity={disabledSet.has(task.id)?0.5:1}
                    cornerRadius={2.5}/>
                    <Text
                    text={task.goal}
                    fontSize={fontSize}
                    // width={20}
                    // height={20}
                    fontStyle={"bold"}
                    // Ellipsis={true}
                    align={"center"}
                    verticalAlign={"middle"}
                    fill={"white"}
                    padding={2.5}
                    />
                </Label>
                // <Circle
                // key={task.id}
                // x={task.id*15}
                // y={0}
                // radius={5}
                // fill={colorPalette[task.id%colorPalette.length]}
                // />
            )
        })}
        </Group>
        
        <Arrow
        points={[12.5,fontHeight/2,10,fontHeight/2,7.5,fontHeight/2]}
        fill={"silver"}
        stroke={"silver"}
        opacity={isHoverLeftArrow?1:0.5}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={()=>{
            setIsHoverLeftArrow(true);
            const interval = setInterval(()=>{
                handleScroll(20);
            }, 100);
            setHoverLeftArrowInterval(interval);
        }}
        onMouseLeave={()=>{
            setIsHoverLeftArrow(false);
            if (hoverLeftArrowInterval) {
                clearInterval(hoverLeftArrowInterval);
                setHoverLeftArrowInterval(null);
            }
        }}/>
        <Arrow
        points={[width-12.5,fontHeight/2,width-10,fontHeight/2,width-7.5,fontHeight/2]}
        fill={"silver"}
        stroke={"silver"}
        opacity={isHoverRightArrow?1:0.5}
        pointerLength={8}
        pointerWidth={12}
        strokeWidth={1}
        onMouseEnter={()=>{
            setIsHoverRightArrow(true);
            const interval = setInterval(()=>{
                handleScroll(-20);
            }, 100);
            setHoverRightArrowInterval(interval);
        }}
        onMouseLeave={()=>{
            setIsHoverRightArrow(false);
            if (hoverRightArrowInterval) {
                clearInterval(hoverRightArrowInterval);
                setHoverRightArrowInterval(null);
            }
        }}/>
    </Group>

    <Group
    onMouseLeave={()=>{
        if (!isCurtainFixed) {
            setCurrentHoverId(-1);
            setCurtainId(-1);
            clearTimeout(hoverTimeout);
            setIsCurtainDrawn(false);
            curtainRef.current.to({
                width: 0,
                duration: 0.25,
                easing: Konva.Easings.EaseOut,
                onFinish: ()=> {
                    setIsHoverHeader(false);
                    // setIsCurtainDrawn(false);
                    // promptRectRef.current.to({
                    //     fill: "silver",
                    //     opacity: 1,
                    //     duration: 0.25
                    // });
                    // promptCircleRef.current.to({
                    //     fill: "silver",
                    //     opacity: 1,
                    //     duration: 0.25
                    // });
                }
            });
        }
    }}>
    <Rect
    x={0}
    y={-4}
    width={0}
    height={fontHeight+8}
    cornerRadius={2.5}
    visible={isHoverHeader}
    ref={curtainRef}
    />
    {isCurtainDrawn && ! isCurtainFixed ? <Icon
    x={width-15}
    y={fontHeight/2}
    type={"forward"}
    onClick={()=>{
        // clearTimeout(callbackTimeout);
        setIsCurtainFixed(true);
        onCurtainClick(curtainId);
    }}/> : null}
    {isCurtainDrawn && isCurtainFixed ? <Icon
    x={width-15}
    y={fontHeight/2}
    type={"backward"}
    onClick={(e)=>{
        e.target.getStage().container().style.cursor = "default"

        resetCurtain(curtainId);
        setIsCurtainFixed(false);
        setCurrentHoverId(-1);
        setCurtainId(-1);
        clearTimeout(hoverTimeout);
        setIsCurtainDrawn(false);
        curtainRef.current.to({
            width: 0,
            duration: 0.25,
            easing: Konva.Easings.EaseOut,
            onFinish: ()=> {
                setIsHoverHeader(false);
            }
        });
    }}
    /> : null}
    </Group>
    </Group>
    )
}
