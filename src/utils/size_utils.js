import Konva from "konva";

const sizeMap = {
    "sticky_note": {
        width: 145,
        height: 110
    },
    "concept": {
        radiusX: 72,
        radiusY: 40
    },
    "keyword": {
        width: 0,
        height: 0
    }
}

const getTextWidth = (text, fontSize, fontStyle, padding) => {
    const tmp = new Konva.Text({text: text, fontSize: fontSize,
        fontStyle: fontStyle, padding: padding});
    return tmp.width();
}

export {sizeMap, getTextWidth}