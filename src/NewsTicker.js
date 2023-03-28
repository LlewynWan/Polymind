import React, { useRef, useState } from "react";
import { Group, Label, Tag, Text } from "react-konva";


export function NewsTicker({
    x,
    y,
    summary,
    keypoints,
    width,
    color,
    fontSize
}) {
    const [isAnimating, setIsAnimating] = useState(false);
    const tagRef = useRef(null);
    const textRef = useRef(null);

    const [animationTimeout, setAnimationTimeout] = useState(-1);

    // useEffect(()=>{
    //     console.log(summary, keypoints);
    // }, [summary,keypoints])

    return (
    <Group
    x={x}
    y={y}
    clipX={x+2.5}
    clipY={0}
    ClipWidth={width+35}
    clipHeight={25}>
    <Label
    x={2.5}
    y={0}
    onMouseEnter={()=>{
        if (!isAnimating && summary!==" ") {
            const animThread = setTimeout(()=>{
                setIsAnimating(true);
                if (tagRef.current) {
                    tagRef.current.to({
                        fill: color,
                        duration: 0.75
                    });
                }
                if (textRef.current) {
                    textRef.current.to({
                        opacity: 0,
                        duration: 0.5,
                        onFinish: ()=>{
                            if (textRef.current) {
                                textRef.current.setAttrs({text: summary, align: "left",
                                width: width+35+summary.length*7,
                                fill: "white", textDecoration: "normal"})
                                if (textRef.current) {
                                    textRef.current.to({
                                        opacity: 1,
                                    });
                                }
                            }
                        }
                    })
                    // textRef.current.setAttrs({text: summary, align: "left",
                    // width: width+35+summary.length*7, fill: "white", textDecoration: "normal"})
                }
                setTimeout(()=>{
                    if (textRef.current) {
                        textRef.current.to({
                        x: -summary.length*6.5,
                        duration: summary.length/15,
                        onFinish: ()=>{
                        if (textRef.current) {
                            textRef.current.setAttrs({
                            x: 0, width: width+35, align: "center",
                            text: keypoints, opacity: 0, fill: color
                            , textDecoration: "underline"});
                            if (textRef.current) {
                                textRef.current.to({
                                opacity: 1,
                                duration: 0.32,
                                onFinish: ()=>{
                                    setIsAnimating(false);
                                }})
                            }
                        }
                        if (tagRef.current) {
                            tagRef.current.to({
                            fill: "#FCFCFC",
                            opacity: 1,
                            duration: 0.25
                        })}
                        }
                        })
                    }
                    
                }, 2500)
            }, 750);
            setAnimationTimeout(animThread);
        }
    }}
    onMouseLeave={()=>{
        if (!isAnimating) {
            clearTimeout(animationTimeout);
            setIsAnimating(false);
        }
    }}>
        <Tag
        // fill={colorPalette[task.id%colorPalette.length]}
        ref={tagRef}
        fill={"#FCFCFC"}
        // fill={"#2A2A35"}
        cornerRadius={2.5}
        lineJoin={'round'}
        perfectDrawEnabled={false}
        // pointerDirection={"left"}
        />
        <Text
        ref={textRef}
        x={0}
        y={0}
        width={width+35}
        height={15}
        text={keypoints}
        fontSize={fontSize}
        fontStyle={"bold"}
        fontFamily={"sans-serif"}
        textDecoration={"underline"}
        fill={color}
        align={"center"}
        verticalAlign={"middle"}
        padding={2.5}
        perfectDrawEnabled={false}
        ellipsis={false}/>
    </Label>
    </Group>
    )
}