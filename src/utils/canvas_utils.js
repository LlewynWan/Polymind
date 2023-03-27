import Konva from "konva";


const calcSectionsFittsLawID = (section, pointerPosition) => {
    const W = section.width*section.scaleX;
    const sectionCenter = [
        section.x + (section.width)*section.scaleX/2,
        section.y + (section.height)*section.scaleY/2
    ];
    const D = Math.sqrt((pointerPosition[0]-sectionCenter[0])**2 +
    (pointerPosition[1]-sectionCenter[1])**2)

    return D*2/W;
}

const DFS = (root, nodes, arrows, visited, prefix="") => {
    visited.add(root.id);
    var outline = prefix + root.type + ": " + root.text + "\n";
    const children = nodes.filter(node=>!visited.has(node.id) &&
        arrows.filter(arrow=>(arrow.directed&&arrow.from_id===root.id&&arrow.to_id===node.id)
        || (!arrow.directed&&arrow.from_id===root.id&&arrow.to_id===node.id)
        || (!arrow.directed&&arrow.from_id===node.id&&arrow.to_id===root.id)).length);
    children.forEach(child=>{
        outline += DFS(child, nodes, arrows, visited, prefix=prefix+"  ");
    });
    return outline;
}

const calcSectionOutline = (nodes, arrows, prefix="") => {
    const cmp = (a,b) => {
        const types = ["keyword", "concept", "sticky_note"];
        const idx_a = types.indexOf(a.type);
        const idx_b = types.indexOf(b.type);
        if (idx_a < idx_b) {
            return -1;
        } else {
            return 1;
        }
    }
    const roots = [...nodes.filter(node => 
        !arrows.filter(arrow=>arrow.directed&&arrow.to_id===node.id).length)]
        .sort(cmp);
    var outline = "";
    var visited = new Set();
    roots.forEach(root => {
        if (!visited.has(root.id)) {
            outline += DFS(root, nodes, arrows, visited, prefix)
        }
        // outline += prefix + root.type + ": " + root.text + "\n";
        // outline += calcSectionOutline(nodes.filter())
    });
    return outline;
}

const calcFittsLawID = (node, pointerPosition) => {
    const W = node.type === "concept" ? node.radiusX * node.scaleX
    : node.width * node.scaleX;

    const font = new Konva.Text({text:
        node.text === "" ? "Add keyword" : node.text,
        fonStyle: "bold", fontSize: node.fontSize});
    const nodeCenter = node.type === "concept" ? [node.x, node.y]
    : node.type === "sticky_note" ? [
        node.x + (node.width+35)*node.scaleX/2,
        node.y + (node.height+70)*node.scaleY/2
    ] : [
        node.x + (font.width()+20)*node.scaleX/2,
        node.y + (font.height()+20)*node.scaleY/2
    ]

    const D = Math.sqrt((pointerPosition[0]-nodeCenter[0])**2+
    (pointerPosition[1]-nodeCenter[1])**2);

    font.destroy();
    return D*2/W;
}

const calcAnchorPosition = (anchor, node, canvasScale) => {
    const anchorPosition = node.type === "sticky_note" ? [
        [node.x + (node.width + 35)*node.scaleX / 2, node.y-20/canvasScale],
        [node.x-20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
        [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 20/canvasScale],
        [node.x + (node.width + 35)*node.scaleX + 20/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
    ] : node.type === "keyword" ? [
        [node.x + node.width/canvasScale / 2, node.y-15/canvasScale],
        [node.x-15/canvasScale, node.y + node.height/canvasScale / 2],
        [node.x + node.width/canvasScale / 2, node.y + node.height/canvasScale + 15/canvasScale],
        [node.x + node.width/canvasScale + 15/canvasScale, node.y + node.height/canvasScale / 2]
    ] : node.type === "concept" ? [
        [node.x, node.y - node.radiusY*node.scaleY - 15/canvasScale],
        [node.x - node.radiusX*node.scaleX - 15/canvasScale, node.y],
        [node.x, node.y + node.radiusY*node.scaleY + 15/canvasScale],
        [node.x + node.radiusX*node.scaleX + 15/canvasScale, node.y]
    ] : []
    return anchorPosition[anchor];
}

const calcAnchorOffsetPositions = (node, canvasScale) => {
    // console.log(node, canvasScale)
    const anchorOffset = node.type === "sticky_note" ? [
        [node.x + (node.width + 35)*node.scaleX / 2, node.y-50/canvasScale],
        [node.x-50/canvasScale, node.y + (node.height + 70)*node.scaleY / 2],
        [node.x + (node.width + 35)*node.scaleX / 2, node.y + (node.height + 70)*node.scaleY + 50/canvasScale],
        [node.x + (node.width + 35)*node.scaleX + 50/canvasScale, node.y + (node.height + 70)*node.scaleY / 2]
    ] : node.type === "keyword" ? [
        [node.x + node.width/canvasScale / 2, node.y-40/canvasScale],
        [node.x-40/canvasScale, node.y + node.height/canvasScale / 2],
        [node.x + node.width/canvasScale / 2, node.y + node.height/canvasScale + 40/canvasScale],
        [node.x + node.width/canvasScale + 40/canvasScale, node.y + node.height/canvasScale / 2]
    ] : node.type === "concept" ? [
        [node.x, node.y - node.radiusY*node.scaleY - 40/canvasScale],
        [node.x - node.radiusX*node.scaleX - 40/canvasScale, node.y],
        [node.x, node.y + node.radiusY*node.scaleY + 40/canvasScale],
        [node.x + node.radiusX*node.scaleX + 40/canvasScale, node.y]
    ] : [];

    return anchorOffset;
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
        if ((to.y-from.y)*from.dy < 0 || (to.x-from.x)*to.dx > 0) {
            points = [to.x, from.y]
        } else {
            points = [from.x, to.y]
        }
    }
    
    return points;
}

const findPathBetweenNodes = (fromAnchor, toAnchor, fromNode, toNode, canvasScale) => {
    const fromAnchorOffset = calcAnchorOffsetPositions(fromNode, canvasScale);
    const toAnchorOffset = calcAnchorOffsetPositions(toNode, canvasScale);

    const from = {x: fromAnchorOffset[fromAnchor][0],
    y: fromAnchorOffset[fromAnchor][1],
    dx: (fromAnchor%2)*parseInt(2*(fromAnchor/2-1)),
    dy: ((fromAnchor+1)%2)*parseInt(2*(fromAnchor/2-0.5)),
    // width: (fromNode.width + 35)*fromNode.scaleX + 40/canvasScale,
    // height: (fromNode.height + 70)*fromNode.scaleY + 40/canvasScale
    }

    const to = {x: toAnchorOffset[toAnchor][0],
        y: toAnchorOffset[toAnchor][1],
        dx: (toAnchor%2)*parseInt(2*(toAnchor/2-1)),
        dy: ((toAnchor+1)%2)*parseInt(2*(toAnchor/2-0.5)),
        // width: (toNode.width + 35)*toNode.scaleX + 40/canvasScale,
        // height: (toNode.height + 70)*toNode.scaleY + 40/canvasScale
    }

    return [...fromAnchorOffset[fromAnchor],
    ...findPathBetweenVectors(from,to),
    ...toAnchorOffset[toAnchor]]
}

const findPathBetweenNodeAndPosition = (position, node, anchor, canvasScale) => {
    // console.log(node)
    const anchorOffset = calcAnchorOffsetPositions(node,canvasScale);

    const [anchorX,anchorY] = anchorOffset[anchor];
    const dx = (anchor%2)*parseInt(2*(anchor/2-1));
    const dy = ((anchor+1)%2)*parseInt(2*(anchor/2-0.5));
    if ((dx !== 0 && (position[0]-anchorX)*dx > 0)
    || ((dx === 0) && (position[1]-anchorY)*dy < 0)) {
        return [anchorX, anchorY, position[0], anchorY,
        position[0], position[1]];
    } else {
        return [anchorX, anchorY, anchorX, position[1],
        position[0], position[1]];
    }
}

const typeMap = {
    "keyword": "Keyword",
    "concept": "Concept",
    "sticky_note": "Sticky Note"
    // "Section": "#80D8FF",
    // "Node": "#112233",
    // "Line": "#C3E7FD"
}

const anchor_utils = {findPathBetweenVectors, findPathBetweenNodes,
    calcAnchorOffsetPositions, calcAnchorPosition, findPathBetweenNodeAndPosition}
const node_utils = {calcFittsLawID, typeMap}
const section_utils = {calcSectionsFittsLawID, calcSectionOutline}

export {anchor_utils,node_utils,section_utils}