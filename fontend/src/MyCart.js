import { useRef, useState, useEffect, createRef, Component } from "react";
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';// useSelector = เข้าถึงข้อมูล  useDispatch = ส่งออก action การนำ react-redux เพื่อนำ props ไปใช้ทุก component
import { changeProductQuantity, deleteProductInCart, calTotalPriceInCart } from './counterSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getProductDetail } from './AddProductCart'
import InputQuantity from './InputQuantity'
import { fas } from '@fortawesome/fontawesome-free-solid'
import { axiosConfig } from './axiosConfig.js';
import Myfunction from "./myLib/MyFunction.js";
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import "./myCart.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
const myfunction = new Myfunction()

async function deleteItemInCart(subCartId) {
    const validateError = myfunction.checkNumeric([subCartId]);
    if (validateError.length > 0) return
    try {
        const bodyData = {
            subCartId: subCartId,
            secret: "juju",
        }
        axiosConfigs.method = "POST";
        let url = rootUrl + `api/delete-product-inCart`;
        axiosConfigs.url = url;
        axiosConfigs.data = { data: JSON.stringify(bodyData) };
        const productModelData = await axios(axiosConfigs);
        if (productModelData.data.status === false) {
            throw new Error({
                productModelData: productModelData,
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function updateQuantityProductInCart(subCartId, newQuantity, inventoryId) {
    const validateError = myfunction.checkNumeric([subCartId, newQuantity, inventoryId]);
    if (validateError.length > 0) return
    try {
        const bodyData = {
            subCartId: subCartId,
            newQuantity: newQuantity,
            inventoryId: inventoryId,
            secret: "juju",
        }
        axiosConfigs.method = "POST";
        let url = rootUrl + `api/update-quantity-product-inCart`;
        axiosConfigs.url = url;
        axiosConfigs.data = { data: JSON.stringify(bodyData) };
        const productModelData = await axios(axiosConfigs);
        if (productModelData.data.status === false) {
            throw new Error({
                productModelData: productModelData,
            })
        }
    } catch (error) {
        console.log(error)
    }
}

function arrowAnimation(animationName, from, to) {
    let keyframes = `@keyframes ${animationName} { 0% { width: ${from}; } 100% { width: ${to}; } }`;
    let style = {
        animation: `${animationName} .3s linear forwards`,
    };
    let styleSheet = document.styleSheets[0];
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    return style;
}

function ListItemInCart({ productsData }) {
    const disPatch = useDispatch();
    function handleQuantityInput(index, newQuantity, subCartId, inventoryId) {
        let detailForChange = {
            indexChange: index,
            newQuantity: newQuantity,
        };
        updateQuantityProductInCart(subCartId, newQuantity, inventoryId)
        disPatch(changeProductQuantity(detailForChange))
    }

    function handleProductInCart(indexDelete) {
        // console.log(indexDelete)
        disPatch(deleteProductInCart(indexDelete))
    }

    return (
        productsData.length === 0
            ?
            <li className="no-product">ไม่มีสินค้าในตระกร้า</li>
            :
            productsData.map((value, index) => (
                <li key={index} className="cart-list-item">
                    <div className="cart-list-image">
                        <img src={value.productImageUrl} alt="" />
                    </div>
                    <div className="cart-list-detail">
                        <h4>{value.productName}</h4>

                        {
                            value.product_storage_key_text === undefined || value.product_storage_key === ""
                                ? ""
                                : <p className="topic">{value.product_color_key_text}: <span>{value.product_color_name}</span></p>
                        }
                        {
                            value.product_storage_key_text === undefined || value.product_storage_key === ""
                                ? ""
                                : <p className="topic d-block">{value.product_storage_key_text}: <span>{value.product_storage_name}</span></p>
                        }

                        <p className="cart-list-price-detail">
                            <span className="topic">ราคา:</span>
                            {
                                value.productDiscountPrice === 0
                                    ?
                                    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productPrice)
                                    :
                                    <div>
                                        <span className="cart-discount-price">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productPrice)}</span>
                                        <span>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productDiscountPrice)}</span>
                                    </div>
                            }

                        </p>
                    </div>
                    <div className="cart-list-quantity product-quantity">
                        <InputQuantity quantityInput={value.productQuantity} subCartId={value.subCartId} inventoryId={value.inventoryId} setQuantityInput={(value, subCartId, inventoryId) => { handleQuantityInput(index, value, subCartId, inventoryId) }} />
                    </div>
                    <div className="cart-list-totalPrice">
                        <p>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productTotalPrice)}</p>
                    </div>
                    <div>
                        <button className="delete-list-product" onClick={() => { handleProductInCart(index); deleteItemInCart(value.subCartId); }}>
                            <FontAwesomeIcon icon={['fa', 'window-close']} />
                        </button>
                    </div>
                </li>
            ))
    )
}

export default function MyCart() {
    // จำไว้ว่า data ที่มาจาก react-redux ให้นำมาใช้เลยไม่ต้องไปสร้างstate มาเก็บซ้ำ
    const productInCart = useSelector((state) => state.counter.productCartData);  // (state) => state.counter.productCartData ความหมายคือ return state.counter.value เลย
    const totalPriceInOrder = useSelector((state) => state.counter.totalPriceInOrder);  // (state) => state.counter.productCartData ความหมายคือ return state.counter.value เลย
    let arrowRef = useRef(null);
    let [arrowStyle, setArrowStyle] = useState({});
    const disPatch = useDispatch();
    function handleArrowAnimation(status) {
        let currentArrowWidth = arrowRef.current.offsetWidth;
        const maxWidth = "20px";
        if (status === "true") {
            setArrowStyle(arrowAnimation("arrow-active", `${currentArrowWidth}px`, maxWidth))
            // setArrowAnimation(true);
        } else {
            setArrowStyle(arrowAnimation("arrow-hide", `${currentArrowWidth}px`, "0px"))
        }
    }

    useEffect(() => {
        disPatch(calTotalPriceInCart())
    });

    return (
        <div className="myCart-container">
            <div className="myCart-wrapper">
                <div className="myCart-header">
                    <h2>Your Cart</h2>
                    <div className="checkout-container">
                        <div className="sub-total">
                            <div>Subtotal</div>
                            <div><span>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPriceInOrder)}</span></div>
                        </div>
                        <button type="button" className="btn bg-orange btn-checkout"><FontAwesomeIcon icon={['fa', 'shopping-cart']} /> Check out</button>
                    </div>
                </div>
                <div className="myCart-body">
                    <div className="list-container">
                        <div className="list-body">
                            <ul className="cart-list-main">
                                <ListItemInCart productsData={productInCart} />
                            </ul>
                        </div>
                        <div className="list-footter">
                            <div className="list-item-header">
                                <div>Subtotal</div>
                                <div>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPriceInOrder)}</div>
                            </div>
                            <div className="list-item-body">
                                <p>Taxes and shipping calculated at checkout</p>
                            </div>
                            <div className="list-item-footter">
                                <p>Calculated Shipping</p>
                                <div className="calculated-shipping-container"></div>
                                <Link to="/checkout"><button type="button" className="btn bg-orange btn-checkout"><FontAwesomeIcon icon={['fa', 'shopping-cart']} /> Check out</button></Link>
                                <div className="continue-shopping">
                                    <span className="continue-shopping-text" onMouseEnter={() => { handleArrowAnimation("true") }} onMouseOut={() => { handleArrowAnimation("false") }}>
                                        Continue Shopping
                                    </span>
                                    <span ref={arrowRef} className="arrow-1" style={arrowStyle}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shipping-detail-container"></div>
                </div>
                <div className="myCart-footter"></div>
            </div>
        </div>
    )
}