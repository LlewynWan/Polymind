import React, {useEffect} from "react";
import { GlobalContext } from "./state";

import { Canvas } from "./Canvas";

import './App.css';


function App() {
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  });
  const initialState = {
    nodes: [
        {id: 10, type: "concept", x: window.innerWidth/12, y: window.innerHeight/10, radiusX: 128, radiusY: 64, scaleX: 1, scaleY: 1, selected: false, text: "", display: true}
        // {id: 0, type: "sticky_note", x: window.innerWidth/12, y: window.innerHeight/10, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
        // {id: 1, type: "sticky_note", x: window.innerWidth/12+2, y: window.innerHeight/10+2, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
        // {id: 2, type: "sticky_note", x: window.innerWidth/12+4, y: window.innerHeight/10+4, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
        // {id: 3, type: "sticky_note", x: window.innerWidth/12+6, y: window.innerHeight/10+6, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
        // {id: 4, type: "sticky_note", x: window.innerWidth/12+8, y: window.innerHeight/10+8, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true}
    ],
    num_nodes: 0,
    arrows: [],
    task_prompts: [
      {node_id: 0, task_id: 0, prompt: "Brainstorm a list of keywords related to \"Interaction\""}
    ],
    prompt_cards: [
        {x: dimensions.width*0.75, y: dimensions.height*0.05, scale: 1, width: 400, height: 120, text: "prompt suggestion 1", display: true},
        {x: dimensions.width*0.75, y: dimensions.height*0.05+175, scale: 1, width: 400, height: 120, text: "prompt suggestion 2", display: true},
        {x: dimensions.width*0.75, y: dimensions.height*0.05+350, scale: 1, width: 400, height: 120, text: "prompt suggestion 3", display: true},
        {x: dimensions.width*0.75, y: dimensions.height*0.05+525, scale: 1, width: 400, height: 120, text: "prompt suggestion 4", display: true},
        {x: dimensions.width*0.75, y: dimensions.height*0.05+700, scale: 1, width: 400, height: 120, text: "prompt suggestion 5", display: true}
    ],
    main_prompter: {x: dimensions.width*0.3, y: dimensions.height*0.95, scale: 1, width: 640, height: 180, prompt: "Main Prompter",}
  }

  const [nodes, setNodes] = React.useState(initialState.nodes);
  const [numNodes, setNumNodes] = React.useState(initialState.num_nodes);
  const [arrows, setArrows] = React.useState(initialState.arrows);
  const [promptCards, setPromptCards] = React.useState(initialState.prompt_cards);
  const [mainPrompter, setMainPrompter] = React.useState(initialState.main_prompter);
  const [taskPrompts, setTaskPrompts] = React.useState(initialState.task_prompts)


  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      });
      setMainPrompter(prevState=>{
        let tmp = prevState;
        tmp.x = window.innerWidth*0.3;
        tmp.y = window.innerHeight*0.95;
        return tmp;
      })
      setPromptCards(prevState=>{
        return prevState.map((state,index)=>{
          let tmp = state;
          tmp.x = window.innerWidth*0.75;
          tmp.y = window.innerHeight*0.05+175*(index);
          return tmp;
        });
      });
    }
    window.addEventListener('resize', handleResize);
  }, [dimensions])

  return (
    <div className="container fullscreen" id="fullsccreen">
      <GlobalContext.Provider value={{
        nodes, numNodes, arrows, promptCards, mainPrompter, taskPrompts,
        setNodes, setNumNodes, setArrows, setTaskPrompts, setPromptCards, setMainPrompter
      }}>
        <Canvas dimensions={dimensions}/>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
