import { useRef, useState, useEffect } from "react";
import { HashRouter as Router, Route, Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import {axiosConfig} from './axiosConfig.js';
import { fas } from '@fortawesome/fontawesome-free-solid'
import "./introduction.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
function IntroductionGallery({ children, imageData, refs, refs2 }){
    return(
            imageData.map((value, index) => (
                <div ref={ refs2 } key={ index } className={`introduction-main ${value.className}`} style={ value.imgStyle }>
                    { children }
                    <img ref={ refs } src={ value.imgUrl } alt="" className="introduction-image" />
                </div>
            ))      
    )
}

function ArrowLeft({ leftClick }){
    return(
        <div className="arrow arrow-left" onClick={ leftClick }>
            <FontAwesomeIcon icon={['fas', 'angle-left']} />
        </div>
    )
}
function ArrowRight({ rightClick }){
    return(
        <div className="arrow arrow-right" onClick={ rightClick }>
            <FontAwesomeIcon icon={['fas', 'angle-right']} />
        </div>
    )
}

function ImageNavigation({ imageData }){
    return(
        <div className="image-navigator">
            <ul>
                {
                imageData.map((value, index) => (
                    <li key={index} className={`${value.navigator === true ? "navigator-active" : ""}`}></li>
                ))    
                }
                
            </ul>
        </div>
    )
}

function addKeyFrames(animationName, from, to, cssAttribute){
    let keyframes =`@keyframes ${animationName} { 0% { ${cssAttribute}: ${from}; } 100% { ${cssAttribute}: ${to}; } }`;
    let styleSheet = document.styleSheets[0];
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

function addKeyFrames2(animationName, keyframeData){
    let keyframes = `@keyframes ${animationName}{`;
    for(let i = 0; i < keyframeData.length; i++)
    { 
        keyframes += ` ${keyframeData[i].percent} { `;

        for(let x = 0; x < keyframeData[i].cssAttribute.length; x++){
            keyframes += `${keyframeData[i].cssAttribute[x].attribute}: ${keyframeData[i].cssAttribute[x].value};`;
        }        

        keyframes += ` } `;
    }
    keyframes += `}`;
    // let keyframes = `@keyframes ${animationName} { 0% { ${cssAttribute}: ${from}; } 100% { ${cssAttribute}: ${to}; } }`;
    let styleSheet = document.styleSheets[0];
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

// function slideImage(animationName, from, to, cssAttribute){
function slideImage(animationName, animationDuration= ".2s", animationFillMode = "forwards"){
    let style = {
        // animation: `${animationName} .4s linear forwards`,
        animationName: animationName,
        animationDuration: animationDuration,
        animationFillMode: animationFillMode,
      };
    return style;
}

function TextAnimation({ textData, styles }){
    return(
        <div className="text-wrapper" style={ styles }>
            <div className="text-head">
                <h2>{ textData.textHead }</h2>
            </div>
            <div className="text-body">
                <p>{ textData.textBody }</p>
            </div>
            <div className="text-footter">
                { textData.textFootter !== undefined ? <button type="button" className="btn bg-orange">{ textData.textFootter }</button> : "" }
            </div>
        </div>
    )
}

export default function Intruduction() {

    let [introductionMainHeight, setIntroductionMainHeight] = useState("600px");
    let [introductionWrapperStyle, setIntroductionWrapperStyle] = useState({height: introductionMainHeight});
    let [defaultImgStyle, setDefaultImgStyle] = useState({position: 'absolute', left: "-100%", height: introductionMainHeight});
    let [currentTextAnimation, setCurrentTextAnimation] = useState({
        textData: {},
        textStyle: {},
    });
    // let [showImgStyle, setShowImgStyle] = useState({position: 'relative'});
    let [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageRef = useRef(null);
    // const imageDatass = [
    //     {
    //         id: 0,
    //         imgUrl: "http://1.bp.blogspot.com/-Ow2QaS7KKH8/UOLru0O4ymI/AAAAAAAAEUk/9odzLaWI32Q/s1600/sky_colors-wide.jpg",
    //         imgStyle: {position: 'relative', height: introductionMainHeight},
    //         className: "",
    //         navigator: true,
    //         text: {
    //             textHead: "ฉันคือหัวข้อ1",
    //             textBody: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim ex, voluptates id cumque earum soluta ipsa quam recusandae dolores. Eius molestias ratione, odit voluptate maxime corporis ipsa reiciendis numquam quam!",
    //             textFootter: "ฉันคือ Footter1"
    //         },
    //     },
    //     {
    //         id: 1,
    //         imgUrl: "https://i.pinimg.com/originals/19/60/a0/1960a00758f50548743fa5417af0fa2b.jpg",
    //         imgStyle: defaultImgStyle,
    //         className: "",
    //         navigator: false,
    //         text: {
    //             textHead: "ฉันคือหัวข้อ2",
    //             textBody: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim ex, voluptates id cumque earum soluta ipsa quam recusandae dolores. Eius molestias ratione, odit voluptate maxime corporis ipsa reiciendis numquam quam! adipisicing elit. Enim ex, voluptates id cumque earum soluta ipsa quam recusandae dolores. Eius molestias ratione, odit voluptate maxime corporis ipsa reiciendis numquam quam!",
    //             textFootter: "ฉันคือ Footter2"
    //         },
    //     },
    //     {
    //         id: 2,
    //         imgUrl: "https://phetchabun.org/wp-content/uploads/2017/08/02-9.jpg",
    //         imgStyle: defaultImgStyle,
    //         className: "",
    //         navigator: false,
    //         text: {
    //             textHead: "ฉันคือหัวข้อ3",
    //             textBody: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    //             textFootter: "ฉันคือ Footter3"
    //         ,}
    //     }
    // ];
    const [imageData, setImageData] = useState([]);
    let [imageDataState, setImageDataState] = useState(imageData);
    let [loading, setLoading] = useState(true);

    const handleFetch = () => {
            let apiContentsURL = rootUrl + "api/load-content/1"
            axiosConfigs.method = "GET";
            axiosConfigs.url = apiContentsURL;
            axios(axiosConfigs)
                .then((response) => {
                    setLoading(false);
                    if(response.data.status === true){
                        const fetchData = response.data.data;
                        let finishDataFormat = [];
                        for(let i = 0; i < fetchData.length; i++){
                            let dataFormat = {
                            id: 0,
                            imgUrl: "http://1.bp.blogspot.com/-Ow2QaS7KKH8/UOLru0O4ymI/AAAAAAAAEUk/9odzLaWI32Q/s1600/sky_colors-wide.jpg",
                            imgStyle: {position: 'relative', height: introductionMainHeight},
                            className: "",
                            navigator: true,
                            text: {
                                textHead: "ฉันคือหัวข้อ1",
                                textBody: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim ex, voluptates id cumque earum soluta ipsa quam recusandae dolores. Eius molestias ratione, odit voluptate maxime corporis ipsa reiciendis numquam quam!",
                                textFootter: "ฉันคือ Footter1"
                            },
                            };
                            if(i !== 0){
                                dataFormat["imgStyle"] = defaultImgStyle;
                                dataFormat["navigator"] = false;
                            }
                            dataFormat["id"] = fetchData[i].id;
                            dataFormat["imgUrl"] = fetchData[i].content_image;
                            dataFormat["text"]["textHead"] = fetchData[i].content_name;
                            dataFormat["text"]["textBody"] = fetchData[i].content_detail;
                            dataFormat["text"]["textFootter"] = fetchData[i].content_link_to_text;
                            finishDataFormat.push(dataFormat);
                        }
                        // setImageData(finishDataFormat);
                        setImageDataState(finishDataFormat);
                        setTimeout(function(){
                            setCurrentText(finishDataFormat[0]["text"], "show", slideImage("slideShowText", "1.5s"))
                        }, 550);
                        
                    }else{
                        console.log(response.data);
                    }
                    
                })
                .catch((error) =>{
                    console.log(error)
            });
        
    }

    useEffect(() => {
        handleFetch();
        // console.log(imageData);
        addKeyFrames("slideShowLeftArrow", "-100%", "0%", "left");  // เอารูปจากซ้ายมา show
        addKeyFrames("slideHideLeftArrow", "0%", "100%", "left"); // hide
        addKeyFrames("slideShowRightArrow", "100%", "0%", "left");  // เอารูปจากขวามา show
        addKeyFrames("slideHideRightArrow", "0%", "-100%", "left");  // hide
        addKeyFrames("slideHideRightArrow", "0%", "-100%", "left");  // hide
        // textAnimaitonShow ไม่เข้าใจเหมือนกันทำไมไม่เขียน css
        addKeyFrames2(
            "slideShowText",
            [
                {
                    percent: "0%",
                    cssAttribute: [
                        {
                        attribute: "top",
                        value: "100%",
                    },
                        {
                        attribute: "opacity",
                        value: "0",
                    }
                ],
                },
                {
                    percent: "25%",
                    cssAttribute: [
                        {
                        attribute: "top",
                        value: "0%",
                    },
                        {
                        attribute: "opacity",
                        value: ".2",
                    },
                ],
                },
                {
                    percent: "50%",
                    cssAttribute: [
                        {
                        attribute: "opacity",
                        value: ".8",
                    }
                ],
                },
                {
                    percent: "100%",
                    cssAttribute: [
                        {
                        attribute: "opacity",
                        value: "1",
                    }
                ],
                },
            ]
        )
        // end textAnimaitonShow ไม่เข้าใจเหมือนกันทำไมไม่เขียน css
        if(imageRef.current !== null) setIntroductionMainHeight(`${imageRef.current.offsetHeight}px`);
    }, [])

    function handleSlideImage(showStyle, hideStyle, imageData, hideImageIndex, showImageIndex){
        let imageDatas = imageData;
        let newShowImageIndexs = showImageIndex;
        let currentText = "";
        if(newShowImageIndexs < 0){
            newShowImageIndexs = imageData.length - 1;
        }else if (newShowImageIndexs >= imageDatas.length){
            newShowImageIndexs = 0;
        }

        showStyle["position"] = "absolute";
        showStyle["height"] = introductionMainHeight;
        showStyle.animationDuration = ".3s";
        hideStyle["position"] = "absolute";

        for(let i = 0; i < imageDatas.length; i++){
            imageDatas[i].navigator = false;
            if(i === newShowImageIndexs){
                imageDatas[i].imgStyle = showStyle;
                imageDatas[i].navigator = true;
                currentText = imageDatas[i].text;
            }else if(i === hideImageIndex){
                imageDatas[i].imgStyle = hideStyle;
            }else{
                imageDatas[i].imgStyle = defaultImgStyle;
            }
            imageDatas[i].className = i;
        }

        // setTimeout(function(){
        //     setCurrentTextAnimation({
        //         textData: currentText,
        //         textStyle: hideStyle,
        //     });
        // }, 150);
        setTimeout(function(){
            setCurrentText(currentText, "show", slideImage("slideShowText", "1.5s"))
        }, 550);

        setCurrentText(currentText, "hide", {opacity: "0"})

        setCurrentImageIndex(newShowImageIndexs);
        setImageDataState(imageDatas);
    }

    function setCurrentText(currentText, status, style) {
        if(status === "hide")
        {
            setCurrentTextAnimation({
                textData: currentText,
                textStyle: style,
            });
        }else if(status === "show"){
            setCurrentTextAnimation({
                textData: currentText,
                textStyle: style,
            });
        }
        
    }

    return(
        <div className="introduction-container">
            {
                loading === false
                ?
                <div className="introduction-wrapper" style={ introductionWrapperStyle }>
                    <IntroductionGallery refs={ imageRef } imageData={ imageDataState }>
                        <TextAnimation textData={ currentTextAnimation.textData } styles={ currentTextAnimation.textStyle }/>
                        {/* <TextAnimation textData={ currentTextAnimation } styles={ slideImage("slideShowText", "1s") }/> */}
                    </IntroductionGallery>
                    <ArrowLeft leftClick={ () => { handleSlideImage(
                                                                    // slideImage("slideShow", "-100%", "0%", "left"),  // เอารูปจากซ้ายมา show
                                                                    // slideImage("slideHide", "0%", "100%", "left"), // hide
                                                                    slideImage("slideShowLeftArrow"),
                                                                    slideImage("slideHideLeftArrow"),
                                                                    imageDataState, 
                                                                    currentImageIndex,
                                                                    currentImageIndex -= 1, 
                                                                    ); } } />
                    <ArrowRight rightClick={ () => { handleSlideImage(
                                                                    // slideImage("slideShow", "100%", "0%", "left"),  // เอารูปจากขวามา show
                                                                    // slideImage("slideHide", "0%", "-100%", "left"),  // hide
                                                                    slideImage("slideShowRightArrow"),
                                                                    slideImage("slideHideRightArrow"),
                                                                    imageDataState, 
                                                                    currentImageIndex,
                                                                    currentImageIndex += 1, 
                                                                    ); } } />
                    <ImageNavigation imageData={ imageDataState } />
                </div>
                :""
            }
            
        </div>
    )
}