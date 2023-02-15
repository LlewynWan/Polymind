import React from "react";
import { GlobalContext } from "./state";

import { Canvas } from "./Canvas";

import './App.css';


const initialState = {
  nodes: [
      // {id: 0, type: "sticky_note", x: window.innerWidth/12, y: window.innerHeight/10, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
      // {id: 1, type: "sticky_note", x: window.innerWidth/12+2, y: window.innerHeight/10+2, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
      // {id: 2, type: "sticky_note", x: window.innerWidth/12+4, y: window.innerHeight/10+4, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
      // {id: 3, type: "sticky_note", x: window.innerWidth/12+6, y: window.innerHeight/10+6, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true},
      // {id: 4, type: "sticky_note", x: window.innerWidth/12+8, y: window.innerHeight/10+8, scaleX: 1, scaleY: 1, width: 150, height: 120, selected: false, text: "", display: true}
  ],
  num_nodes: 0,
  arrows: [],
  prompt_cards: [
      {id: 0, x: window.innerWidth*0.75, y: window.innerHeight*0.08, scale: 1, width: 400, height: 120, text: "prompt suggestion", display: true},
      {id: 1, x: window.innerWidth*0.75, y: window.innerHeight*0.08+175, scale: 1, width: 400, height: 120, text: "prompt suggestion", display: true},
      {id: 2, x: window.innerWidth*0.75, y: window.innerHeight*0.08+350, scale: 1, width: 400, height: 120, text: "prompt suggestion", display: true},
      {id: 3, x: window.innerWidth*0.75, y: window.innerHeight*0.08+525, scale: 1, width: 400, height: 120, text: "prompt suggestion", display: true}
  ],
  main_prompter: {x: window.innerWidth*0.3, y: window.innerHeight*0.95, scale: 1, width: 640, height: 180, prompt: "Main Prompter",}
}


function App() {
  const [nodes, setNodes] = React.useState(initialState.nodes);
  const [numNodes, setNumNodes] = React.useState(initialState.num_nodes);
  const [arrows, setArrows] = React.useState(initialState.arrows);
  const [promptCards, setPromptCards] = React.useState(initialState.prompt_cards);
  const [mainPrompter, setMainPrompter] = React.useState(initialState.main_prompter);

  return (
    <div className="container fullscreen" id="fullsccreen">
      <GlobalContext.Provider value={{
        nodes, numNodes, arrows, promptCards, mainPrompter,
        setNodes, setNumNodes, setArrows, setPromptCards, setMainPrompter
      }}>
        <Canvas />
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
