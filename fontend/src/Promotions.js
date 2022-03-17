import { useRef, useState, useEffect } from "react";
import { HashRouter as Router, Route, Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/fontawesome-free-solid';
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import {axiosConfig} from './axiosConfig.js';
import "./promotions.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
function PromotionsList({ promotionsData }){

    return (
            promotionsData.map((value, index) => (
                <div key={ index } className={`promotions-main ${value.className}`} style={ value.style }>
                    <div className="promotions-body">
                        <h2 className="promotions-item-header">
                            { value.headerText }
                        </h2>
                        <p className="promotions-item-body">
                            { value.bodyText }
                        </p> 
                        <p className="promotions-item-body">
                            { value.buttonText !== undefined ? <button type="button" className="btn bg-orange">{ value.buttonText }</button> : "" }
                        </p>
                    </div>
                </div>
            ))
    )

}

function setPromotionsPosition(promotions){
    let promotionsData = promotions;
    for(let i = 0; i < promotionsData.length; i++){
        promotionsData[i]["className"] = "";
        if(i === 0 || i === promotionsData.length -1){
            promotionsData[i]["className"] = "grid-column-start-2";
        }
        promotionsData[i]["style"] = {
            backgroundImage: `url(${promotionsData[i].imageUrl})`,
            opacity: ".8",
        };
    }
    return promotionsData;
}

export default function Promotions() {
    // const promotionsFakeData = [
    //     {
    //         imageUrl: "https://i.pinimg.com/originals/1a/57/04/1a5704f5cff35c7cf381860bc2889f9c.jpg",
    //         headerText: "headerText1",
    //         bodyText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi, beatae?",
    //         buttonText: "Shop Brand",
    //     },
    //     {
    //         imageUrl: "https://travel.mthai.com/app/uploads/2014/07/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%97%E0%B8%B0%E0%B9%80%E0%B8%A5%E0%B8%AA%E0%B8%A7%E0%B8%A2.jpg",
    //         headerText: "headerText2",
    //         bodyText: "Lorem ipsum dolor sit amet, ",
    //         buttonText: "Shop All",
    //     },
    //     {
    //         imageUrl: "https://www.jps2013.com/wp-content/uploads/2020/10/FRE-A-22-EX.jpg",
    //         headerText: "headerText3",
    //         bodyText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi, beatae?",
    //         buttonText: "Shop All",
    //     },
    //     {
    //         imageUrl: "https://1.bp.blogspot.com/-GgxzPL0fIrg/V-3e1ZbAMOI/AAAAAAAAmuE/zYrkd8duZmcSOMFqCgq2fJXD-HfcsCi9wCLcB/s1600/win10-02.jpg",
    //         headerText: "headerText4",
    //         bodyText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi eveniet dignissimos, quod ex sapiente facilis.",
    //         buttonText: "Shop Sales",
    //     },
    // ];
    let [promotions, setPromotions] = useState([]);
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotionsContents();
    }, []);

    function handleDataForFontendFormat(data){
        let returnData = [];
        for(let i = 0; i < data.length; i++) {
            let format = {
                imageUrl: "",
                headerText: "",
                bodyText: "",
                buttonText: "",
            }
            format.imageUrl = data[i].content_image;
            format.headerText = data[i].content_name;
            format.bodyText = data[i].content_detail;
            format.buttonText = data[i].content_link_to_text;
            returnData.push(format);
        }
        return returnData;
    }

    function fetchPromotionsContents(){
        let apiContentsURL = rootUrl + "api/load-content/3"
            axiosConfigs.method = "GET";
            axiosConfigs.url = apiContentsURL;
            axios(axiosConfigs)
                .then((response) => {
                setLoading(false);
                    if(response.data.status === true){
                        setPromotions(setPromotionsPosition(handleDataForFontendFormat(response.data.data)));
                    }else{
                        console.log(response.data);
                        setLoading(false);
                    }
                })
                .catch((error) => {})
    }

    return (
        <div className="promotions-container">
            {
                loading === false
                ?
                    <div className="promotions-wrapper">
                        <PromotionsList promotionsData={ promotions } />
                    </div>
                :""
            }
            
        </div>
    )

}