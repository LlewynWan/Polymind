import React, { useContext } from "react";
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
    const {nodes, numNodes, promptCards, mainPrompter,
        setNodes, setNumNodes, setPromptCards, setMainPrompter} = useContext(GlobalContext);

    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth
    });

    const [canvasX, setCanvasX] = React.useState(0);
    const [canvasY, setCanvasY] = React.useState(0);
    const [canvasScale, setCanvasScale] = React.useState(1);
    const layerRef = React.useRef();

    const [toolBarVisibility, setToolBarVisibility] = React.useState(true);

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
    >
        <Layer
        x={canvasX}
        y={canvasY}
        scaleX={canvasScale}
        scaleY={canvasScale}
        ref={layerRef}>
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
                    width={node.width}
                    height={node.height}
                    fontSize={18}
                    color={"#748B97"}
                    isNull={node.text === ""}
                    text={node.text}
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
                    isSelected={node.selected}/> : null : null
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
                visible={toolBarVisibility}
                onAddStickyNote={(x, y, width, height)=>{
                    setNodes(prevState => {
                        let tmp = {id: numNodes, type: "sticky_note",
                        x, y, width: width, height: height,
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