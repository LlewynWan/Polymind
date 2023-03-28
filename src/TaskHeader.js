import React, { useState, useContext, useEffect, useRef } from "react";

import Konva from "konva";

import { colorPalette } from "./utils/color_utils";
import { extractKeywords, summarize } from "./utils/GPT_utils";
import { Group, Label, Tag, Text, Rect, Arrow, Circle } from "react-konva";

import { Icon } from "./Icon";
import { PreviewPanel } from "./PreviewPanel";

import { CanvasContext } from "./state";


export function TaskHeader({
    id,
    type,
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
    displaySet,
    notificationSet,
    setNotificationSet,
    resetCallbackTaskId,
    expandAll,
    closeAll,
    callbackTaskId=-1
}) {
    const {taskNodes} = useContext(CanvasContext);
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

    const [isAnimating, setIsAnimating] =  useState(false);

    const curtainRef = useRef(null);
    // const promptRectRef = useRef(null);
    // const promptCircleRef = useRef(null);

    const [requestingSet, setRequestingSet] = useState(new Set());
    const [summary, setSummary] = useState("");
    const [taskSummaryMap, setTaskSummaryMap] = useState({});
    const [taskKeypointsMap, setTaskKeypointsMap] = useState({});
    // const [notificationSet, setNotificationSet] = useState(new Set());


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
        if (callbackTaskId !== -1 &&
            !disabledSet.has(callbackTaskId)
            // && !notificationSet.has(callbackTaskId)
            && !isHover && !isCurtainFixed) {
            // clearTimeout(hoverTimeout);
            setIsAnimating(true);
            clearTimeout(callbackTimeout);
            setNotificationSet(prevSet=>{
                let tmp = prevSet;
                if (!displaySet.has(callbackTaskId)) {
                    tmp.add(callbackTaskId);
                }
                return tmp;
            });
            const newNodes = taskNodes.filter(node=>
                node.task_id===callbackTaskId && node.attached_to_id===id &&
                (node.attached_to_type===type || (node.attached_to_type==="node" && type!=="section")));
            const prevOutput = newNodes.reduce((prevText,node)=>prevText+node.text+"\n","")
           summarize(newNodes[0].prompt, prevOutput, (result)=>{
                setTaskSummaryMap(prevState=>{
                    let tmp = prevState;
                    tmp[callbackTaskId] = result;
                    return tmp;
                })
                // setSummary(result);
            });
            extractKeywords(newNodes[0].prompt, prevOutput, (result=>{
                setTaskKeypointsMap(prevState=>{
                    let tmp = prevState;
                    tmp[callbackTaskId] = result;
                    return tmp;
                });
                setSummary(result);
            }))
            curtainRef.current.to({
                fill: colorPalette[callbackTaskId%colorPalette.length],
                width: width,
                visible: true,
                duration: 0.25,
                easing: Konva.Easings.EaseOut,
                onFinish: ()=>{
                    setIsAnimating(false);
                    setIsCurtainDrawn(true);
                    setCurtainId(callbackTaskId);
                    setCallbackTimeout(setTimeout(()=>{
                        setSummary("");
                        setIsCurtainDrawn(false);
                        curtainRef.current.getStage().container().style.cursor = "default"
                        curtainRef.current.to({
                            width: 0,
                            visible: false,
                            duration: 0.15,
                            onFinish: ()=>resetCallbackTaskId()
                        });
                    }, 4000));
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
            tmp.destroy();
        });
        setHeaderPositions(positions);
        setFontHeight(test.height());
        test.destroy();
    }, [tasks, fontSize, offsetX])

    useEffect(()=>{
        clearTimeout(callbackTimeout);
        resetCallbackTaskId();
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
    onClick={(e)=>{e.cancelBubble=true}}
    onWheel={handleTaskHeaderWheel}
    onMouseEnter={()=>{
        // console.log(isCurtainFixed,isCurtainDrawn)
        setIsHover(true);
    }}
    onMouseLeave={()=>{
        setIsHover(false);
        // setCurrentHoverId(-1);
        // clearTimeout(hoverTimeout);
        // setIsCurtainDrawn(false);
        
        // if (!isCurtainFixed) {
        //     // setCurrentHoverId(-1);
        //     setCurtainId(-1);
        //     // clearTimeout(hoverTimeout);
        //     setIsCurtainDrawn(false);
        //     curtainRef.current.to({
        //         width: 0,
        //         duration: 0.25,
        //         easing: Konva.Easings.EaseOut,
        //         onFinish: ()=> {
        //             setCurtainId(-1);
        //             setIsCurtainDrawn(false);
        //             setIsHoverHeader(false);
        //             // setIsCurtainDrawn(false);
        //             // promptRectRef.current.to({
        //             //     fill: "silver",
        //             //     opacity: 1,
        //             //     duration: 0.25
        //             // });
        //             // promptCircleRef.current.to({
        //             //     fill: "silver",
        //             //     opacity: 1,
        //             //     duration: 0.25
        //             // });
        //         }
        //     });
        // }
        // setIsHoverHeader(false);
    }}
    listening={listening && !isAnimating}>
        <PreviewPanel
        x={0}
        y={-4}
        width={width}
        height={width*0.5}
        visible={notificationSet.size!==0&&isHover}
        tasks={tasks.filter(task=>notificationSet.has(task.id)
            &&taskSummaryMap[task.id]&&taskKeypointsMap[task.id])}
        taskSummaryMap={taskSummaryMap}
        taskKeypointsMap={taskKeypointsMap}
        expandAll={expandAll}/>
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
        shadowColor={"#111111"}
        // fill={"#646464"}
        fill={"white"}
        perfectDrawEnabled={false}
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
                <Group
                key={task.id}>
                <Label
                // key={task.id}
                // x={task.id*25+offsetX}
                x={headerPositions[tasks.length-index-1]+offsetX}
                y={0}
                // onWheel={(e)=>{clearTimeout(hoverTimeout)}}
                onMouseEnter={(e)=>{
                    // if (task.id !== currentHoverId && !disabledSet.has(task.id)) {
                    //     clearTimeout(hoverTimeout);
                    //     setCurrentHoverId(task.id);
                    //     setHoverTimeout(setTimeout(()=>{
                    //         setIsHoverHeader(true);
                    //         setIsAnimating(true);
                    //         curtainRef.current.to({
                    //             fill: colorPalette[task.id%colorPalette.length],
                    //             width: width,
                    //             duration: 0.25,
                    //             easing: Konva.Easings.EaseOut,
                    //             onFinish: ()=>{
                    //                 setIsCurtainDrawn(true);
                    //                 setCurtainId(task.id);
                    //                 setIsAnimating(false);
                    //             }
                    //             // onFinish: ()=>{
                    //             //     promptRectRef.current.to({
                    //             //         fill: colorPalette[task.id%colorPalette.length],
                    //             //         opacity: 0.75,
                    //             //         duration: 0.25
                    //             //     });
                    //             //     promptCircleRef.current.to({
                    //             //         fill: colorPalette[task.id%colorPalette.length],
                    //             //         opacity: 0.75,
                    //             //         duration: 0.25
                    //             //     });
                    //             // }
                    //         })
                    //     }, 1000));
                    // }
                    if (!requestingSet.has(task.id) && disabledSet.has(task.id)
                    && !displaySet.has(task.id)) {
                        e.target.parent.children[0].to({
                            opacity: 0.85,
                            fill: colorPalette[task.id%colorPalette.length],
                            duration: 0.15})
                    }
                    e.target.getStage().container().style.cursor = "pointer";
                    e.target.parent.to({y: -1, duration: 0.15});
                    e.target.to({fontSize: fontSize+2, duration: 0.15});
                }}
                onMouseLeave={(e)=>{
                    // if (currentHoverId === task.id) {
                    //     clearTimeout(hoverTimeout);
                    // }
                    if (!requestingSet.has(task.id) && disabledSet.has(task.id)
                    && !displaySet.has(task.id)) {
                        e.target.parent.children[0].to({
                            fill: "#C0C2CE",
                            duration: 0.15})
                    }
                    e.target.getStage().container().style.cursor = "default"
                    e.target.parent.to({y: 0, duration: 0.15})
                    e.target.to({fontSize: fontSize, duration: 0.15})
                }}
                onClick={(e)=>{
                    if (requestingSet.has(task.id))
                        return;
                    // if (!e.evt.ctrlKey && disabledSet.has(task.id)) {
                        // setInterval(()=>{
                        //     e.target.parent.children[0].to({
                        //         fill: "#C0C2CE",
                        //         duration: 1.25,
                        //         onFinish: ()=>{
                        //             e.target.parent.children[0].to({
                        //                 fill: colorPalette[task.id%colorPalette.length],
                        //                 duration: 1.25})
                        //         }})
                        // }, 4000)
                    // }
                    const requesting =  disabledSet.has(task.id) &&
                        !displaySet.has(task.id) && !e.evt.ctrlKey;

                    // const tween_tocolor = requesting ?
                    // new Konva.Tween({
                    //     node: e.target.parent.children[0],
                    //     duration: 0.75,
                    //     easings: Konva.Easings.EaseInOut,
                    //     fill: colorPalette[task.id%colorPalette.length],
                    //     opacity: 0.8,
                    // }) : null;
                    const tween_togray = requesting ?
                    new Konva.Tween({
                        node: e.target.parent.children[0],
                        duration: 0.75,
                        easings: Konva.Easings.EaseInOut,
                        fill: "#C0C2CE",
                        opacity: 0.64,
                        onFinish: ()=>{tween_togray.reverse()}
                    }) : null;

                    const waitingSignal = requesting ? setInterval(function waitingAnimation(){
                        tween_togray.play();
                        return waitingAnimation;
                        // tween.reverse();
                    }(), [1800]) : null;
                    // const waitingSignal = requesting ?
                    //     setInterval(()=>{
                    //         e.target.parent.children[0].to({
                    //             fill: "#C0C2CE",
                    //             opacity: 0.64,
                    //             duration: 0.75,
                    //             easings: Konva.Easings.EaseInOut,
                    //             onFinish: ()=>{
                    //                 e.target.parent.children[0].to({
                    //                     fill: colorPalette[task.id%colorPalette.length],
                    //                     opacity: 0.8,
                    //                     easings: Konva.Easings.EaseInOut,
                    //                     duration: 0.75})
                    //             }})
                    //     }, 2000) : null;
                    if (requesting) {
                        requestingSet.add(task.id);
                        setRequestingSet(requestingSet);
                    }
                    // if (disabledSet.has(task.id) && !e.evt.ctrlKey) {

                    // }
                    // console.log(requesting)
                    onTaskClick(e, task.id, requesting,
                        ()=>{
                            if (waitingSignal) {
                                clearInterval(waitingSignal);
                            }
                            // console.log(e.target.parent.children[0])
                            // tween_tocolor.pause();
                            tween_togray.pause();
                            // tween_tocolor.destroy();
                            tween_togray.destroy();
                            e.target.parent.children[0].setAttrs({
                                // fill: "#423F40",
                                fill: "#353233",
                                opacity: 0.64,
                                // duration: 0.25
                            });
                            requestingSet.delete(task.id);
                            setRequestingSet(requestingSet);
                            // e.target
                        });
                    
                    setNotificationSet(prevSet=>{
                        let tmp = prevSet;
                        tmp.delete(task.id);
                        return tmp;
                    });
                }}>
                    <Tag
                    fill={
                        // notificationSet.has(task.id)?"#010203":
                        disabledSet.has(task.id)?
                        (displaySet.has(task.id)&&!requestingSet.has(task.id)
                        ?"#353233":"#C0C2CE")
                        :colorPalette[task.id%colorPalette.length]}
                    opacity={disabledSet.has(task.id)?
                        (displaySet.has(task.id)&&!requestingSet.has(task.id)?0.85:0.64):1}
                    cornerRadius={2.5}
                    perfectDrawEnabled={false}
                    />
                    <Text
                    // stroke={"#FFA8B5"}
                    // strokeWidth={notificationSet.has(task.id)?0.5:0}
                    text={task.goal}
                    fontSize={fontSize}
                    // shadowOffsetY={2.5}
                    // shadowBlur={5}
                    // shadowOpacity={notificationSet.has(task.id)?0.25:0}
                    // shadowColor={"#FFA8B5"}
                    // width={20}
                    // height={20}
                    fontStyle={"bold"}
                    // fontStyle={displaySet.has(task.id)?"italic bold":"bold"}
                    textDecoration={displaySet.has(task.id)
                        && (!disabledSet.has(task.id))?"underline":""}
                    // Ellipsis={true}
                    align={"center"}
                    verticalAlign={"middle"}
                    fill={"white"}
                    // fill={disabledSet.has(task.id)&&displaySet.has(task.id)
                    //     &&!requestingSet.has(task.id)
                    //     ?colorPalette[task.id%colorPalette.length]:"white"}
                    // fill={disabledSet.has(task.id)?colorPalette[task.id%colorPalette.length]:"white"}
                    padding={2.5}
                    // opacity={task.id===4?0.5:1}
                    perfectDrawEnabled={false}
                    />
                </Label>
                {/* <Rect
                x={headerPositions[tasks.length-index-1]+offsetX}
                y={-3}
                width={24}
                height={6}
                fill={"#E53C38"}
                stroke={"white"}
                strokeWidth={1}
                opacity={0.75}
                cornerRadius={1.5}/> */}

                {notificationSet.has(task.id) ? <Group>
                <Circle
                x={headerPositions[tasks.length-index-1]+offsetX+5}
                y={fontHeight/2-5}
                radius={5}
                fill={"#E53C38"}
                opacity={0.8}
                perfectDrawEnabled={false}/>
                <Circle
                x={headerPositions[tasks.length-index-1]+offsetX+5}
                y={fontHeight/2-5}
                radius={5}
                stroke={"white"}
                // stroke={"#FFA8B5"}
                strokeWidth={1.25}
                fill={"transparent"}
                // opacity={0.85}
                perfectDrawEnabled={false}/>
                </Group> : null}

                </Group>
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
        }}
        perfectDrawEnabled={false}/>
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
        }}
        perfectDrawEnabled={false}/>
    </Group>

    <Group
    // onMouseLeave={()=>{
        // if (!isCurtainFixed) {
        //     setCurrentHoverId(-1);
        //     setCurtainId(-1);
        //     clearTimeout(hoverTimeout);
        //     setIsCurtainDrawn(false);
        //     curtainRef.current.to({
        //         width: 0,
        //         duration: 0.25,
        //         easing: Konva.Easings.EaseOut,
        //         onFinish: ()=> {
        //             setIsHoverHeader(false);
        //             // setIsCurtainDrawn(false);
        //             // promptRectRef.current.to({
        //             //     fill: "silver",
        //             //     opacity: 1,
        //             //     duration: 0.25
        //             // });
        //             // promptCircleRef.current.to({
        //             //     fill: "silver",
        //             //     opacity: 1,
        //             //     duration: 0.25
        //             // });
        //         }
        //     });
        // }
    // }}
    >
    <Rect
    x={0}
    y={-4}
    width={0}
    height={fontHeight+8}
    cornerRadius={2.5}
    visible={isHoverHeader}
    ref={curtainRef}
    perfectDrawEnabled={false}
    />
    {[...displaySet].filter(task_id=>!disabledSet.has(task_id)).length > 0 ? <Icon
    // x={width+15}
    x={-12}
    y={fontHeight/2}
    type={"closeAll"}
    onClick={closeAll}/>: null}
    <Text
    x={2.5}
    y={-4}
    width={width-25}
    height={fontHeight+8}
    align={"center"}
    verticalAlign={"middle"}
    fontSize={10}
    ellipsis={true}
    fill={"white"}
    fontStyle={"bold"}
    text={summary}
    padding={2.5}
    visible={isCurtainDrawn && !isCurtainFixed}
    perfectDrawEnabled={false}/>
    {isCurtainDrawn && !isCurtainFixed ? <Icon
    x={width-15}
    y={fontHeight/2}
    type={"forward"}
    onClick={(e)=>{
        e.cancelBubble = true;
                            
        setNotificationSet(prevSet=>{
            let tmp = prevSet;
            tmp.delete(curtainId);
            return tmp;
        });

        clearTimeout(callbackTimeout);
        setIsCurtainFixed(true);
        onCurtainClick(curtainId);
    }}/> : null}
    {isCurtainDrawn && isCurtainFixed ? <Icon
    x={width-15}
    y={fontHeight/2}
    type={"backward"}
    onClick={(e)=>{
        e.cancelBubble = true;
        e.target.getStage().container().style.cursor = "default"

        resetCurtain(curtainId);
        setIsCurtainFixed(false);
        // setCurrentHoverId(-1);
        setCurtainId(-1);
        // clearTimeout(hoverTimeout);
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
