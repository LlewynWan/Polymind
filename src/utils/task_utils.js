const inputTypes = [
    "Keyword",
    "Concept",
    "Sticky Note",
    "Node",
    "Section"
    // "Line"
];

const outputTypes = [
    "Keyword",
    "Concept",
    "Sticky Note",
    "Section"
];

const outputMap = {
    "Keyword": [3,3],
    "Concept": [3,5],
    "Sticky Note": [1,50],
    // "Section"
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
            return "Node";
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
        case 'Node':
            return "node";
        default:
            return "";
      }
}

const nextInputType = (type) => {
    const currentIndex = inputTypes.findIndex((objType=>objType===type));
    return inputTypes[(currentIndex + 1) % 5];
}

const prevInputType = (type) => {
    const currentIndex = inputTypes.findIndex((objType=>objType===type));
    return inputTypes[(currentIndex + 4) % 5];
}

const nextOutputType = (type) => {
    const currentIndex = outputTypes.findIndex((objType=>objType===type));
    return outputTypes[(currentIndex + 1) % 4];
}

const prevOutputType = (type) => {
    const currentIndex = outputTypes.findIndex((objType=>objType===type));
    return outputTypes[(currentIndex + 3) % 4];
}


export {nextInputType, prevInputType,
    nextOutputType, prevOutputType, toUpperCase, toLowerCase, outputMap}