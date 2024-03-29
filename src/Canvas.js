import React, { createRef, useContext, useEffect, useState } from "react";
import { HotKeys } from "react-hotkeys";

import { MyLine } from "./MyLine";
import { Stage, Layer, Group, Line, Rect, Text } from "react-konva";

import { ToolBar } from "./ToolBar";
import { Keyword } from "./Keyword"
import { Concept } from "./Concept";
import { Section } from "./Section";
import { TaskNode } from "./TaskNode";
import { StickyNote } from "./StickyNote";
import { TaskBoard } from "./TaskBoard";
import { Textbox } from "./Textbox"
import { promptGPT, regenerate } from "./utils/GPT_utils";

import { colorPalette } from "./utils/color_utils";
import { toLowerCase, outputMap } from "./utils/task_utils";
import { getTextWidth, sizeMap } from "./utils/size_utils";
import { anchor_utils, node_utils, section_utils } from "./utils/canvas_utils";
import { GlobalContext, CanvasContext } from "./state";



export function Canvas({dimensions})
{
    const {nodes, numNodes, arrows, sections,
        setNodes, setNumNodes, setArrows, setSections,
        promptCards, globalTextbox, taskPrompts, microTasks,
        setPromptCards, setGlobalTextbox, setTaskPrompts, setMicroTasks,
        taskNodes, setTaskNodes} = useContext(GlobalContext);

    const [canvasX, setCanvasX] = React.useState(0);
    const [canvasY, setCanvasY] = React.useState(0);
    const [canvasScale, setCanvasScale] = React.useState(1);
    const stageRef = React.useRef(null);
    const layerRef = React.useRef(null);

    var promptGPTThreads = new Set();
    // const [taskTracker, setTaskTracker] = useState({});

    const [selectionRect, setSeletionRect] = React.useState({
        visible: false,
        x1: 0, y1: 0,
        x2: 0, y2: 0
    });
    const selectionRectRef = React.useRef(null);

    const promptCardsRef = React.useRef([]);
    if (promptCardsRef.current.length !== promptCards.length+1) {
        promptCardsRef.current = Array(promptCards.length+1).fill()
        .map((_,i)=>promptCardsRef.current[i] || createRef());
    }

    const [isDrawingArrow, setIsDrawingArrow] = React.useState(false);
    const [isDrawingDoubleArrow, setIsDrawingDoubleArrow] = React.useState(false);
    const [isSectioning, setIsSectioning] = React.useState(false);
    const [isAddingKeyword, setIsAddingKeyword] = React.useState(false);
    const [arrowFrom, setArrowFrom] = React.useState({id: -1, anchor: -1});
    const [arrowTo, setArrowTo] = React.useState({id: -1, anchor: -1});
    // const [isMultiSelecting, setIsMultiSelecting] = React.useState(false);

    const [isTaskHeaderVisible, setIsTaskHeaderVisible] = React.useState(true);
    const [isHoverToolBar, setIsHoverToolBar] = React.useState(false);
    const [toolBarVisibility, setToolBarVisibility] = React.useState(true);

    const [promptPanelPosition, setPromptPanelPosition] = React.useState({});
    const [promptPanelVisibility, setPromptPanelVisibility] = React.useState(false);
    
    const [inFocus, setInFocus] = React.useState({
        "node": -1,
        "sticky_note": -1,
        "keyword": -1,
        "concept": -1,
        "section": -1
    });
    const [objectsCurtainClicked, setObjectsCurtainClicked] = React.useState(new Set());
    const [pointerPosition, setPointerPosition] = React.useState({x:-1, y:-1});

    const pointer2CanvasPosition = (position) => {
        const posX = (position.x - canvasX) / canvasScale;
        const posY = (position.y -  canvasY) / canvasScale;
        return [posX, posY];
    }

    const canvas2PointerPosition = (position) => {
        const posX = position.x * canvasScale + canvasX;
        const posY = position.y * canvasScale + canvasY;
        return [posX, posY];
    }

    const sampleFittsLawIDMin = (objects, type="node") => {
        var position = stageRef.current.getPointerPosition();
        if (!position) {
            return -1;
        }

        position = pointer2CanvasPosition(stageRef.current.getPointerPosition());
        var ID_inv = type === "node" ?
        objects.map(object=>1/node_utils.calcFittsLawID(object,position))
        : objects.map(object=>1/section_utils.calcSectionsFittsLawID(object,position));

        const sumIDInv = ID_inv.reduce((sum,id_inv)=>sum+id_inv,0);
        ID_inv = ID_inv.map(id_inv=>id_inv/sumIDInv);
        
        const split = Math.random();
        var tmpSum = 0.;
        var sample_idx = -1;
        for (var i = 0; i < ID_inv.length; i++) {
            tmpSum += ID_inv[i];
            if (tmpSum > split) {
                sample_idx = i;
                break;
            }
        }

        return sample_idx === -1 ? -1 : objects[sample_idx].id;
    };

    useEffect(()=>{
        if (isTaskHeaderVisible) {
            microTasks.forEach(task => {
                const object_type = toLowerCase(task.inputType);
                if (object_type !== "" && inFocus[object_type] !== -1) {
                    if (object_type!=="section") {
                        const node = nodes.filter(node=>node.id===inFocus[object_type])[0];
                        if (node.text!=="" && !node.disabledSet.has(task.id)
                        && !node.notificationSet.has(task.id))
                            handleMicroTask(task, object_type, node);
                    } else {
                        const section = sections.filter(section=>section.id===inFocus[object_type]);
                        if (section.length && !section[0].disabledSet.has(task.id)
                        && !section[0].notificationSet.has(task.id))
                            handleMicroTask(task, object_type, section[0])   
                    }   
                }
            });
        }
    }, [inFocus]);

    useEffect(() => {
        // clearInterval(pointerTracker);
        const pointerTracker = setInterval(() => {
            if (stageRef && stageRef.current) {
                const position = stageRef.current.getPointerPosition();
                if (position) {
                    setPointerPosition(position);
                }
            }
        }, 25);
        // setPointerTracker(_pointerTracker);
        // clearInterval(fittsLawTracker)
        function fittsLawIDCalculator() {
            setInFocus({
                "node": sampleFittsLawIDMin(nodes.filter(node=>node.display&&!node.isEditing)),
                "keyword": sampleFittsLawIDMin(nodes.filter(node=>node.display&&!node.isEditing&&node.type==="keyword")),
                "sticky_note": sampleFittsLawIDMin(nodes.filter(node=>node.display&&!node.isEditing&&node.type==="sticky_note")),
                "concept": sampleFittsLawIDMin(nodes.filter(node=>node.display&&!node.isEditing&&node.type==="concept")),
                "section": sampleFittsLawIDMin(sections.filter(section=>!section.isEditing), "section")
            });
        }
        const fittsLawTracker = setInterval(fittsLawIDCalculator, 5000);
        const trackerStarter = setTimeout(fittsLawIDCalculator, 200);
        // const fittsLawTracker = setInterval(function calcFittsLawID() {
        //     // const position = pointer2CanvasPosition(stageRef.current.getPointerPosition());
        //     // var ID_inv = nodes.map(node=>1/node_utils.calcFittsLawID(node,position));
        //     // const sumIDInv = ID_inv.reduce((sum,id_inv)=>sum+id_inv,0);
        //     // ID_inv = ID_inv.map(id_inv=>id_inv/sumIDInv);
            
        //     // const split = Math.random();
        //     // var tmpSum = 0.;
        //     // var sample_id = -1;
        //     // for (var i = 0; i < ID_inv.length; i++) {
        //     //     tmpSum += ID_inv[i];
        //     //     if (tmpSum > split) {
        //     //         sample_id = i;
        //     //         break;
        //     //     }
        //     // }

        //     // const unshuffled = nodes.filter(node=>node.display).map((node,index)=>index);
        //     // const shuffled = unshuffled.map(value => ({ value, sort: Math.random() }))
        //     // .sort((a, b) => a.sort - b.sort)
        //     // .map(({ value }) => value)

        //     setInFocus({
        //         "node": sampleFittsLawIDMin(nodes.filter(node=>node.display)),
        //         "keyword": sampleFittsLawIDMin(nodes.filter(node=>node.display && node.type==="keyword")),
        //         "sticky_note": sampleFittsLawIDMin(nodes.filter(node=>node.display && node.type==="sticky_note")),
        //         "concept": sampleFittsLawIDMin(nodes.filter(node=>node.display && node.type==="concept")),
        //         "section": sampleFittsLawIDMin(sections, "section")
        //     });

        //     // return trackFittsLaw;
        //     // setInFocus({node: ID_inv.indexOf(Math.min(...ID_inv))});
        //     // console.log(ID.indexOf(Math.min(...ID)));
        // }, 3500);

        setGlobalTextbox(prevState=>{
            let tmp = prevState;
            tmp.text = section_utils.calcSectionOutline(nodes.filter(node=>node.display), arrows);
            return tmp;
        })

        return () => {
            clearInterval(pointerTracker);
            clearInterval(fittsLawTracker);
            clearTimeout(trackerStarter);
        };
    }, [nodes, sections, arrows]);

    useEffect(()=>{
        if (!isHoverToolBar && stageRef) {
            stageRef.current.container().style.cursor =
            (isDrawingArrow || isDrawingDoubleArrow) ? "crosshair"
            : isAddingKeyword ? "text" : "default";
        } else {
            stageRef.current.container().style.cursor = "default";
        }

        if (!isDrawingArrow && !isDrawingDoubleArrow) {
            setArrowFrom({id: -1, anchor: -1});
            setArrowTo({id: -1, anchor: -1});
        }
    }, [dimensions,
        // nodes, sections,
        canvasScale, isHoverToolBar,
        isDrawingArrow, isDrawingDoubleArrow, isAddingKeyword]);


    const UnselectAllNodes = () => {
        setNodes(prevState => {

            return prevState.map((state)=>{
                let tmp = state;
                tmp.selected = false;
                return tmp;
            });
        });
    }
    const UnselectAll = e => {
        if (e) {
            e.preventDefault();
        }
        UnselectAllNodes();
        setSections(prevState => {
            return prevState.map((state)=>{
                let tmp = state;
                tmp.selected = false;
                return tmp;
            });
        });

        setIsDrawingArrow(false);
        setIsDrawingDoubleArrow(false);
        setIsAddingKeyword(false);
        setPromptPanelVisibility(false);
    };
    const DeleteSelected = e => {
        if (e) {
            e.preventDefault();
        }
        // console.log(nodes[0].selected);
        const newArrows = arrows.filter(arrow=>
            !arrow.selected
        && !nodes.filter(node=>node.id===arrow.from_id)[0].selected
        && !nodes.filter(node=>node.id===arrow.to_id)[0].selected);
        const newTaskNodes = taskNodes.filter(taskNode=>
            taskNode.attached_to_type !== "section" ?
            !nodes.filter(node=>node.id===taskNode.attached_to_id)[0].selected
            && (!nodes.filter(node=>node.id===taskNode.attached_from_id).length
            || !nodes.filter(node=>node.id===taskNode.attached_from_id)[0].selected)
            : !sections.filter(section=>section.id===taskNode.attached_to_id)[0].selected);
        
        // setArrows(prevState=>prevState.filter(arrow=>{
        //     return !nodes.filter(node=>node.id===arrow.from_id)[0].selected
        //     && !nodes.filter(node=>node.id===arrow.to_id)[0].selected;
        // }));
        // setTaskNodes(prevState => prevState.filter(state=>{
        //     console.log(nodes[0].selected)
        //     return !nodes.filter(node=>node.id===state.attached_to_id)[0].selected
        //     && (!nodes.filter(node=>node.id===state.attached_from_id).length
        //     || !nodes.filter(node=>node.id===state.attached_from_id)[0].selected)
        // }));
        setNodes(prevState => {
            return prevState.map((state)=>{
                let tmp = state;
                tmp.display = (tmp.display & !tmp.selected);
                tmp.selected = false;
                return tmp;
            })
        });
        setSections(prevState=>prevState.filter(state=>!state.selected));
        setTaskNodes(newTaskNodes);
        setArrows(newArrows);
    }

    const handleMicroTask = (task, object_type, object, callback=null) => {
        // setTimeout(()=>{
            // setTaskNodes(prevState=>{
            //     return [
            //         ...prevState,
            //         {node_id: prevState.lenth,
            //             task_id: 0, attached_to_id: 0, type: "keyword"}
            //     ]
            // })
            // console.log(task, object_type, object)
        //     console.log(object_type)
        // console.log(taskNodes.filter(node=>node.task_id===task.id
        //     &&node.attached_to_type===object_type&&node.attached_to_id===object.id).length)
        if (object.disabledSet.has(task.id) ||
        (!objectsCurtainClicked.has(object.id.toString()+task.id.toString()+object_type)
        // && !object.notificationSet.has(task.id)
        && !promptGPTThreads.has(object.id.toString()+task.id.toString()+object_type)
        && ((!task.display && !object.displaySet.has(task.id)) ||
            !taskNodes.filter(node=>node.task_id===task.id
            &&node.attached_to_type===object_type&&node.attached_to_id===object.id).length)))
        {
            promptGPTThreads.add(object.id.toString()+task.id.toString()+object_type)
            if (object_type!=="section") {
                var attached_from_id = -1;
                var prompt = task.examplePrompt.replace("[placeholder]",object.text);
                if (object_type==="node") {
                    const unshuffled = nodes.filter(node=>node.display&&node.id!==object.id&&node.text!=="").map(node=>node.id);
                    if (!unshuffled.length) {
                        if (callback) {
                            callback();
                        }
                        promptGPTThreads.delete(object.id.toString()+task.id.toString()+object_type);
                        return;
                    }
                    const shuffled = unshuffled.map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                    // if (!shuffled.length) {
                    //     return;
                    // }
                    attached_from_id = shuffled[0];
                    prompt = prompt.replace("[placeholder]", nodes.filter(node=>node.id===shuffled[0])[0].text);
                }
                const [num_items, max_word_per_item] = outputMap[task.outputType];
                // let results = await promptGPT(prompt, num_items, max_word_per_item);
                // const results = object_type === "keyword" ?
                // (await promptGPT(prompt, 3, 3)) : null;
                let handleResponse = (results) => {
                    // console.log(results.length, num_items, results)
                    if (results.length === num_items) {
                        // results = results.slice(0,num_items);
                        setNodes(prevState=>prevState.map(state=>{
                            let tmp = state;
                            if (tmp.id === object.id) {
                                tmp.callbackTaskId = task.id;
                            }
                            return tmp;
                        }));
                        setTaskNodes(prevState=>{
                            // const sameState = prevState.filter(state=>
                            //     state.node_id===object_id&&state.task_id===task_id
                            //     && !state.display)
                                    // && !microTasks.filter(task=>task.id===state.task_id)[0].display));
                            return [...prevState.filter(state=>
                                state.attached_to_type !== object_type || state.display ||
                                state.attached_to_id!==object.id || state.task_id!==task.id),
                                //  || microTasks.filter(task=>task.id===state.task_id)[0].display),
                            ...results.map((result,index)=>{
                                return {id: prevState.length === 0 ? index :
                                Math.max(...prevState.map(state=>state.id))+1+index,
                            ...sizeMap[toLowerCase(task.outputType)],
                            scaleX: object.scaleX, scaleY: object.scaleY, attached_from_id: attached_from_id,
                            attached_to_type: object_type, task_id: task.id,
                            attached_to_id: object.id, type: toLowerCase(task.outputType),
                            x: object.x+(150+Math.random()*120)/canvasScale+object.scaleX*
                                (object.type==="concept"?object.radiusX*2:object.width),
                            y: object.type==="concept"?
                                object.y+object.scaleY*object.radiusY+(200*index-200)/canvasScale+
                                Math.ceil(Math.random()*99) * (Math.round(Math.random())?1:-1)
                                : object.y+(125*index-125+Math.random()*120)/canvasScale+object.scaleY*object.height,
                            fontSize: (task.outputType==="Sticky Note"?16:20), text: result, display: false,
                            prompt: prompt
                            }})]
                        });
                    }
                    if (callback) {
                        callback();
                    }
                    promptGPTThreads.delete(object.id.toString()+task.id.toString()+object_type);
                }
                promptGPT(prompt, num_items, max_word_per_item, handleResponse);
            } else if (object_type==="section") {
                const outline = object.text+"\n"+section_utils.calcSectionOutline(nodes.filter(node=>
                    node.x>object.x && node.x<object.x+object.width*object.scaleX
                    && node.y>object.y && node.y<object.y+object.height*object.scaleY),arrows);
                // console.log(outline)
                const prompt = task.examplePrompt.replace("[placeholder]",outline);
                const [num_items, max_word_per_item] = outputMap[task.outputType];

                let handleResponse = (results) => {
                    // console.log(results.length, num_items, results)
                    if (results.length == num_items) {
                        // results = results.slice(0,num_items);
                        setSections(prevState=>prevState.map(state=>{
                            let tmp = state;
                            if (tmp.id === object.id) {
                                tmp.callbackTaskId = task.id;
                            }
                            return tmp;
                        }));
                        setTaskNodes(prevState=>{
                            return [...prevState.filter(state=>
                                state.attached_to_type !== "section" || state.display
                                || state.attached_to_id!==object.id || state.task_id!==task.id),
                            {id: prevState.length === 0 ? 0 :
                                Math.max(...prevState.map(state=>state.id))+1,
                            ...sizeMap[toLowerCase(task.outputType)],
                            scaleX: 1/canvasScale, scaleY: 1/canvasScale,
                            attached_to_type: object_type, task_id: task.id,
                            attached_to_id: object.id, type: toLowerCase(task.outputType),
                            x: object.x+75*canvasScale+Math.random()*100+object.scaleX*object.width/2,
                            y: object.y-150*canvasScale-Math.random()*120,
                            fontSize: (task.outputType==="Sticky Note"?16:20), text: results[0], display: false,
                            prompt: prompt
                            }]
                        });
                    }
                    if (callback) {
                        callback();
                    }
                    promptGPTThreads.delete(object.id.toString()+task.id.toString()+object_type);
                }
                promptGPT(prompt, num_items, max_word_per_item, handleResponse);
            }
        }
        // }, 5000);
    }
    const handleHeaderTaskClick = (e, task_id, object_type, object_id, requesting=false, callback=null) => {
        e.cancelBubble = true;
        const toggleSet = (task_id, set) => {
            if (set.has(task_id)) {
                set.delete(task_id);
            } else {
                set.add(task_id);
            }
            return set;
        };

        const object = object_type === "section" ? getSectionById(object_id) : getNodeById(object_id);
        const microTask = microTasks.filter(task=>task.id===task_id)[0];
        
        if (object_type !== "section") {
            setNodes(prevState => prevState.map(state => {
                let tmp = state;
                if (tmp.id === object_id) {
                    if (e.evt.ctrlKey) {
                        // if (!tmp.disabledSet.has(task_id)) {
                        //     tmp.displaySet.delete(task_id);
                        // }
                        tmp.displaySet.delete(task_id);
                        tmp.disabledSet = toggleSet(task_id, tmp.disabledSet);
                    } else {
                        tmp.displaySet = toggleSet(task_id, tmp.displaySet);
                    }
                }
                return tmp;
            }))
        } else if (object_type === "section") {
            setSections(prevState => prevState.map(state => {
                let tmp = state;
                if (tmp.id === object_id) {
                    if (e.evt.ctrlKey) {
                        // if (!tmp.disabledSet.has(task_id)) {
                        //     tmp.displaySet.delete(task_id);
                        // }
                        tmp.displaySet.delete(task_id);
                        tmp.disabledSet = toggleSet(task_id, tmp.disabledSet)
                    } else {
                        tmp.displaySet = toggleSet(task_id, tmp.displaySet);
                    }
                }
                return tmp;
            }))
        }

        if (requesting) {
            handleMicroTask(microTask, toLowerCase(microTask.inputType),object,callback);
        }
        if ((!e.evt.ctrlKey &&
            object.disabledSet.has(task_id) && !object.displaySet.has(task_id))
            || (e.evt.ctrlKey
            && object.disabledSet.has(task_id))) {
            setTaskNodes(prevState=>prevState.filter(state=> {
                return state.task_id!==task_id
                || state.attached_to_id!==object_id}
            ));
        }
        // console.log(nodes[0].disabledSet, nodes[1].disabledSet)
    }

    const [promptCardIndex, setPromptCardIndex] = React.useState(1);

    const keyMap = {
        UNSELECT_ALL: "escape",
        DELETE: "del"
    };
    
    const handlers = {
        UNSELECT_ALL: UnselectAll,
        DELETE: DeleteSelected
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

    const handleStageClick = e => {
        if (isAddingKeyword) {
            const position = pointer2CanvasPosition(pointerPosition);
            setNodes(prevState=>{
                let tmp = {id: numNodes, type: "keyword",
                x: position[0], y: position[1],
                width: 0, height: 0, fontSize: 20,
                scaleX: 1/canvasScale, scaleY: 1/canvasScale,
                selected: true, text: "", display: true,
                isEditing: false,
                disabledSet: new Set(
                    microTasks.filter(task=>!task.active).map(task=>task.id)
                ),
                displaySet: new Set(),
                notificationSet: new Set(),
                callbackTaskId: -1};
                return [...prevState, tmp];
            });
            setNumNodes(numNodes+1);
            setIsAddingKeyword(false);
        } else {
            UnselectAll();
        }
    }

    const handleStageMouseDown = e => {
        // e.cancelBubble = true;
        // if (!isDrawingArrow && !isDrawingDoubleArrow) {
        //     setIsMultiSelecting(true);
        // }
        if (isSectioning) {
            setSeletionRect({
                visible: true,
                x1: pointerPosition.x,
                x2: pointerPosition.x,
                y1: pointerPosition.y,
                y2: pointerPosition.y
            });
            // updateSelectionRect();
        }
    }
    const handleStageMouseMove = e => {
        if (isSectioning) {
            setSeletionRect(rect=>{
                return {
                visible: rect.visible,
                x1: rect.x1,
                y1: rect.y1,
                x2: pointerPosition.x,
                y2: pointerPosition.y
                }
            })
        }
    }
    const handleStageMouseUp = e => {
        if (selectionRect.x1 === selectionRect.x2
            || selectionRect.y1 === selectionRect.y2) {
                setSeletionRect({
                    visible: false,
                    x1: 0, y1: 0,
                    x2: 0, y2: 0
                })
                setIsSectioning(false);
                return;
            }
        if (isSectioning) {
            setSections(prevState=>{
                const position1 = pointer2CanvasPosition({
                    x: selectionRect.x1, y: selectionRect.y1
                })
                const position2 = pointer2CanvasPosition({
                    x: selectionRect.x2, y: selectionRect.y2
                })
                return [
                    ...prevState,
                    {id: prevState.length, selected: false,
                    callbackTaskId: -1,
                    disabledSet: new Set(
                        microTasks.filter(task=>!task.active).map(task=>task.id)
                    ),
                    displaySet: new Set(),
                    notificationSet: new Set(),
                    scaleX: 1, scaleY: 1,
                    x: Math.min(position1[0], position2[0]),
                    y: Math.min(position1[1], position2[1]),
                    width: Math.abs(position1[0]-position2[0]),
                    height: Math.abs(position1[1]-position2[1]),
                    text: "section "+(sections.length+1).toString()}
                ];
            });
            setSeletionRect({
                visible: false,
                x1: 0, y1: 0,
                x2: 0, y2: 0
            })
            setIsSectioning(false);
        }
    }

    // const promptPanelPopup = () => {
    //     setPromptPanelVisibility(true);
    //     setPromptPanelPosition(pointerPosition);
    // }

    // const setPrompterPosition = (e, id) => {
    //     setPromptCards(prevState => {
    //         return prevState.map((state) => {
    //             if (state.id === id) {
    //                 let tmp = state;
    //                 tmp.x = e.target.x();
    //                 tmp.y = e.target.y();
    //                 return tmp;
    //             } else {
    //                 return state;
    //             }
    //         })
    //     });
    // }

    const getSectionById = (id) => {
        return sections.filter(section=>section.id===id)[0];
    }

    const getNodeById = (id) => {
        return nodes.filter(node=>node.id===id)[0];
    }
    const onNodeSelect = (e,id) => {
        e.cancelBubble = true;
        setNodes(
        prevState => {
            return prevState.map(state => {
                let tmp = state;
                if (tmp.id === id) {
                    tmp.selected = true;
                } else {
                    tmp.selected = false;
                }
                return tmp;
            });
        });
    }
    const onNodeEdit = (id,value) => {
        setNodes(
        prevState => {
            return prevState.map(state => {
                let tmp = state;
                if (tmp.id === id) {
                    tmp.isEditing = value;
                } else {
                    tmp.isEditing = false;
                }
                return tmp;
            });
        });
    }
    const onNodeTextChange = (value,id) => {
        setNodes(
            prevState => {
                return prevState.map(state => {
                    let tmp = state;
                    if (tmp.id === id)
                        tmp.text = value;
                    return tmp;
                });
        })
    }
    const onNodeScale = (id, newScale, newX, newY) => {
        setNodes(prevState => {
            return prevState.map(state => {
                let tmp = state;
                if (tmp.id === id) {
                    tmp.scaleX = newScale;
                    tmp.scaleY = newScale;
                    tmp.x = newX;
                    tmp.y = newY;
                }
                return tmp;
            });
        });
    }

    const handleHeaderCurtainClick = (object_id, object_type, task_id) => {
        setTaskNodes(prevState=>prevState.map(state=>{
            let tmp = state;
            if (tmp.attached_to_id === object_id && tmp.task_id === task_id) {
                tmp.display = true;
            }
            return tmp;
        }));
        objectsCurtainClicked.add
            (object_id.toString()+task_id.toString()+object_type);
        setObjectsCurtainClicked(objectsCurtainClicked);
    }
    const resetHeaderCurtain = (object_id, object_type, task_id) => {
        setTaskNodes(prevState=>prevState.map(state=>{
            let tmp = state;
            if (tmp.attached_to_id === object_id && tmp.task_id === task_id) {
                tmp.display = false;
            }
            return tmp;
        }));
        objectsCurtainClicked.delete
            (object_id.toString()+task_id.toString()+object_type);
        setObjectsCurtainClicked(objectsCurtainClicked);
    }
    const resetNodeCallbackTaskId = (id) => {
        setNodes(prevState => prevState.map(state=>{
            let tmp = state;
            if (tmp.id === id) {
                tmp.callbackTaskId = -1;
            }
            return tmp;
        }));
    }
    const expandAll = (id, type) => {
        if (type === "section") {
            setSections(prevState=>prevState.map(state=>{
                let tmp = state;
                if (tmp.id === id) {
                    microTasks.forEach(task=>{
                        if (tmp.notificationSet.has(task.id)) {
                            tmp.displaySet.add(task.id)
                            tmp.notificationSet.delete(task.id);
                        }
                    })
                }
                return tmp;
            }))
        } else {
            setNodes(prevState=>prevState.map(state=>{
                let tmp = state;
                if (tmp.id === id) {
                    microTasks.forEach(task=>{
                        if (tmp.notificationSet.has(task.id)) {
                            tmp.displaySet.add(task.id)
                            tmp.notificationSet.delete(task.id);
                        }
                    })
                }
                return tmp;
            }))
        }
    }
    const closeAll = (id, type) => {
        if (type === "section") {
            setSections(prevState=>prevState.map(state=>{
                let tmp = state;
                if (tmp.id === id) {
                    microTasks.forEach(task=>{
                        if (!tmp.disabledSet.has(task.id)) {
                            tmp.displaySet.delete(task.id)
                        }
                    })
                }
                return tmp;
            }))
        } else {
            setNodes(prevState=>prevState.map(state=>{
                let tmp = state;
                if (tmp.id === id) {
                    microTasks.forEach(task=>{
                        if (!tmp.disabledSet.has(task.id)) {
                            tmp.displaySet.delete(task.id)
                        }
                    })
                }
                return tmp;
            }))
        }
    }

    const onNodeConnected = (e, id, anchor)=>{
        e.cancelBubble = true;
        if (e.evt.button===0 && e.evt.type==="mousedown") {
            setArrowFrom({id: id, anchor: anchor});
        } else if (e.evt.button===0 && e.evt.type==="mouseup") {
            if (id !== arrowFrom.id && arrowFrom.id !== -1) {
                if (isDrawingArrow || isDrawingDoubleArrow) {
                    setArrows(prevState=>{
                        return [...prevState, {
                            id: prevState.length===0 ? 0 : 
                            Math.max(...prevState.map(state=>state.id))+1,
                            from_id: arrowFrom.id,
                            from_anchor: arrowFrom.anchor,
                            to_id: id,
                            to_anchor: anchor,
                            directed: isDrawingArrow,
                            selected: false
                        }]
                    });
                }
            }

            setIsDrawingArrow(false);
            setIsDrawingDoubleArrow(false);
            setArrowFrom({id: -1, anchor: -1});
            setArrowTo({id: -1, anchor: -1});
            // promptPanelPopup();
        }
    }

    const onMainTextboxHover = node => {
        setToolBarVisibility(false);
        node.to({
            scaleX: 1.2,
            scaleY: 1.2,
            x: globalTextbox.x - globalTextbox.width*0.1,
            y: globalTextbox.y - globalTextbox.height - 66,
            shadowBlur: 0,
            shadowOpacity: 0
        })
    }

    const onMainTextboxUnhover = node => {
        setToolBarVisibility(true);
        node.to({
            scaleX: 1,
            scaleY: 1,
            x: globalTextbox.x,
            y: globalTextbox.y,
            shadowBlur: 5,
            shadowOpacity: 0.25
        })
    }

    const findPathBetweenNodeAndPointer = (anchor, node) => {
        const anchorOffset = anchor_utils.calcAnchorOffsetPositions(node,canvasScale);

        const pointerOnCanvasPosition = pointer2CanvasPosition(pointerPosition);

        const [anchorX,anchorY] = anchorOffset[anchor];
        const dx = (anchor%2)*parseInt(2*(anchor/2-1));
        const dy = ((anchor+1)%2)*parseInt(2*(anchor/2-0.5));
        if ((dx !== 0 && (pointerOnCanvasPosition[0]-anchorX)*dx > 0)
        || ((dx === 0) && (pointerOnCanvasPosition[1]-anchorY)*dy < 0)) {
            return [anchorX, anchorY, pointerOnCanvasPosition[0], anchorY,
                pointerOnCanvasPosition[0], pointerOnCanvasPosition[1]];
        } else {
            return [anchorX, anchorY, anchorX, pointerOnCanvasPosition[1],
                pointerOnCanvasPosition[0], pointerOnCanvasPosition[1]];
        }
    }


    return (
    <HotKeys keyMap={keyMap} handlers={handlers} allowChanges={true}>
    <Stage
    width={dimensions.width}
    height={dimensions.height}
    style={{ backgroundColor: "#F5F6FC" }}
    onWheel={handleStageWheel}
    onClick={handleStageClick}
    onMouseDown={handleStageMouseDown}
    onMouseMove={handleStageMouseMove}
    onMouseUp={handleStageMouseUp}
    // onDblClick={toggleFollowerMode}
    ref={stageRef}>
        <Layer
        x={canvasX}
        y={canvasY}
        scaleX={canvasScale}
        scaleY={canvasScale}
        ref={layerRef}
        opacity={promptPanelVisibility ? 0.5 : 1}
        >
            <Group>
            <CanvasContext.Provider value={{canvasX, canvasY, canvasScale, microTasks, taskNodes}}>
            {arrows.map((arrow,index)=>{
                const arrow_size = 10 / canvasScale;
                const arrow_dy = arrow.to_anchor===0 ? 1 : arrow.to_anchor===2 ? -1 : 0;
                const arrow_dx = arrow.to_anchor===1 ? 1 : arrow.to_anchor===3 ? -1 : 0;
                const finalAnchor = anchor_utils.calcAnchorPosition(
                    arrow.to_anchor, getNodeById(arrow.to_id), canvasScale);
                return (
                <Group
                key={index}>
                <MyLine
                points={[
                    ...anchor_utils.calcAnchorPosition(
                        arrow.from_anchor, getNodeById(arrow.from_id), canvasScale),
                    ...anchor_utils.findPathBetweenNodes(arrow.from_anchor, arrow.to_anchor,
                        getNodeById(arrow.from_id),getNodeById(arrow.to_id), canvasScale),
                    // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                    // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                    ...finalAnchor
                ]}
                tension={0}
                stroke={arrow.selected?"#A9A9A9":"silver"}
                strokeWidth={arrow.selected?4/canvasScale:2/canvasScale}
                isSelected={arrow.selected}
                onClick={()=>setArrows(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (tmp.id === arrow.id) {
                        tmp.selected = !tmp.selected;
                    }
                    return tmp;
                }))}
                listening={!isAddingKeyword&&!isSectioning}
                />
                {/* <Line
                points={[...finalAnchor,
                finalAnchor[0]+arrow_dx*5, finalAnchor[1]+arrow_dy*5]}
                tension={0}
                stroke={"gray"}
                strokeWidth={2/canvasScale}
                /> */}
                {arrow.directed ? <Group>
                <Line
                points={[finalAnchor[0]-arrow_dx*arrow_size+arrow_dy*arrow_size,
                    finalAnchor[1]-arrow_dy*arrow_size+arrow_dx*arrow_size,
                    ...finalAnchor]}
                    // finalAnchor[0]+arrow_dx*10, finalAnchor[1]+arrow_dy*10]}
                tension={0}
                stroke={arrow.selected?"#A9A9A9":"silver"}
                strokeWidth={arrow.selected?3/canvasScale:2/canvasScale}
                perfectDrawEnabled={false}/>
                <Line
                points={[finalAnchor[0]-arrow_dx*arrow_size-arrow_dy*arrow_size,
                    finalAnchor[1]-arrow_dy*arrow_size-arrow_dx*arrow_size,
                    ...finalAnchor]}
                    // finalAnchor[0]+arrow_dx*10, finalAnchor[1]+arrow_dy*10]}
                tension={0}
                stroke={arrow.selected?"#A9A9A9":"silver"}
                strokeWidth={arrow.selected?3/canvasScale:2/canvasScale}
                perfectDrawEnabled={false}/>
                </Group>: null}
                </Group>
                )
            })}
            {
                arrowFrom.id!==-1 ? (
                arrowTo.id===-1 ?
                <MyLine
                points={[
                    ...anchor_utils.calcAnchorPosition(arrowFrom.anchor,getNodeById(arrowFrom.id), canvasScale),
                    ...findPathBetweenNodeAndPointer(arrowFrom.anchor,getNodeById(arrowFrom.id)),
                    ]}
                stroke={"silver"}
                listening={false}
                strokeWidth={2/canvasScale}
                /> :
                <MyLine
                points={[
                    ...anchor_utils.calcAnchorPosition(arrowFrom.anchor,getNodeById(arrowFrom.id),canvasScale),
                    ...anchor_utils.findPathBetweenNodes(arrowFrom.anchor,arrowTo.anchor,
                        getNodeById(arrowFrom.id), getNodeById(arrowTo.id), canvasScale),
                    ...anchor_utils.calcAnchorPosition(arrowTo.anchor,getNodeById(arrowTo.id),canvasScale)
                    ]}
                stroke={"silver"}
                listening={false}
                strokeWidth={2/canvasScale}
                />)
                : null
            }
            {sections.map(section=>{
                return (<Section
                key={section.id}
                id={section.id}
                x={section.x}
                y={section.y}
                isSelected={section.selected}
                isEditing={section.isEditing}
                setIsEditing={(value)=>{
                    setSections(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (state.id === section.id) {
                            tmp.isEditing = value;
                        } else {
                            tmp.isEditing = false;
                        }
                        return tmp;
                    }))
                }}
                scaleX={section.scaleX}
                scaleY={section.scaleY}
                width={section.width}
                height={section.height}
                text={section.text}
                fontSize={18}
                color={"#0099FF"}
                header={isTaskHeaderVisible}
                headerListening={!isDrawingArrow &&
                    !isDrawingDoubleArrow&&!isSectioning&&!isAddingKeyword}
                onScale={(scaleX,scaleY,x,y)=>{
                    setSections(prevState => prevState.map(state => {
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.x = x;
                            tmp.y = y;
                            tmp.scaleX = scaleX;
                            tmp.scaleY = scaleY;
                        }
                        return tmp;
                    }))
                }}
                onTextChange={(text)=>{
                    setSections(prevState => prevState.map(state => {
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.text = text;
                        }
                        return tmp;
                    }))
                }}
                onClick={(e)=>{
                    e.cancelBubble = true;
                    setSections(prevState => prevState.map(state => {
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.selected = true;
                        } else {
                            tmp.selected = false;
                        }
                        return tmp;
                    }));
                }}
                handleDragMove={(e)=>{
                    setSections(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.x = e.target.x();
                            tmp.y = e.target.y();
                        }
                        return tmp;
                    }))
                }}
                handleDragEnd={(e)=>{
                    setSections(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.x = e.target.x();
                            tmp.y = e.target.y();
                        }
                        return tmp;
                    }))
                }}
                expandAll={()=>expandAll(section.id, "section")}
                closeAll={()=>closeAll(section.id, "section")}
                onHeaderTaskClick={(e,task_id,requesting,callback)=>
                    handleHeaderTaskClick(e,task_id,"section",section.id,requesting,callback)}
                onHeaderCurtainClick={(task_id)=>handleHeaderCurtainClick(section.id, "section", task_id)}
                resetHeaderCurtain={(task_id)=>resetHeaderCurtain(section.id, "section", task_id)}
                callbackTaskId={section.callbackTaskId}
                resetCallbackTaskId={()=>setSections(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (tmp.id === section.id) {
                        tmp.callbackTaskId = -1;
                    }
                    return tmp;
                }))}
                disabledSet={section.disabledSet}
                displaySet={section.displaySet}
                notificationSet={section.notificationSet}
                setNotificationSet={(toggleSet)=>{
                    setSections(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === section.id) {
                            tmp.notificationSet = toggleSet(tmp.notificationSet);
                        }
                        return tmp;
                    }))
                }}
                listening={!isAddingKeyword&&!isSectioning}
                />)
            })}
            {nodes.map((node, index) => {
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
                fontSize={node.fontSize}
                color={"#748B97"}
                isNull={node.text === ""}
                text={node.text}
                draggable={!isDrawingArrow && !isDrawingDoubleArrow}
                isConnecting={isDrawingArrow || isDrawingDoubleArrow}
                onScale={(newScale, newX, newY)=>onNodeScale(node.id, newScale, newX, newY)}
                onResize={(offsetW, offsetH, offsetX, offsetY) => {
                    if (node.height + offsetH >= 14
                        && node.width + offsetW >= 105) {
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
                        }
                }}
                onConnectingHover={(e,anchor)=>{
                    if (arrowFrom.id !== -1) {
                        setArrowTo({id: node.id, anchor: anchor});
                    }
                }}
                onConnectingUnhover={(e)=>{
                    setArrowTo({id: -1, anchor: -1});
                }}
                onConnected={(e,anchor)=>onNodeConnected(e,node.id,anchor)}
                onClick={(e)=>onNodeSelect(e,node.id)}
                // onDragStart={(e)=>{e.cancelBubble=true}}
                onDragMove={(e)=>{handleDragNodeMove(e,node.id)}}
                onDragEnd={(e)=>{handleDragNodeEnd(e,node.id)}}
                onTextChange={(value)=>onNodeTextChange(value,node.id)}
                isSelected={node.selected}
                isEditing={node.isEditing}
                setIsEditing={(value)=>onNodeEdit(node.id, value)}
                headerListening={!isDrawingArrow &&
                    !isDrawingDoubleArrow&&!isSectioning&&!isAddingKeyword}
                onOverflow={(scrollHeight)=>{
                    setNodes(prevState =>{
                        return prevState.map(state => {
                            let tmp = state;
                            if (tmp.id === node.id)
                                tmp.height = scrollHeight;
                            return tmp;
                        });
                    })
                }}
                disabledSet={node.disabledSet}
                displaySet={node.displaySet}
                notificationSet={node.notificationSet}
                setNotificationSet={(toggleSet)=>{
                    setNodes(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === node.id) {
                            tmp.notificationSet = toggleSet(tmp.notificationSet);
                        }
                        return tmp;
                    }))
                }}
                expandAll={()=>expandAll(node.id, "sticky_note")}
                closeAll={()=>closeAll(node.id, "sticky_note")}
                onHeaderTaskClick={(e,task_id,requesting,callback)=>
                    handleHeaderTaskClick(e,task_id,"sticky_note",node.id,requesting,callback)}
                onHeaderCurtainClick={(task_id)=>handleHeaderCurtainClick(node.id, "sticky_note", task_id)}
                resetHeaderCurtain={(task_id)=>resetHeaderCurtain(node.id, "sticky_note", task_id)}
                callbackTaskId={node.callbackTaskId}
                resetNodeCallbackTaskId={()=>resetNodeCallbackTaskId(node.id)}
                header={isTaskHeaderVisible}
                listening={!isAddingKeyword&&!isSectioning}/> :
                node.type === "keyword" ?
                <Keyword
                key={node.id}
                id={node.id}
                x={node.x}
                y={node.y}
                scaleX={node.scaleX}
                scaleY={node.scaleY}
                fontSize={node.fontSize}
                color={"#CED8DF"}
                text={node.text}
                padding={10}
                isNull={node.text===""}
                isSelected={node.selected}
                isEditing={node.isEditing}
                setIsEditing={(value)=>onNodeEdit(node.id, value)}
                isConnecting={isDrawingArrow || isDrawingDoubleArrow}
                onClick={(e)=>onNodeSelect(e,node.id)}
                onDragMove={(e)=>{handleDragNodeMove(e,node.id)}}
                onDragEnd={(e)=>{handleDragNodeEnd(e,node.id)}}
                onTextChange={(value)=>onNodeTextChange(value,node.id)}
                onTextSizeChange={(rect)=>{
                    if (rect.width && rect.height &&
                    (node.width !== rect.width || node.height !== rect.height)) {
                        setNodes(prevState=>{
                            return prevState.map(state=>{
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.width = rect.width;
                                    tmp.height = rect.height;
                                }
                                return tmp;
                            });
                        })
                    }
                }}
                onScale={(newScale, newX, newY)=>onNodeScale(node.id, newScale, newX, newY)}
                onConnectingHover={(e,anchor)=>{
                    if (arrowFrom.id !== -1) {
                        setArrowTo({id: node.id, anchor: anchor});
                    }
                }}
                onConnectingUnhover={(e)=>{
                    setArrowTo({id: -1, anchor: -1});
                }}
                onConnected={(e,anchor)=>onNodeConnected(e,node.id,anchor)}
                headerListening={!isDrawingArrow &&
                    !isDrawingDoubleArrow&&!isSectioning&&!isAddingKeyword}
                disabledSet={node.disabledSet}
                displaySet={node.displaySet}
                notificationSet={node.notificationSet}
                setNotificationSet={(toggleSet)=>{
                    setNodes(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === node.id) {
                            tmp.notificationSet = toggleSet(tmp.notificationSet);
                        }
                        return tmp;
                    }))
                }}
                expandAll={()=>expandAll(node.id, "keyword")}
                closeAll={()=>closeAll(node.id, "keyword")}
                onHeaderTaskClick={(e,task_id,requesting,callback)=>
                    handleHeaderTaskClick(e,task_id,"keyword",node.id,requesting,callback)}
                onHeaderCurtainClick={(task_id)=>handleHeaderCurtainClick(node.id, "keyword", task_id)}
                resetHeaderCurtain={(task_id)=>resetHeaderCurtain(node.id, "keyword", task_id)}
                callbackTaskId={node.callbackTaskId}
                resetNodeCallbackTaskId={()=>resetNodeCallbackTaskId(node.id)}
                header={isTaskHeaderVisible}
                listening={!isAddingKeyword&&!isSectioning}/> :
                node.type === "concept" ?
                <Concept
                key={node.id}
                id={node.id}
                x={node.x}
                y={node.y}
                scaleX={node.scaleX}
                scaleY={node.scaleY}
                radiusX={node.radiusX}
                radiusY={node.radiusY}
                text={node.text}
                fontSize={node.fontSize}
                color={"#FFB5B7"}
                isNull={node.text===""}
                isSelected={node.selected}
                isEditing={node.isEditing}
                setIsEditing={(value)=>onNodeEdit(node.id, value)}
                onClick={(e)=>onNodeSelect(e,node.id)}
                onScale={(newScale, newX, newY)=>onNodeScale(node.id, newScale, newX, newY)}
                onResize={(offsetW,offsetH)=>{
                    if (node.radiusX+offsetW >= 36 && node.radiusY+offsetH >=20) {
                        setNodes(prevState => {
                            return prevState.map(state => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.radiusX += offsetW;
                                    tmp.radiusY += offsetH;
                                }
                                return tmp;
                            });
                        });
                    }
                }}
                onTextChange={(value)=>onNodeTextChange(value,node.id)}
                onOverflow={(scrollHeight)=>{
                    setNodes(prevState =>{
                        return prevState.map(state => {
                            let tmp = state;
                            if (tmp.id === node.id)
                                tmp.radiusY = Math.max(scrollHeight,
                                    sizeMap["concept"].radiusY);
                            return tmp;
                        });
                    })
                }}
                isConnecting={isDrawingArrow || isDrawingDoubleArrow}
                onConnectingHover={(e,anchor)=>{
                    if (arrowFrom.id !== -1) {
                        setArrowTo({id: node.id, anchor: anchor});
                    }
                }}
                onConnectingUnhover={(e)=>{
                    setArrowTo({id: -1, anchor: -1});
                }}
                onConnected={(e,anchor)=>onNodeConnected(e,node.id,anchor)}
                onDragMove={(e)=>{handleDragNodeMove(e,node.id)}}
                onDragEnd={(e)=>{handleDragNodeEnd(e,node.id)}}
                headerListening={!isDrawingArrow &&
                    !isDrawingDoubleArrow&&!isSectioning&&!isAddingKeyword}
                disabledSet={node.disabledSet}
                displaySet={node.displaySet}
                notificationSet={node.notificationSet}
                setNotificationSet={(toggleSet)=>{
                    setNodes(prevState=>prevState.map(state=>{
                        let tmp = state;
                        if (tmp.id === node.id) {
                            tmp.notificationSet = toggleSet(tmp.notificationSet);
                        }
                        return tmp;
                    }))
                }}
                expandAll={()=>expandAll(node.id, "concept")}
                closeAll={()=>closeAll(node.id, "concept")}
                onHeaderTaskClick={(e,task_id,requesting,callback)=>
                    handleHeaderTaskClick(e,task_id,"concept",node.id,requesting,callback)}
                onHeaderCurtainClick={(task_id)=>handleHeaderCurtainClick(node.id, "concept", task_id)}
                resetHeaderCurtain={(task_id)=>resetHeaderCurtain(node.id, "concept", task_id)}
                callbackTaskId={node.callbackTaskId}
                resetNodeCallbackTaskId={()=>resetNodeCallbackTaskId(node.id)}
                header={isTaskHeaderVisible}
                listening={!isAddingKeyword&&!isSectioning}
                /> : null : null
            })}
           
            {taskNodes.map(node=>{
                const from_anchor = 1;
                const to_anchor = 3;
                // console.log(node.width)
                // const from_anchor = Math.floor(Math.random()*4);
                // const to_anchor = Math.floor(Math.random()*4);
                // const arrow_size = 10 / canvasScale;
                const arrow_dy = to_anchor===0 ? 1 : to_anchor===2 ? -1 : 0;
                const arrow_dx = to_anchor===1 ? 1 : to_anchor===3 ? -1 : 0;
                const isLeft = node.attached_to_type!=="section" &&
                    node.attached_from_id!==-1 &&
                    getNodeById(node.attached_to_id).x < getNodeById(node.attached_from_id).x;
                const finalAnchor = node.attached_to_type!=="section" ?
                    anchor_utils.calcAnchorPosition(
                        to_anchor, getNodeById(node.attached_to_id), canvasScale) : null;
                const section = node.attached_to_type==="section" ? 
                getSectionById(node.attached_to_id) : null;
                const anchorPosition = anchor_utils.calcAnchorPosition(
                    (node.attached_to_type==="section"||node.attached_from_id===-1||
                    isLeft)?from_anchor:to_anchor, node, canvasScale);
                const anchorOffsetPosition = anchor_utils.calcAnchorOffsetPositions(
                    node, canvasScale)[from_anchor];
                // console.log(anchorOffsetPosition)

                return node.display ||
                (node.attached_to_type==="section" ? section.displaySet.has(node.task_id)
                : getNodeById(node.attached_to_id).displaySet.has(node.task_id)) ||
                microTasks.filter(task=>task.id===node.task_id)[0].display ?
                
                <Group
                key={node.id}>
                    {node.attached_to_type!=="section" ?
                    <Group>
                    {node.attached_from_id===-1 ?
                    <MyLine
                    points={[
                        ...anchorPosition,
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(from_anchor, to_anchor,
                            node, getNodeById(node.attached_to_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...finalAnchor
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />
                    : isLeft ?
                    <Group>
                    <MyLine
                    points={[
                        // ...anchorPosition,
                        ...anchor_utils.calcAnchorPosition(
                            to_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(to_anchor, from_anchor,
                            node, getNodeById(node.attached_from_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...anchor_utils.calcAnchorPosition(from_anchor,
                            getNodeById(node.attached_from_id), canvasScale)
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />
                    <MyLine
                    points={[
                        ...anchorPosition,
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(from_anchor, to_anchor,
                            node, getNodeById(node.attached_to_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...finalAnchor
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />
                    </Group> : <Group>
                    <MyLine
                    points={[
                        // ...anchorPosition,
                        ...anchor_utils.calcAnchorPosition(
                            from_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(from_anchor, to_anchor,
                            node, getNodeById(node.attached_from_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...anchor_utils.calcAnchorPosition(to_anchor,
                            getNodeById(node.attached_from_id), canvasScale)
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />
                    <MyLine
                    points={[
                        ...anchorPosition,
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(to_anchor, to_anchor,
                            node, getNodeById(node.attached_to_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...finalAnchor
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />
                    </Group>}
                    {/* <MyLine
                    points={[
                        ...anchorPosition,
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        ...anchor_utils.findPathBetweenNodes(from_anchor, to_anchor,
                            node, getNodeById(node.attached_to_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        ...finalAnchor
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    /> */}
                    </Group> : <MyLine
                    points={[
                        ...anchorPosition,
                        ...anchorOffsetPosition,
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        // ...anchor_utils.findPathBetweenNodeAndPosition(
                        //     [section.x+section.width*section.scaleX/2,
                        //         section.y-60/canvasScale],
                        //     node, 1, canvasScale
                        // ),
                        // ...anchorOffsetPosition,
                        // ...anchor_utils.calcAnchorOffsetPositions(from_anchor,node,canvasScale),
                        ...anchor_utils.findPathBetweenVectors(
                            {x: anchorOffsetPosition[0], y: anchorOffsetPosition[1],
                            dx: -1, dy: 0},
                            {x: getTextWidth(section.text, 18, "bold", 5)/canvasScale+section.x+25/canvasScale,
                            y: section.y-25/canvasScale, dx: 1, dy: 0}
                        ),
                        getTextWidth(section.text, 18, "bold", 5)/canvasScale+section.x+25/canvasScale,
                        section.y-25/canvasScale,
                        getTextWidth(section.text, 18, "bold", 5)/canvasScale+section.x+12/canvasScale,
                        section.y-25/canvasScale
                        // section.x+section.width*section.scaleX/2,
                        // section.y-25/canvasScale,
                        // getTextWidth(section.text, 18, "bold", 5)/canvasScale+section.x+20/canvasScale,
                        // section.y-25/canvasScale
                        // ...anchor_utils.findPathBetweenVectors(
                        //     {x: section.x + section.width*section.scaleX/2,
                        //     y: section.y - 40/canvasScale,
                        //     dx: 1, dy:0},
                        //     {x: }
                        // ),
                        // ...anchor_utils.calcAnchorPosition(
                        //     from_anchor, node, canvasScale),
                        // ...anchor_utils.findPathBetweenNodes(from_anchor, to_anchor,
                        //     node,getNodeById(node.attached_to_id), canvasScale),
                        // ...calcAnchorOffset(arrow.from_anchor, nodes[arrow.from_id]),
                        // ...calcAnchorOffset(arrow.to_anchor, nodes[arrow.to_id]),
                        // ...finalAnchor
                    ]}
                    tension={0}
                    // stroke={"gray"}
                    opacity={0.5}
                    stroke={colorPalette[node.task_id%colorPalette.length]}
                    strokeWidth={1.5/canvasScale}
                    listening={false}
                    />}
                    <TaskNode
                    key={node.id}
                    type={node.type}
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    scaleX={node.scaleX}
                    scaleY={node.scaleY}
                    radiusX={node.radiusX}
                    radiusY={node.radiusY}
                    text={node.text}
                    prompt={node.prompt}
                    fontSize={node.fontSize}
                    color={colorPalette[node.task_id]}
                    onDragMove={(e)=>{
                        setTaskNodes(prevState => {
                            return prevState.map((state) => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.x = e.target.x();
                                    tmp.y = e.target.y();
                                }
                                return tmp;
                            });
                        });
                    }}
                    onDragEnd={(e)=>{
                        setTaskNodes(prevState => {
                            return prevState.map((state) => {
                                let tmp = state;
                                if (tmp.id === node.id) {
                                    tmp.x = e.target.x();
                                    tmp.y = e.target.y();
                                }
                                return tmp;
                            });
                        });
                    }}
                    onConfirm={()=>{
                        const newNode = node.type === "sticky_note" ?
                        {id: nodes.length, type: node.type, scaleX: node.scaleX, scaleY: node.scaleY,
                        x: node.x, y: node.y, display: true, text: node.text,
                        width: node.width, height: node.height, fontSize: 16,
                        selected: false, disabledSet: new Set(
                            microTasks.filter(task=>!task.active).map(task=>task.id)
                        ), displaySet: new Set(),
                        notificationSet: new Set(),
                        callbackTaskId: -1}
                        : node.type === "concept" ? {id: nodes.length, type: node.type,
                        scaleX: node.scaleX, scaleY: node.scaleY, x: node.x, y: node.y,
                        radiusX: node.radiusX, radiusY: node.radiusY,
                        selected: false, text: node.text, fontSize: 20, display: true,
                        disabledSet: new Set(
                            microTasks.filter(task=>!task.active).map(task=>task.id)
                        ), displaySet: new Set(), notificationSet: new Set(), callbackTaskId: -1}
                        : node.type === "keyword" ? {id: nodes.length, type: node.type,
                        scaleX: node.scaleX, scaleY: node.scaleY, x: node.x, y: node.y,
                        width: node.width, height: node.height, fontSize: 20,
                        selected: false, text: node.text, display: true,
                        disabledSet: new Set(
                            microTasks.filter(task=>!task.active).map(task=>task.id)
                        ), displaySet: new Set(), notificationSet: new Set(), callbackTaskId: -1}
                        : null
                        setNodes(prevState => {
                            return [...prevState,newNode];
                        })
                        
                        if (node.attached_to_type !== "section") {
                            if (node.attached_from_id === -1) {
                                setArrows(prevState=>{
                                    return [...prevState, {
                                        id: prevState.length===0 ? 0 : 
                                        Math.max(...prevState.map(state=>state.id))+1,
                                        from_id: numNodes,
                                        from_anchor: 1,
                                        to_id: node.attached_to_id,
                                        to_anchor: 3,
                                        directed: false,
                                        selected: false
                                    }]
                                });
                            } else {
                                const isLeft = getNodeById(node.attached_to_id).x
                                    < getNodeById(node.attached_from_id).x;
                                setArrows(prevState=>{
                                    return [...prevState, {
                                        id: prevState.length===0 ? 0 : 
                                        Math.max(...prevState.map(state=>state.id))+1,
                                        from_id: numNodes,
                                        from_anchor: isLeft?1:3,
                                        to_id: node.attached_to_id,
                                        to_anchor: 3,
                                        directed: false,
                                        selected: false
                                    }, {
                                        id: prevState.length===0 ? 0 : 
                                        Math.max(...prevState.map(state=>state.id))+2,
                                        from_id: numNodes,
                                        from_anchor: isLeft?3:1,
                                        to_id: node.attached_from_id,
                                        to_anchor: isLeft?1:3,
                                        directed: false,
                                        selected: false
                                    }]
                                });
                            }
                        }
                        
                        setNumNodes(numNodes+1);

                        setTaskNodes(prevState => prevState.filter(state=>state.id!==node.id));
                        stageRef.current.container().style.cursor = "default"
                    }}
                    onDelete={()=>{
                        setTaskNodes(prevState => prevState.filter(state=>state.id!==node.id));
                        stageRef.current.container().style.cursor = "default"
                    }}
                    onTextSizeChange={node.type === "keyword" ? (rect)=>{
                        if (rect.width && rect.height &&
                        (node.width !== rect.width || node.height !== rect.height)) {
                            setTaskNodes(prevState=>{
                                return prevState.map(state=>{
                                    let tmp = state;
                                    if (tmp.id === node.id) {
                                        tmp.width = rect.width;
                                        tmp.height = rect.height;
                                    }
                                    return tmp;
                                });
                            })
                        }
                    }: null}
                    onTextHeightOverflow={(textHeight)=>{
                        setTaskNodes(prevState=>prevState.map(state=>{
                            let tmp = state;
                            if (tmp.id === node.id) {
                                if (tmp.type === "concept") {
                                    tmp.radiusY = Math.max(sizeMap["concept"].radiusY,textHeight);
                                } else if (tmp.type === "sticky_note") {
                                    // console.log(tmp.type, textHeight)
                                    // console.log(Math.max(sizeMap["sticky_note"].height,textHeight))
                                    tmp.height = Math.max(sizeMap["sticky_note"].height,textHeight);
                                    // console.log(tmp.height)
                                }
                            }
                            return tmp;
                        }))
                    }}
                    handleRegenerate={(suggestion)=>{
                        regenerate(node.prompt, node.text, suggestion,
                            (result)=>{
                                setTaskNodes(prevState=>prevState.map(state=>{
                                    let tmp = state;
                                    if (tmp.id === node.id) {
                                        tmp.text = result;
                                    }
                                    return tmp;
                                }))
                            })
                    }}
                    listening={!isDrawingArrow && !isDrawingDoubleArrow
                        && !isSectioning && !isAddingKeyword}/>
                </Group>
                : null
                })}
            </CanvasContext.Provider>
            </Group>
        </Layer>
        <Layer>
            <TaskBoard
            x={dimensions.width-360}
            y={25}
            width={300}
            height={dimensions.height-50}
            tasks={microTasks}
            listening={!isDrawingArrow && !isDrawingDoubleArrow
            && !isSectioning && ! isAddingKeyword}
            deleteTask={(id)=>{
                setMicroTasks(prevState=>prevState.filter(state=>state.id!==id));
                setTaskNodes(prevState=>prevState.filter(state=>state.task_id!==id));
            }}
            toggleDisplay={(task_id)=>setMicroTasks(prevState=>prevState.map(state=>{
                let tmp = state;
                if (tmp.id === task_id) {
                    tmp.display = !tmp.display;
                }
                return tmp;
            }))}
            toggleTaskHeaderSwitch={()=>{
                if (isTaskHeaderVisible) {
                    setObjectsCurtainClicked(new Set());
                    // setTaskNodes([]);
                    setNodes(prevState=>prevState.map(state=>{
                        let tmp = state;
                        tmp.callbackTaskId = -1;
                        tmp.displaySet = new Set();
                        tmp.notificationSet = new Set();
                        return tmp;
                    }));
                    setSections(prevState=>prevState.map(state=>{
                        let tmp = state;
                        tmp.callbackTaskId = -1;
                        tmp.displaySet = new Set();
                        tmp.notificationSet = new Set();
                        return tmp;
                    }));
                }
                setIsTaskHeaderVisible(!isTaskHeaderVisible);
            }}
            handlePromptTextChange={(value,id)=>{
                setMicroTasks(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (tmp.id === id) {
                        tmp.examplePrompt = value;
                    }
                    return tmp;
                }))
            }}
            setIOType={(id, type, IOType) => {
                setMicroTasks(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (id === state.id) {
                        if (IOType === "input") {
                            tmp.inputType = type;
                        } else {
                            tmp.outputType = type;
                        }
                    }
                    return tmp;
                }))
            }}
            onAddTask={(taskName,examplePrompt) => {
                setMicroTasks(prevState=>{
                    return [
                        ...prevState,
                        {id: prevState.length===0?0:Math.max(...prevState.map(state=>state.id))+1,
                        goal: taskName, inputType: "Keyword", outputType: "Keyword",
                        active: true, display: false, suggestions: [], examplePrompt: examplePrompt}
                    ]
                });
            }}
            toggleTaskActive={(task_id,active) => {
                setNodes(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (active) {
                        tmp.disabledSet.delete(task_id);
                    } else {
                        if (!tmp.displaySet.has(task_id) && !tmp.notificationSet.has(task_id)) {
                            tmp.disabledSet.add(task_id);
                        }
                    }
                    return tmp;
                }));
                setSections(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (active) {
                        tmp.disabledSet.delete(task_id);
                    } else {
                        if (!tmp.displaySet.has(task_id) && !tmp.notificationSet.has(task_id)) {
                            tmp.disabledSet.add(task_id);
                        }
                    }
                    return tmp;
                }));
                setMicroTasks(prevState=>prevState.map(state=>{
                    let tmp = state;
                    if (tmp.id === task_id) {
                        tmp.active = active;
                    }
                    return tmp;
                }));
            }}
            />

            <Textbox
            // id={0}
            x={globalTextbox.x}
            y={globalTextbox.y}
            width={globalTextbox.width}
            height={globalTextbox.height}
            fontSize={14}
            fontStyle={"bold"}
            text={globalTextbox.text}
            onHover={onMainTextboxHover}
            onUnhover={onMainTextboxUnhover}
            // onTextChange={(value)=>{setGlobalState("prompt",value);}}
            draggable={false}
            />
            <Text
            x={globalTextbox.x}
            y={dimensions.height-12.5}
            width={globalTextbox.width+20}
            text={"see outline"}
            fill={"gray"}
            fontStyle={"bold"}
            fontSize={14}
            visible={toolBarVisibility}
            align={"center"}
            perfectDrawEnabled={false}
            listening={false}
            // onMouseEnter={onMainTextboxHover}
            // onMouseLeave={onMainTextboxUnhover}
            />

            <ToolBar
                x={dimensions.width/2-307.5-64}
                // y={dimensions.height*0.95-50}
                y={dimensions.height*0.95-55}
                // x={globalTextbox.x+(globalTextbox.width+20)/2-307.5}
                // y={globalTextbox.y-80}
                width={615}
                height={60}
                color={"white"}
                onHover={()=>setIsHoverToolBar(true)}
                onUnhover={()=>setIsHoverToolBar(false)}
                visible={toolBarVisibility}
                isArrowIconClicked={isDrawingArrow}
                onArrowIconClick={(e)=>{
                    e.cancelBubble = true;
                    UnselectAllNodes();
                    setIsDrawingDoubleArrow(false);
                    setIsAddingKeyword(false);
                    setIsSectioning(false);
                    setIsDrawingArrow(!isDrawingArrow);
                }}
                isDoubleArrowIconClicked={isDrawingDoubleArrow}
                onDoubleArrowIconClick={(e)=>{
                    e.cancelBubble = true;
                    UnselectAllNodes();
                    setIsDrawingArrow(false);
                    setIsAddingKeyword(false);
                    setIsSectioning(false);
                    setIsDrawingDoubleArrow(!isDrawingDoubleArrow);
                }}
                isSectionIconClicked={isSectioning}
                onSectionIconClick={(e)=>{
                    e.cancelBubble = true;
                    UnselectAllNodes();
                    setIsDrawingArrow(false);
                    setIsDrawingDoubleArrow(false);
                    setIsAddingKeyword(false);
                    setIsSectioning(!isSectioning);
                }}
                isTextIconClicked={isAddingKeyword}
                onTextIconClick={(e)=>{
                    e.cancelBubble = true;
                    UnselectAllNodes();
                    setIsDrawingArrow(false);
                    setIsDrawingDoubleArrow(false);
                    setIsSectioning(false);
                    setIsAddingKeyword(!isAddingKeyword);
                }}
                onAddConcept={(x,y,radiusX,radiusY)=>{
                    setNodes(prevState => {
                        let tmp = {id: numNodes, type: "concept",
                        x: (x-canvasX)/canvasScale, y: (y-canvasY)/canvasScale,
                        radiusX: radiusX, radiusY: radiusY,
                        scaleX: 1/canvasScale, scaleY: 1/canvasScale,
                        selected: false, isEditing: false,
                        text: "", fontSize: 20, display: true,
                        disabledSet: new Set(
                            microTasks.filter(task=>!task.active).map(task=>task.id)
                        ),
                        displaySet: new Set(),
                        notificationSet: new Set(),
                        callbackTaskId: -1};
                        return [...prevState, tmp];
                    });
                    setNumNodes(numNodes+1);
                }}
                onAddStickyNote={(x, y, width, height)=>{
                    setNodes(prevState => {
                        let tmp = {id: numNodes, type: "sticky_note",
                        x: (x-canvasX)/canvasScale, y: (y-canvasY)/canvasScale,
                        width: width, height: height, fontSize: 16,
                        scaleX: 1/canvasScale, scaleY: 1/canvasScale,
                        selected: false, isEditing: false,
                        text: "", display: true,
                        disabledSet: new Set(
                            microTasks.filter(task=>!task.active).map(task=>task.id)
                        ),
                        displaySet: new Set(),
                        notificationSet: new Set(),
                        callbackTaskId: -1};
                        return [...prevState, tmp];
                    });
                    setNumNodes(numNodes+1);
                }}
            />

            <Rect fill="#0099FF"
            opacity={0.12}
            visible={selectionRect.visible} ref={selectionRectRef}
            x={Math.min(selectionRect.x1, selectionRect.x2)}
            y={Math.min(selectionRect.y1, selectionRect.y2)}
            width={Math.abs(selectionRect.x1 - selectionRect.x2)}
            height={Math.abs(selectionRect.y1 - selectionRect.y2)}
            perfectDrawEnabled={false}/>
        </Layer>
    </Stage>
    </HotKeys>
    )
}


/* deprecated */

    {/* <Layer>
        <TaskPrompt
        x={nodes[0].x}
        y={nodes[0].y-50}
        width={180}
        height={21}
        color={"purple"}
        fontSize={12}
        text={"Provide a tldr version of [placeholder]"}/>
    {taskPrompts.map((taskPrompt,index)=>{
            const node = nodes.filter(node=>node.id===taskPrompt.node_id);
            const position = node.length === 0 ? [0,0] :
            canvas2PointerPosition({x: node[0].x, y: node[0].y});
            return <TaskPrompt
            key={index}
            x={position[0]}
            y={position[1]-25}
            width={180}
            height={21}
            color={"#FFB347"}
            fontSize={12}
            text={taskPrompt.prompt}/>
        })}
    </Layer> */}

    {/* {followerPositionQueue.map((position,index)=>{
        return <TaskPrompt
        key={index}
        x={position.x}
        y={position.y}
        width={120}
        height={20}
        color={"orange"}
        fontSize={10}
        text={"Brainstorm a list of keywords related to \"Interaction\""}/>
    })} */}
    
    {/* <Group>
    {followerPositionQueue.map((position,index)=>{
        return <TaskPrompt
        key={index}
        x={position.x}
        y={position.y}
        width={200}
        height={100}
        color={"orange"}
        fontSize={16}
        text={"Brainstorm a list of keywords related to \"Interaction\""}/>
    })}
    </Group>   */}

    {/* <Group> */}
    {/* <PrompterContext.Provider value={{promptCardsRef}}> */}
        {/* {promptCards.map((prompt_card,index)=>{
            return prompt_card.display ?
            <Prompter
            key={index+1}
            id={index+1}
            x={prompt_card.x}
            y={prompt_card.y}
            width={prompt_card.width}
            height={prompt_card.height}
            fontSize={15}
            text={prompt_card.text}
            onDragEnd={(e) => setPrompterPosition(e, index)}
            /> : null
        })} */}
        {/* <Prompter
        id={0}
        x={mainPrompter.x}
        y={mainPrompter.y}
        width={mainPrompter.width}
        height={mainPrompter.height}
        fontSize={18}
        text={mainPrompter.prompt}
        onHover={onMainPrompterHover}
        onUnhover={onMainPrompterUnhover}
        // onTextChange={(value)=>{setGlobalState("prompt",value);}}
        draggable={false}
        /> */}
    {/* </PrompterContext.Provider> */}
    {/* </Group> */}
    {/* <PromptPanel
    x={promptPanelPosition.x}
    y={promptPanelPosition.y}
    width={300}
    height={40}
    fontSize={12}
    visible={promptPanelVisibility}
    prompts={["prompt_1",
    "Brainstorm keywords related to \"recursive\"",
    "What are some potential subtopics related to \"recursive\" in the context of \"prewriting\"?",
    "How is \"unstructured\" related to \"prewriting\"?",
    "prompt_5"]}
    /> */}

    // const toggleFollowerMode = () => {
    //     if (!isFollowerModeEnabled) {
    //         followerProcess.current = setInterval(() => {
    //             const position = stageRef.current.getPointerPosition();
    //             if (position) {
    //                 followerPositionQueue.push({
    //                     x: position.x+(Math.random()-0.8)*40,
    //                     y: position.y+(Math.random()-0.8)*40})
    //             }
    //             if (followerPositionQueue.length === 6) {
    //                 followerPositionQueue.shift();
    //             }
    //             setFollowerPositionQueue(followerPositionQueue);
    //         }, 200);
    //     } else {
    //         clearInterval(followerProcess.current);
    //         setFollowerPositionQueue([]);
    //     }
    //     setIsFollowerModeEnabled(!isFollowerModeEnabled)
    // }

    // const calcAnchorPosition = (anchor, node) => {
    //     const anchorPosition = node.type === "sticky_note" ? [
    //         [node.x + (node.width + 35)*node.scaleX / 2, node.y-20/canvasScale],
    //         [node.x-20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
    //         [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 20/canvasScale],
    //         [node.x + (node.width + 35)*node.scaleX + 20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
    //     ] : node.type === "keyword" ? [
    //         [node.x + node.width/canvasScale / 2, node.y-15/canvasScale],
    //         [node.x-15/canvasScale, node.y + node.height/canvasScale / 2],
    //         [node.x + node.width/canvasScale / 2, node.y + node.height/canvasScale + 15/canvasScale],
    //         [node.x + node.width/canvasScale + 15/canvasScale, node.y + node.height/canvasScale / 2]
    //     ] : node.type === "concept" ? [
    //         [node.x, node.y - node.radiusY*node.scaleY - 15/canvasScale],
    //         [node.x - node.radiusX*node.scaleX - 15/canvasScale, node.y],
    //         [node.x, node.y + node.radiusY*node.scaleY + 15/canvasScale],
    //         [node.x + node.radiusX*node.scaleX + 15/canvasScale, node.y]
    //     ] : []
    //     return anchorPosition[anchor];
    // }

    // const calcAnchorOffsetPositions = (node) => {
    //     const anchorOffset = node.type === "sticky_note" ? [
    //         [node.x + (node.width + 35)*node.scaleX / 2, node.y-50/canvasScale],
    //         [node.x-50/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
    //         [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 50/canvasScale],
    //         [node.x + (node.width + 35)*node.scaleX + 50/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
    //     ] : node.type === "keyword" ? [
    //         [node.x + node.width/canvasScale / 2, node.y-40/canvasScale],
    //         [node.x-40/canvasScale, node.y + node.height/canvasScale / 2],
    //         [node.x + node.width/canvasScale / 2, node.y + node.height/canvasScale + 40/canvasScale],
    //         [node.x + node.width/canvasScale + 40/canvasScale, node.y + node.height/canvasScale / 2]
    //     ] : node.type === "concept" ? [
    //         [node.x, node.y - node.radiusY*node.scaleY - 40/canvasScale],
    //         [node.x - node.radiusX*node.scaleX - 40/canvasScale, node.y],
    //         [node.x, node.y + node.radiusY*node.scaleY + 40/canvasScale],
    //         [node.x + node.radiusX*node.scaleX + 40/canvasScale, node.y]
    //     ] : [];

    //     return anchorOffset;
    // }

    // const findPathBetweenVectors = (from, to) => {
    //     var points = []
    //     if (from.dx === to.dx && from.dx !== 0) {
    //         const borderX = from.dx > 0 ? Math.max(from.x, to.x) : Math.min(from.x, to.x);
    //         points = [borderX, from.y, borderX, to.y];
    //         // if ((from.x-to.x)*from.dx < 0 && Math.abs(from.y-to.y) < to.height/2) {
    //         //     // points = [(to.x-from.dx*to.width-from.x)/2+from.x, from.y,
    //         //     // (to.x-from.dx*to.width-from.x)/2+from.x, to.y+(to.height/2)*(from.y>to.y?1:-1),
    //         //     // borderX, to.y+(to.height/2)*(from.y>to.y?1:-1)
    //         //     // ]
    //         // } else if ((from.x-to.x)*from.dx > 0 && Math.abs(from.y-to.y) < from.height/2) {
    //         // //     points = [
    //         // //     borderX, to.y+(to.height/2)*(from.y>to.y?-1:1),
    //         // //     (from.x-from.dx*from.width-to.x)/2+to.x, to.y+(to.height/2)*(from.y>to.y?-1:1),
    //         // //     (from.x-from.dx*from.width-to.x)/2+to.x, to.y,
    //         // //    ]
    //         // } else {
    //         //     points = [borderX, from.y, borderX, to.y];
    //         // }
    //     }
    //     if (from.dx === -to.dx && from.dx !== 0) {
    //         const middleX = (from.x+to.x) / 2;
    //         const middleY = (from.y+to.y) / 2;
    //         if (from.dx*(to.x-from.x) > 0) {
    //             points = [middleX, from.y, middleX, to.y];
    //         } else {
    //             points = [from.x, middleY, to.x, middleY];
    //         }
    //     }
    //     if (from.dy === to.dy && from.dy !== 0) {
    //         const borderY = from.dy > 0 ? Math.max(from.y, to.y) : Math.min(from.y, to.y);
    //         points = [from.x, borderY, to.x, borderY];
    //     }
    //     if (from.dy === -to.dy && from.dy !== 0) {
    //         const middleX = (from.x+to.x) / 2;
    //         const middleY = (from.y+to.y) / 2;
    //         if (from.dy*(to.y-from.y) > 0) {
    //             points = [from.x, middleY, to.x, middleY];
    //             // points = [middleX, from.y, middleX, to.y];
    //         } else {
    //             // points = [from.x, middleY, to.x, middleY];
    //             points = [middleX, from.y, middleX, to.y];
    //         }
    //     }

    //     if (from.dx*to.dy !== 0) {
    //         if ((to.x-from.x)*from.dx < 0 || (to.y-from.y)*to.dy > 0) {
    //             points = [from.x, to.y]
    //         } else {
    //             points = [to.x, from.y]
    //         }
    //     }
    //     if (from.dy*to.dx !== 0) {
    //         if ((to.y-from.y)*from.dy < 0 || (to.x-from.x)*to.dx > 0) {
    //             points = [to.x, from.y]
    //         } else {
    //             points = [from.x, to.y]
    //         }
    //     }
        
    //     return points;
    // }

    // const findPathBetweenNodes = (fromAnchor, toAnchor, fromNode, toNode, canvasScale) => {
    //     const fromAnchorOffset = calcAnchorOffsetPositions(fromNode, canvasScale);
    //     const toAnchorOffset = calcAnchorOffsetPositions(toNode, canvasScale);

    //     const from = {x: fromAnchorOffset[fromAnchor][0],
    //     y: fromAnchorOffset[fromAnchor][1],
    //     dx: (fromAnchor%2)*parseInt(2*(fromAnchor/2-1)),
    //     dy: ((fromAnchor+1)%2)*parseInt(2*(fromAnchor/2-0.5)),
    //     width: (fromNode.width + 35)*fromNode.scaleX + 40/canvasScale,
    //     height: (fromNode.height + 70)*fromNode.scaleY + 40/canvasScale}

    //     const to = {x: toAnchorOffset[toAnchor][0],
    //         y: toAnchorOffset[toAnchor][1],
    //         dx: (toAnchor%2)*parseInt(2*(toAnchor/2-1)),
    //         dy: ((toAnchor+1)%2)*parseInt(2*(toAnchor/2-0.5)),
    //         width: (toNode.width + 35)*toNode.scaleX + 40/canvasScale,
    //         height: (toNode.height + 70)*toNode.scaleY + 40/canvasScale}

    //     return [...fromAnchorOffset[fromAnchor],
    //     ...findPathBetweenVectors(from,to),
    //     ...toAnchorOffset[toAnchor]]
    // }
    

    // const updatePromptCards = (prompt) => {
    //     const lastPromptCardIndex = promptCardIndex === 1 ? 5 : promptCardIndex-1;
    //     promptCardsRef.current.map((promptCardRef,index)=>{
    //         if (index !== 0) {
    //             if (index !== lastPromptCardIndex) {
    //                 const indexOffset = index >= promptCardIndex ?
    //                 index-promptCardIndex+1 : 6-(promptCardIndex-index);
    //                 promptCardRef.current.to({
    //                     y: promptCardRef.current.y()+175,
    //                     duration: 0.1+(5-indexOffset)*0.15,
    //                     easing: Konva.Easings.EaseInOut,
    //                 })
    //             }
    //         }
    //     });

    //     promptCardsRef.current[lastPromptCardIndex].current.to({
    //         y: dimensions.height*0.05,
    //         opacity: 0.12,
    //         duration: 0.75,
    //         easing: Konva.Easings.EaseOut,
    //         onFinish: ()=>{
    //             // PromptGPT("Life is short,",
    //             //     100,
    //             //     (text)=>{
    //             //         setPromptCards(prevState=>{
    //             //             // prevState.splice(0,0,prevState.pop());
    //             //             return prevState.map((state,index)=>{
    //             //                 if (index+1 === lastPromptCardIndex) {
    //             //                     state.text = 'Life is short,'+text;
    //             //                 }
    //             //                 // state.y = dimensions.height*0.05 + 175*index;
    //             //                 return state;
    //             //             });
    //             //         });
    //             //     });
                            
    //             promptCardsRef.current[lastPromptCardIndex].current.to({
    //                 opacity: 1,
    //                 duration: 0.5,
    //                 easing: Konva.Easings.EaseIn,
    //                 onFinish: ()=> {
    //                     // promptCardsRef.current.splice(1, 0, promptCardsRef.current.pop());
                        
                        
    //                     setPromptCardIndex(lastPromptCardIndex);
    //                 }
    //             });
    //         }
    //     });
    // }