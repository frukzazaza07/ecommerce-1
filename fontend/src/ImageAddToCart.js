import { useRef, useState, useEffect, createRef, Component } from "react";
import { useSelector, useDispatch } from 'react-redux';// useSelector = เข้าถึงข้อมูล  useDispatch = ส่งออก action การนำ react-redux เพื่อนำ props ไปใช้ทุก component
import './imageAddToCart.css'
export default function ImageAddToCart(){
    const productInCart = useSelector((state) => state.counter.productCartData);
    const isAddProductActive = useSelector((state) => state.counter.isAddProductActive);
    return (
        <div className={`product-image-wrapper${isAddProductActive !== undefined && isAddProductActive.status === true ? " add-product-active" : " add-product-hide"}`}>
            <img src={isAddProductActive !== undefined ? isAddProductActive.pathImg : "" } alt="" />
        </div>
    )
}