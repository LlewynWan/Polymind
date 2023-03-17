const objectTypes = [
    "Sticky Note",
    "Keyword",
    "Concept",
    "Section",
    "Node",
    "Line"
];

const toUpperCase = (type) =>{
    switch (type) {
        case 'sticky_note':
            return "Sticky Note";
        case 'keyword':
            return "Keyword";
        case 'concept':
            return "Concept";
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
        default:
            return "";
      }
}

const nextType = (type) => {
    const currentIndex = objectTypes.findIndex((objType=>objType===type));
    return objectTypes[(currentIndex + 1) % 6];
}

const prevType = (type) => {
    const currentIndex = objectTypes.findIndex((objType=>objType===type));
    return objectTypes[(currentIndex + 5) % 6];
}


export {objectTypes, nextType, prevType, toUpperCase, toLowerCase}