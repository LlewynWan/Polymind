import React, { createRef, useContext, useEffect, useState } from "react";
import { HotKeys } from "react-hotkeys";

import Konva from "konva";
import { Stage, Layer, Group, Line } from "react-konva";

import { StickyNote } from "./StickyNote";
import { Prompter } from "./Prompter";
import { ToolBar } from "./ToolBar";
import { Keyword } from "./Keyword"

import { GlobalContext, CanvasContext, PrompterContext } from "./state";
import { Configuration, OpenAIApi } from "openai"


async function PromptGPT()
{
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Say this is a test",
        temperature: 0,
        max_tokens: 7,
      });
    
    return response;
}


export function Canvas({dimensions})
{
    const {nodes, numNodes, arrows, promptCards, mainPrompter,
        setNodes, setNumNodes, setArrows, setPromptCards, setMainPrompter} = useContext(GlobalContext);

    const [canvasX, setCanvasX] = React.useState(0);
    const [canvasY, setCanvasY] = React.useState(0);
    const [canvasScale, setCanvasScale] = React.useState(1);
    const stageRef = React.useRef(null);
    const layerRef = React.useRef(null);
    const promptCardsRef = React.useRef([]);
    if (promptCardsRef.current.length !== promptCards.length+1) {
        promptCardsRef.current = Array(promptCards.length+1).fill()
        .map((_,i)=>promptCardsRef.current[i] || createRef());
    }

    const [isDrawingArrow, setIsDrawingArrow] = React.useState(false);
    const [isDrawingDoubleArrow, setIsDrawingDoubleArrow] = React.useState(false);
    const [arrowFrom, setArrowFrom] = React.useState({id: -1, anchor: -1});
    const [arrowTo, setArrowTo] = React.useState({id: -1, anchor: -1});
    const [isMultiSelecting, setIsMultiSelecting] = React.useState(false);

    const [isHoverToolBar, setIsHoverToolBar] = React.useState(false);
    const [toolBarVisibility, setToolBarVisibility] = React.useState(true);

    const pointerTracker = React.useRef(null);
    const [pointerPosition, setPointerPosition] = React.useState({x:-1, y:-1});

    const pointer2CanvasPosition = (position) => {
        const posX = (position.x - canvasX) / canvasScale;
        const posY = (position.y -  canvasY) / canvasScale;
        return [posX, posY];
    }

    const updatePromptCards = (prompt) => {
        promptCardsRef.current[promptCards.length].current.to({
            y: dimensions.height*0.05,
            opacity: 0.25,
            duration: 0.75,
            easing: Konva.Easings.EaseInOut,
            onFinish: ()=>{
                promptCardsRef.current[promptCards.length].current.to({
                    opacity: 1,
                    duration: 0.15,
                    easing: Konva.Easings.EaseIn,
                    onFinish: ()=> {
                        setPromptCards(prevState=>{
                            return prevState.map((state)=>{
                                let tmp = state;
                                if (tmp.id === promptCards.length) {
                                    tmp.y = dimensions.height*0.05;
                                    tmp.id = 1;
                                } else {
                                    tmp.y += 175;
                                    tmp.id += 1;
                                }
                                return tmp;
                            })
                        })
                    }
                });
            }
        });

        promptCardsRef.current.map((promptCardRef,index)=>{
            if (index !== 0) {
                if (index !== promptCards.length) {
                    promptCardRef.current.to({
                        y: promptCardRef.current.y()+175,
                        duration: 0.1+(5-index)*0.15,
                        easing: Konva.Easings.EaseOut,
                    })
                }
            }
        });
    }

    useEffect(() => {
        if (pointerTracker.current) {
            clearInterval(pointerTracker.current);
        }
        pointerTracker.current = setInterval(() => {
            if (stageRef) {
                const position = stageRef.current.getPointerPosition();
                if (position) {
                    setPointerPosition(position);
                }
            }
        }, 120);

        if (!isHoverToolBar && stageRef) {
            stageRef.current.container().style.cursor =
            (isDrawingArrow || isDrawingDoubleArrow) ? "crosshair"
            : "default";
        } else {
            stageRef.current.container().style.cursor = "default";
        }

        if (!isDrawingArrow && !isDrawingDoubleArrow) {
            setArrowFrom({id: -1, anchor: -1});
            setArrowTo({id: -1, anchor: -1});
        }

        return () => clearInterval(pointerTracker);
    }, [dimensions, canvasScale, isDrawingArrow, isDrawingDoubleArrow, isHoverToolBar]);


    const UnselectAll = (e) => {
        setNodes(prevState => {
            return prevState.map((state)=>{
                let tmp = state;
                tmp.selected = false;
                return tmp;
            });
        });

        setIsDrawingArrow(false);
        setIsDrawingDoubleArrow(false);
    };
    
    const keyMap = {
        UNSELECT_ALL: "escape",
    };
    
    const handlers = {
        UNSELECT_ALL: UnselectAll
    };

    const handleDragNodeMove = (e, id) => {
        setNodes(prevState => {
            return prevState.map((state) => {
                let tmp = state;
                if (tmp.id === id) {
                    tmp.x = e.target.x();
                    tmp.y = e.target.y();
                }
                return tmp;
            });
        });
    }
    const handleDragNodeEnd = (e, id) => {
        setNodes(prevState => {
            return prevState.map((state) => {
                let tmp = state;
                if (tmp.id === id) {
                    tmp.x = e.target.x();
                    tmp.y = e.target.y();
                }
                return tmp;
            });
        });
    }

    const handleStageWheel = e => {
        e.evt.preventDefault();
        var scaleBy = 1.12;
        scaleBy = e.evt.deltaY < 0 ? scaleBy : 1 / scaleBy;
        const newScale = canvasScale * scaleBy
        setCanvasScale(newScale);
        
        const position = e.target.getStage().getPointerPosition();
        const offsetX = (position.x - canvasX) * (scaleBy - 1);
        const offsetY = (position.y - canvasY) * (scaleBy - 1);
        setCanvasX(canvasX - offsetX);
        setCanvasY(canvasY - offsetY);
    }

    const handleStageMouseDown = e => {
        e.cancelBubble = true;
        if (!isDrawingArrow && !isDrawingDoubleArrow) {
            setIsMultiSelecting(true);
        }
    }

    const setPrompterPosition = (e, id) => {
        setPromptCards(prevState => {
            return prevState.map((state) => {
                if (state.id === id) {
                    let tmp = state;
                    tmp.x = e.target.x();
                    tmp.y = e.target.y();
                    return tmp;
                } else {
                    return state;
                }
            })
        });
    }

    const onMainPrompterHover = node => {
        setToolBarVisibility(false);
        node.to({
            scaleX: 1.2,
            scaleY: 1.2,
            x: mainPrompter.x - mainPrompter.width*0.1,
            y: mainPrompter.y - mainPrompter.height - 40,
            shadowBlur: 0,
            shadowOpacity: 0
        })
    }

    const onMainPrompterUnhover = node => {
        setToolBarVisibility(true);
        node.to({
            scaleX: 1,
            scaleY: 1,
            x: mainPrompter.x,
            y: mainPrompter.y,
            shadowBlur: 5,
            shadowOpacity: 0.25
        })
    }

    const calcAnchorPosition = (anchor, node) => {
        const anchorPosition = [
            [node.x + (node.width + 35)*node.scaleX / 2, node.y-20/canvasScale],
            [node.x-20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
            [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 20/canvasScale],
            [node.x + (node.width + 35)*node.scaleX + 20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
        ]
        return anchorPosition[anchor];
    }

    const findPathBetweenVectors = (from, to) => {
        var points = []
        if (from.dx === to.dx && from.dx !== 0) {
            const borderX = from.dx > 0 ? Math.max(from.x, to.x) : Math.min(from.x, to.x);
            points = [borderX, from.y, borderX, to.y];
            // if ((from.x-to.x)*from.dx < 0 && Math.abs(from.y-to.y) < to.height/2) {
            //     // points = [(to.x-from.dx*to.width-from.x)/2+from.x, from.y,
            //     // (to.x-from.dx*to.width-from.x)/2+from.x, to.y+(to.height/2)*(from.y>to.y?1:-1),
            //     // borderX, to.y+(to.height/2)*(from.y>to.y?1:-1)
            //     // ]
            // } else if ((from.x-to.x)*from.dx > 0 && Math.abs(from.y-to.y) < from.height/2) {
            // //     points = [
            // //     borderX, to.y+(to.height/2)*(from.y>to.y?-1:1),
            // //     (from.x-from.dx*from.width-to.x)/2+to.x, to.y+(to.height/2)*(from.y>to.y?-1:1),
            // //     (from.x-from.dx*from.width-to.x)/2+to.x, to.y,
            // //    ]
            // } else {
            //     points = [borderX, from.y, borderX, to.y];
            // }
        }
        if (from.dx === -to.dx && from.dx !== 0) {
            const middleX = (from.x+to.x) / 2;
            const middleY = (from.y+to.y) / 2;
            if (from.dx*(to.x-from.x) > 0) {
                points = [middleX, from.y, middleX, to.y];
            } else {
                points = [from.x, middleY, to.x, middleY];
            }
        }
        if (from.dy === to.dy && from.dy !== 0) {
            const borderY = from.dy > 0 ? Math.max(from.y, to.y) : Math.min(from.y, to.y);
            points = [from.x, borderY, to.x, borderY];
        }
        if (from.dy === -to.dy && from.dy !== 0) {
            const middleX = (from.x+to.x) / 2;
            const middleY = (from.y+to.y) / 2;
            if (from.dy*(to.y-from.y) > 0) {
                points = [from.x, middleY, to.x, middleY];
                // points = [middleX, from.y, middleX, to.y];
            } else {
                // points = [from.x, middleY, to.x, middleY];
                points = [middleX, from.y, middleX, to.y];
            }
        }

        if (from.dx*to.dy !== 0) {
            if ((to.x-from.x)*from.dx < 0 || (to.y-from.y)*to.dy > 0) {
                points = [from.x, to.y]
            } else {
                points = [to.x, from.y]
            }
        }
        if (from.dy*to.dx !== 0) {
            if ((to.y-from.y)*from.dy < 0 || (to.x-from.x)*to.x < 0) {
                points = [to.x, from.y]
            } else {
                points = [from.x, to.y]
            }
        }
        
        return points;
    }

    const findPathBetweenNodeAndPointer = (anchor, node) => {
        const anchorOffset = [
            [node.x + (node.width + 35)*node.scaleX / 2, node.y-40/canvasScale],
            [node.x-40/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
            [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 40/canvasScale],
            [node.x + (node.width + 35)*node.scaleX + 40/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
        ]

        const pointerOnCanvasPosition = pointer2CanvasPosition(pointerPosition);

        const [anchorX,anchorY] = anchorOffset[anchor];
        const dx = (anchor%2)*parseInt(2*(anchor/2-1));
        const dy = ((anchor+1)%2)*parseInt(2*(anchor/2-0.5));
        if (dx !== 0 && (pointerOnCanvasPosition[0]-anchorX)*dx > 0
        || (dx === 0) && (pointerOnCanvasPosition[1]-anchorY)*dy < 0) {
            return [anchorX, anchorY, pointerOnCanvasPosition[0], anchorY,
                pointerOnCanvasPosition[0], pointerOnCanvasPosition[1]];
        } else {
            return [anchorX, anchorY, anchorX, pointerOnCanvasPosition[1],
                pointerOnCanvasPosition[0], pointerOnCanvasPosition[1]];
        }
    }

    const findPathBetweenNodes = (fromAnchor, toAnchor, fromNode, toNode) => {
        const fromAnchorOffset = [
            [fromNode.x + (fromNode.width + 35)*fromNode.scaleX / 2, fromNode.y-40/canvasScale],
            [fromNode.x-40/canvasScale, fromNode.y + (fromNode.height + 70)*fromNode.scaleY / 2],
            [fromNode.x + (fromNode.width + 35)*fromNode.scaleX / 2, fromNode.y + (fromNode.height + 70)*fromNode.scaleY + 40/canvasScale],
            [fromNode.x + (fromNode.width + 35)*fromNode.scaleX + 40/canvasScale, fromNode.y + (fromNode.height + 70)*fromNode.scaleY / 2]
        ]
        const toAnchorOffset = [
            [toNode.x + (toNode.width + 35)*toNode.scaleX / 2, toNode.y-40/canvasScale],
            [toNode.x-40/canvasScale, toNode.y + (toNode.height + 70)*toNode.scaleY / 2],
            [toNode.x + (toNode.width + 35)*toNode.scaleX / 2, toNode.y + (toNode.height + 70)*toNode.scaleY + 40/canvasScale],
            [toNode.x + (toNode.width + 35)*toNode.scaleX + 40/canvasScale, toNode.y + (toNode.height + 70)*toNode.scaleY / 2]
        ]

        const from = {x: fromAnchorOffset[fromAnchor][0],
        y: fromAnchorOffset[fromAnchor][1],
        dx: (fromAnchor%2)*parseInt(2*(fromAnchor/2-1)),
        dy: ((fromAnchor+1)%2)*parseInt(2*(fromAnchor/2-0.5)),
        width: (fromNode.width + 35)*fromNode.scaleX + 40/canvasScale,
        height: (fromNode.height + 70)*fromNode.scaleY + 40/canvasScale}

        const to = {x: toAnchorOffset[toAnchor][0],
            y: toAnchorOffset[toAnchor][1],
            dx: (toAnchor%2)*parseInt(2*(toAnchor/2-1)),
            dy: ((toAnchor+1)%2)*parseInt(2*(toAnchor/2-0.5)),
            width: (toNode.width + 35)*toNode.scaleX + 40/canvasScale,
            height: (toNode.height + 70)*toNode.scaleY + 40/canvasScale}

        return [...fromAnchorOffset[fromAnchor],
        ...findPathBetweenVectors(from,to),
        ...toAnchorOffset[toAnchor]]
    }


    return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
    <Stage
    width={dimensions.width}
    height={dimensions.height}
    style={{ backgroundColor: "#F5F6FC" }}
    onWheel={handleStageWheel}
    onClick={UnselectAll}
    onMouseDown={handleStageMouseDown}
    onMouseUp={updatePromptCards}
    ref={stageRef}
    >
        <Layer
        x={canvasX}
        y={canvasY}
        scaleX={canvasScale}
        scaleY={canvasScale}
        ref={layerRef}
        >
            <Group>
            <CanvasContext.Provider value={{canvasX, canvasY, canvasScale}}>
            {
                nodes.map((node, index) => {
                    return node.display ?
                    node.type==="sticky_note"?
                    <StickyNote
                    key={node.id}
                    id={node.id}
                    x={node.x}
                    y={node.y}
                    scaleX={node.scaleX}
                    scaleY={node.scaleY}
                    width={node.width}
                    height={node.height}
                    fontSize={18}
                    color={"#748B97"}
                    isNull={node.text === ""}
                    text={node.text}
                    draggable={!isDrawingArrow && !isDrawingDoubleArrow}
                    isConnecting={isDrawingArrow || isDrawingDoubleArrow}
                    onScale={(newScale, newX, newY) => {
                        setNodes(prevState => {
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.scaleX = newScale;
                                    tmp.scaleY = newScale;
                                    tmp.x = newX;
                                    tmp.y = newY;
                                }
                                return tmp;
                            });
                        });
                    }}
                    onResize={(offsetW,offsetH, offsetX, offsetY) => {
                        setNodes(prevState => {
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.width += offsetW;
                                    tmp.height += offsetH;
                                    tmp.x += offsetX;
                                    tmp.y += offsetY;
                                }
                                return tmp;
                            });
                        });
                    }}
                    onConnectingHover={(e,anchor)=>{
                        if (arrowFrom.id !== -1) {
                            setArrowTo({id: node.id, anchor: anchor});
                        }
                    }}
                    onConnectingUnhover={(e)=>{
                        setArrowTo({id: -1, anchor: -1});
                    }}
                    onConnected={(e, anchor)=>{
                        e.cancelBubble = true;
                        if (e.evt.button===0 && e.evt.type==="mousedown") {
                            setArrowFrom({id: node.id, anchor: anchor});
                        } else if (e.evt.button===0 && e.evt.type==="mouseup") {
                            if (node.id !== arrowFrom.id && arrowFrom.id !== -1) {
                                if (isDrawingArrow) {
                                    setArrows(prevState=>{
                                        return [...prevState, {
                                            from_id: arrowFrom.id,
                                            from_anchor: arrowFrom.anchor,
                                            to_id: node.id,
                                            to_anchor: anchor
                                        }]
                                    });
                                }
                            }
 
                            setIsDrawingArrow(false);
                            setArrowFrom({id: -1, anchor: -1});
                            setArrowTo({id: -1, anchor: -1});
                        }
                    }}
                    onClick={(e)=>{
                        e.cancelBubble = true;
                        setNodes(
                        prevState => {
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.selected = true;
                                } else {
                                    tmp.selected = false;
                                }
                                return tmp;
                            });
                        });
                    }}
                    // onDragStart={(e)=>{e.cancelBubble=true}}
                    onDragMove={(e)=>{handleDragNodeMove(e,node.id)}}
                    onDragEnd={(e)=>{handleDragNodeEnd(e,node.id)}}
                    onTextChange={(value)=>setNodes(
                        prevState => {
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id)
                                    tmp.text = value;
                                return tmp;
                            });
                        })}
                    isSelected={node.selected}
                    onOverflow={(scrollHeight)=>{
                        setNodes(prevState =>{
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id)
                                    tmp.height = scrollHeight;
                                return tmp;
                            });
                        })
                    }}/> : null : null
                })
            }
            {arrows.map((arrow,index)=>{
                return (
                <Line
                key={index}
                points={[
                    ...calcAnchorPosition(arrow.from_anchor, nodes[arrow.from_id]),
                    ...findPathBetweenNodes(arrow.from_anchor, arrow.to_anchor,
                        nodes[arrow.from_id],nodes[arrow.to_id]),
                    // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                    // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                    ...calcAnchorPosition(arrow.to_anchor, nodes[arrow.to_id]),
                ]}
                tension={0}
                stroke={"gray"}
                strokeWidth={2/canvasScale}
                />)
            })}
            {
                arrowFrom.id!==-1 ? (
                arrowTo.id===-1 ?
                <Line
                points={[
                    ...calcAnchorPosition(arrowFrom.anchor,nodes[arrowFrom.id]),
                    ...findPathBetweenNodeAndPointer(arrowFrom.anchor,nodes[arrowFrom.id]),
                    ]}
                stroke={"gray"}
                listening={false}
                strokeWidth={2/canvasScale}
                /> :
                <Line
                points={[
                    ...calcAnchorPosition(arrowFrom.anchor,nodes[arrowFrom.id]),
                    ...findPathBetweenNodes(arrowFrom.anchor,arrowTo.anchor,
                        nodes[arrowFrom.id], nodes[arrowTo.id]),
                    ...calcAnchorPosition(arrowTo.anchor,nodes[arrowTo.id])
                    ]}
                stroke={"gray"}
                listening={false}
                strokeWidth={2/canvasScale}
                />)
                : null
            }
            </CanvasContext.Provider>
            </Group>
        </Layer>
        <Layer>
            <Group>
            <PrompterContext.Provider value={{promptCardsRef}}>
                {promptCards.map((prompt_card)=>{
                    return prompt_card.display ?
                    <Prompter
                    key={prompt_card.id}
                    id={prompt_card.id}
                    x={prompt_card.x}
                    y={prompt_card.y}
                    width={prompt_card.width}
                    height={prompt_card.height}
                    fontSize={15}
                    text={prompt_card.text}
                    onDragEnd={(e) => setPrompterPosition(e, prompt_card.id)}
                    /> : null
                })}
                <Prompter
                x={mainPrompter.x}
                y={mainPrompter.y}
                width={mainPrompter.width}
                height={mainPrompter.height}
                fontSize={18}
                text={mainPrompter.prompt}
                id={0}
                onHover={onMainPrompterHover}
                onUnhover={onMainPrompterUnhover}
                // onTextChange={(value)=>{setGlobalState("prompt",value);}}
                draggable={false}
                />
            </PrompterContext.Provider>
            </Group>
            <ToolBar
                x={mainPrompter.x+mainPrompter.width/2-250}
                y={mainPrompter.y-70}
                width={500}
                height={60}
                color={"white"}
                onHover={()=>setIsHoverToolBar(true)}
                onUnhover={()=>setIsHoverToolBar(false)}
                visible={toolBarVisibility}
                isArrowIconClicked={isDrawingArrow}
                onArrowIconClick={(e)=>{
                    e.cancelBubble = true;
                    if (!isDrawingArrow && isDrawingDoubleArrow)
                        setIsDrawingDoubleArrow(false);
                    setIsDrawingArrow(!isDrawingArrow);
                }}
                isDoubleArrowIconClicked={isDrawingDoubleArrow}
                onDoubleArrowIconClick={(e)=>{
                    e.cancelBubble = true;
                    if (!isDrawingDoubleArrow && isDrawingArrow)
                        setIsDrawingArrow(false);
                    setIsDrawingDoubleArrow(!isDrawingDoubleArrow);
                }}
                onAddStickyNote={(x, y, width, height)=>{
                    setNodes(prevState => {
                        let tmp = {id: numNodes, type: "sticky_note",
                        x: (x-canvasX)/canvasScale, y: (y-canvasY)/canvasScale,
                        width: width, height: height,
                        scaleX: 1/canvasScale, scaleY: 1/canvasScale,
                        selected: false, text: "", display: true};
                        return [...prevState, tmp];
                    });
                    setNumNodes(numNodes+1);
                }}
            />
        <Keyword
        x={500}
        y={500}
        width={100}
        height={50}
        fontSize={20}
        color={"#CED8DF"}
        id={100}
        text={"Keyword"}
        isNull={false}
        />
        </Layer>
    </Stage>
    </HotKeys>
    )
}