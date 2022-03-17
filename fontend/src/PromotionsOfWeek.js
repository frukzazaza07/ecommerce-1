import { useRef, useState, useEffect } from "react";
import { HashRouter as Router, Route, Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/fontawesome-free-solid'
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import {axiosConfig} from './axiosConfig.js';
import "./promotionsOfWeek.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
function PromotionsOfWeekList({ promotionsData }){

    return (
            promotionsData.map((value, index) => (
                <div key={ index } className={`promotionsOfWeek-main`} style={ value.style }>
                    <div className="promotionsOfWeek-body">
                        <h2 className="promotionsOfWeek-item-header">
                            { index === 0 ? value.headerText : "" }
                        </h2>
                        <p className="promotionsOfWeek-item-body">
                            { index === 0 ? value.bodyText : "" }
                            { value.productListDetailData !== undefined ? <PromotionsOfWeekProductsList productListDetail={ value.productListDetailData } /> : "" }
                        </p> 
                        <p className="promotionsOfWeek-item-body">
                            { index === 0 ? value.buttonText : "" }
                        </p>
                    </div>
                </div>
            ))
    )

}
function PromotionsOfWeekProductsList({ productListDetail }){
    return (
            <div className={`productList-main`}>
                <div className="productList-header-wrapper">
                    <div className="productList-header">
                        <img src={ productListDetail.productImg } alt="" />
                    </div>
                </div>
                <div className="productList-body">
                    <div className="productList-item-body">
                        <p className="productListDetail-productName">{ productListDetail.productName }</p>
                        <p className={`productListDetail-productPrice ${productListDetail.pricePromotion !== "" ? "productPrice-textDecoration " : ""}`}>
                            ราคา: <FontAwesomeIcon icon={["fas", "dollar-sign"]} />{ productListDetail.productPrice }
                        </p>
                        { productListDetail.pricePromotion !== "" ? <p className="productListDetail-pricePromotion">โปรโมชั่น: <FontAwesomeIcon icon={["fas", "dollar-sign"]} />{ productListDetail.pricePromotion }</p> : "" }
                        <p className="productListDetail-productDetail">{ productListDetail.productDetail }</p>
                    </div> 
                    <p className="productList-item-body"></p>
                </div>
            </div>
    )
}

function setPromotionsOfWeekPosition(promotions){
    let promotionsData = promotions;
    for(let i = 0; i < promotionsData.length; i++){

        promotionsData[i]["style"] = {
            backgroundImage: `url(${promotionsData[i].imageUrl})`,
            opacity: ".8",
        };

        if(i === 0){
            promotionsData[i]["style"]["gridColumn"] = "span 3";
            promotionsData[i]["style"]["gridRow"] = "span 2";
            promotionsData[i]["style"]["width"] = "100%";
            promotionsData[i]["style"]["height"] = "auto";
        }

    }
    return promotionsData;
}

export default function PromotionsOfWeek() {

    const promotionsOfWeekFakeData = [
        {
            imageUrl: "https://f.ptcdn.info/754/067/000/q492oo1qi6t0cPaO6C4-o.jpg",
            headerText: "headerText1",
            bodyText: "Save up to 40%",
            buttonText: "Shop Sales",
        },
        {
            imageUrl: "",
            headerText: "headerText2",
            bodyText: "Lorem ipsum dolor sit amet, ",
            buttonText: "Shop All",
            productListDetailData: {
                    productId: 1,
                    productName: "product1",
                    productDetail: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt delectus esse necessitatibus a? Tempore, sint?",
                    productPrice: "100",
                    pricePromotion: "80",
                    priceDiscount: "20",
                    productImg: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-13-product-red-select-2021?wid=940&hei=1112&fmt=png-alpha&.v=1629907846000",
                }
        },
        {
            imageUrl: "",
            headerText: "headerText3",
            bodyText: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi, beatae?",
            buttonText: "Shop All",
            productListDetailData: {
                    productId: 2,
                    productName: "product2",
                    productDetail: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt delectus esse necessitatibus a? Tempore, sint?",
                    productPrice: "100",
                    pricePromotion: "",
                    priceDiscount: "20",
                    productImg: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MX472?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1570119347612",
                }
        },
        {
            imageUrl: "h",
            headerText: "headerText4",
            bodyText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi eveniet dignissimos, quod ex sapiente facilis.",
            buttonText: "Shop Sales",
            productListDetailData: {
                    productId: 3,
                    productName: "product3",
                    productDetail: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt delectus esse necessitatibus a? Tempore, sint?",
                    productPrice: "100",
                    pricePromotion: "80",
                    priceDiscount: "20",
                    productImg: "https://res.cloudinary.com/cenergy-innovation-limited-head-office/image/fetch/c_scale,q_70,f_auto,h_740/https://d1dtruvuor2iuy.cloudfront.net/media/catalog/product/a/p/apple_iphone_13_mini_color_midnight_1_512_gb.jpg",
                }
        },
        {
            imageUrl: "",
            headerText: "headerText5",
            bodyText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi eveniet dignissimos, quod ex sapiente facilis.",
            buttonText: "Shop Sales",
            productListDetailData: {
                    productId: 4,
                    productName: "product4",
                    productDetail: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt delectus esse necessitatibus a? Tempore, sint?",
                    productPrice: "100",
                    pricePromotion: "80",
                    priceDiscount: "20",
                    productImg: "https://d1dtruvuor2iuy.cloudfront.net/media/catalog/product/a/p/apple_iphone_13_mini_color_starlight_1_512gb_1.jpg",
                }
        },
    ];
    let [promotionsOfWeek, setPromotionsOfWeek] = useState([]);
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotionsOfWeek();
    }, []);

    function handleDataForFontendFormat(contentId, data){
        let returnData = [];
        
        for(let i = 0; i < data.length; i++){
            let fontendFormat = {
                imageUrl: "",
                headerText: "",
                bodyText: "",
                buttonText: "",
                productListDetailData: {
                        productId: "",
                        productName: "",
                        productDetail: "",
                        productPrice: "",
                        pricePromotion: "",
                        priceDiscount: "",
                        productImg: "",
                    }
            };
            if(contentId === 4){
                fontendFormat.imageUrl = data[i].content_image;
                fontendFormat.headerText = data[i].content_name;
                fontendFormat.bodyText = data[i].content_detail;
                fontendFormat.buttonText = data[i].content_link_to_text;
                fontendFormat.productListDetailData = undefined;
            }else{
                fontendFormat.productListDetailData.productId = data[i].id;
                fontendFormat.productListDetailData.productName = data[i].product_name + " " + data[i].product_model_name;
                fontendFormat.productListDetailData.productDetail = data[i].content_detail;
                fontendFormat.productListDetailData.productPrice = data[i].product_inventory_price;
                fontendFormat.productListDetailData.pricePromotion = data[i].product_discount_total_price;
                fontendFormat.productListDetailData.priceDiscount = data[i].product_discount_amount;
                fontendFormat.productListDetailData.productImg = data[i].product_inventory_image;
            }
            returnData.push(fontendFormat);
        }
        return returnData;
    }

    async function fetchPromotionsOfWeek(){
        try{
            let apiContent4sURL = rootUrl + "api/load-content/4";
            let apiContent5sURL = rootUrl + "api/load-content-discount/5";
            axiosConfigs.method = "GET";
            axiosConfigs.url = apiContent4sURL;
            let content4Data = await axios(axiosConfigs);
            axiosConfigs.url = apiContent5sURL;
            let content5Data = await axios(axiosConfigs);
            if(content4Data.data.status === false || content5Data.data.status === false)
            {
                throw new Error({
                    content4Data: content4Data,
                    content5Data: content5Data,
                })
            }
            
            content4Data = handleDataForFontendFormat(4, content4Data.data.data);
            content5Data = handleDataForFontendFormat(5, content5Data.data.data);
            let contentSuccess = content4Data.concat(content5Data);
            setLoading(false);
            setPromotionsOfWeek(setPromotionsOfWeekPosition(contentSuccess));
        }catch(error){
            console.log(error)
        }
        
    }

    return (
        <div className="promotionsOfWeek-container">
            {
                loading === false
                ?
                    <div className="promotionsOfWeek-main-wrapper">
                        <h2>Deals of the Week</h2>
                        <div className="promotionsOfWeek-wrapper">
                            <PromotionsOfWeekList promotionsData={ promotionsOfWeek } />
                        </div>
                    </div>
                :""
            }
            
        </div>
    )

}