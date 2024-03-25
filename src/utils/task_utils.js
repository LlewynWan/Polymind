const inputTypes = [
    "Keyword",
    "Concept",
    "Sticky Note",
    "Nodes",
    "Section"
    // "Line"
];

const outputTypes = [
    "Keyword",
    "Concept",
    "Sticky Note",
    // "Line"
];

const outputMap = {
    "Keyword": [3,3],
    "Concept": [3,5],
    "Sticky Note": [1,150],
    // "Line": [3,3]
}

const toUpperCase = (type) =>{
    switch (type) {
        case 'sticky_note':
            return "Sticky Note";
        case 'keyword':
            return "Keyword";
        case 'concept':
            return "Concept";
        case 'section':
            return "Section";
        case 'node':
            return "Nodes";
        default:
            return "";
      }
}

const toLowerCase = (type) =>{
    switch (type) {
        case 'Sticky Note':
            return "sticky_note";
        case 'Keyword':
            return "keyword";
        case 'Concept':
            return "concept";
        case 'Section':
            return "section";
        case 'Nodes':
            return "node";
        default:
            return "";
      }
}

const nextInputType = (type) => {
    const currentIndex = inputTypes.findIndex((objType=>objType===type));
    return inputTypes[(currentIndex + 1) % inputTypes.length];
}

const prevInputType = (type) => {
    const currentIndex = inputTypes.findIndex((objType=>objType===type));
    return inputTypes[(currentIndex + inputTypes.length-1) % inputTypes.length];
}

const nextOutputType = (type) => {
    const currentIndex = outputTypes.findIndex((objType=>objType===type));
    return outputTypes[(currentIndex + 1) % outputTypes.length];
}

const prevOutputType = (type) => {
    const currentIndex = outputTypes.findIndex((objType=>objType===type));
    return outputTypes[(currentIndex + outputTypes.length-1) % outputTypes.length];
}


export {nextInputType, prevInputType,
    nextOutputType, prevOutputType, toUpperCase, toLowerCase, outputMap}