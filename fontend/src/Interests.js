import { useRef, useState, useEffect } from "react";
import { HashRouter as Router, Route, Link, BrowserRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/fontawesome-free-solid';
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import {axiosConfig} from './axiosConfig.js';
import "./interests.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
function InterestsElem({ interestsData }){

    return (
            interestsData.map((value, index) => (
                <div key={ index } className="interests-main">
                    <div className="interests-header">
                        <FontAwesomeIcon icon={[value.header.iconType, value.header.iconName]} />
                    </div>
                    <div className="interests-body">
                        <h2 className="interests-item-header">
                            { value.body.headerText }
                        </h2>
                        <p className="interests-item-body">
                            { value.body.bodyText }
                        </p>
                    </div>
                </div>
            ))
    )

}

export default function Interests() {
    // const interestsFakeData = [
    //     {
    //         header: {
    //                 iconType: "fas",
    //                 iconName: "shopping-cart",
    //             },
    //         body: {
    //                 headerText: "myHeader1",
    //                 bodyText: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Qui, accusantium.",
                    
    //             },
    //     },
    //     {
    //         header: {
    //                 iconType: "fas",
    //                 iconName: "gift",
    //             },
    //         body: {
    //                 headerText: "myHeader1",
    //                 bodyText: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Qui",
                    
    //             },
    //     },
    //     {
    //         header: {
    //                 iconType: "fas",
    //                 iconName: "store-alt",
    //             },
    //         body: {
    //                 headerText: "myHeader1",
    //                 bodyText: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
    //             },
    //     },
    //     {
    //         header: {
    //                 iconType: "fas",
    //                 iconName: "percentage",
    //             },
    //         body: {
    //                 headerText: "myHeader1",
    //                 bodyText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque, ratione saepe nesciunt cupiditate perferendis eos fugit omnis dolore, deserunt ipsum, temporibus amet. Adipisci, deserunt. Debitis voluptatum cupiditate dicta minima expedita?",
    //             },
    //     },
    // ];
    let [interests, setInterests] = useState([]);
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterestsContents();
    }, []);

    function fetchInterestsContents(){
        let apiContentsURL = rootUrl + "api/load-content/2"
            axiosConfigs.method = "GET";
            axiosConfigs.url = apiContentsURL;
            axios(axiosConfigs)
                .then((response) => {
                setLoading(false);
                    if(response.data.status === true){
                        setInterests(handleDataForFontendFormat(response.data.data));
                    }else{
                        console.log(response.data);
                        setLoading(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
    }

    function handleDataForFontendFormat(data){
        let returnData = [];
        for(let i = 0; i < data.length; i++) {
            let format = {
                header: {
                        iconType: "",
                        iconName: "",
                    },
                body: {
                        headerText: "",
                        bodyText: "",
                    },
            };
            format.header.iconType = data[i].content_icon_type;
            format.header.iconName = data[i].content_icon_name;
            format.body.headerText = data[i].content_name;
            format.body.bodyText = data[i].content_detail;
            returnData.push(format);
        }
        return returnData;
    }

    return (
        <div className="interests-container">
            {
                loading === false 
                ?
                    <div className="interests-wrapper">
                        <InterestsElem interestsData={ interests } />
                    </div>
                :""
            }
            
        </div>
    )

}