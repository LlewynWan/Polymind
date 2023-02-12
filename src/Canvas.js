import React, { useContext, useEffect } from "react";
import { HotKeys } from "react-hotkeys";
import { Stage, Layer, Group } from "react-konva";

import { StickyNote } from "./StickyNote";
import { Prompter } from "./Prompter";
import { ToolBar } from "./ToolBar";
import { Keyword } from "./Keyword"

import { GlobalContext } from "./state";
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


export function Canvas(props)
{
    const {nodes, numNodes, edges, promptCards, mainPrompter,
        setNodes, setNumNodes, setEdges, setPromptCards, setMainPrompter} = useContext(GlobalContext);

    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth
    });

    const [canvasX, setCanvasX] = React.useState(0);
    const [canvasY, setCanvasY] = React.useState(0);
    const [canvasScale, setCanvasScale] = React.useState(1);
    const stageRef = React.useRef(null);
    const layerRef = React.useRef(null);

    const [isDrawingArrow, setIsDrawingArrow] = React.useState(false);
    const [isDrawingDoubleArrow, setIsDrawingDoubleArrow] = React.useState(false);

    const [isHoverToolBar, setIsHoverToolBar] = React.useState(false);
    const [toolBarVisibility, setToolBarVisibility] = React.useState(true);

    useEffect(() => {
        if (!isHoverToolBar && stageRef) {
            stageRef.current.container().style.cursor =
            (isDrawingArrow || isDrawingDoubleArrow) ? "crosshair"
            : "default";
        } else {
            stageRef.current.container().style.cursor = "default";
        }
    }, [isDrawingArrow, isDrawingDoubleArrow, isHoverToolBar]);

    const UnselectAll = (e) => {
        setNodes(prevState => {
            return prevState.map((state)=>{
                let tmp = state;
                tmp.selected = false;
                return tmp;
            });
        });
    };
    
    const keyMap = {
        UNSELECT_ALL: "escape",
    };
    
    const handlers = {
        UNSELECT_ALL: UnselectAll
    };

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
        e.cancelBubble=true;
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

    return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
    <Stage
    width={dimensions.width}
    height={dimensions.height}
    style={{ backgroundColor: "#F5F6FC" }}
    onWheel={handleStageWheel}
    onClick={UnselectAll}
    onMouseDown={handleStageMouseDown}
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
                    canvasScale={canvasScale}
                    fontSize={18}
                    color={"#748B97"}
                    isNull={node.text === ""}
                    text={node.text}
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
            </Group>
        </Layer>
        <Layer>
            <Group>
                {promptCards.map((prompt_card, index)=>{
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
            </Group>
            <Prompter
                x={mainPrompter.x}
                y={mainPrompter.y}
                width={mainPrompter.width}
                height={mainPrompter.height}
                fontSize={18}
                text={mainPrompter.prompt}
                id={"MainPrompter"}
                onHover={onMainPrompterHover}
                onUnhover={onMainPrompterUnhover}
                // onTextChange={(value)=>{setGlobalState("prompt",value);}}
                draggable={false}
            />
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