import { parse } from '@fortawesome/fontawesome-svg-core';
import { useRef, useState, useEffect } from "react";
import Cookies from 'universal-cookie';
import { useCookies } from 'react-cookie'
import { createSlice } from '@reduxjs/toolkit'
import axios from "axios";
import ServerUrl from './ServerUrl.js';
import UserIsLogin, { getDataInCookie } from './UserIsLogin.js';
import MyLib from './myLib/MyFunction.js';
import { useSelector, useDispatch } from 'react-redux';
import { setIsLogin as setIsLogins } from './counterSlice';
const cookies = new Cookies();
const MyLibs = new MyLib();
// file ที่ใช้ร่วมกัน store.js index.js app.js counterSlice.js ลองหาดูเอาเผื่อลืม

const axiosConfig = {
    method: 'POST',
    url: "",
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6Im15R2lybGZyaWVuZCJ9LCJpYXQiOjE2MzM3NjczMTYsImV4cCI6MTYzMzc5ODc5OX0.nAYD9bEeGfCSQliyRxSpelvFgBUo2KSaSKXcqQ-PN8M',
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: "",
};

const serverUrl = ServerUrl().rootUrl;


const initialState = {
    // เพิ่ม state ได้ หลายตัว เพื่อเอาไปใช้ หลาย function
    countProductInCart: 0,
    totalPriceInOrder: 0,
    totalSumPrice: 0,
    productCartData: [],
    isAddProductActive: {
        status: false,
        currentProductId: "",
        pathImg: "",
        productDetailValue: "",
    },
    shoppingInformation: {
        email: "",
        firstname: "",
        lastname: "",
        address: "",
        country: "",
        province: "",
        district: "",
        subDistrict: "",
        postcode: "",
        phone: "",
        discountCode: "",
        shipping: {},
    },
    userToken: {
        tokenAccess: "",
    },
    meWalletLogin: {
        userRef: "",
        userToken: "",
        isLogin: false,
        firstname: "",
        lastname: "",
    }
}

function calCountItemInCart(productsData) {
    let countProductCart = 0;
    for (let i = 0; i < productsData.length; i++) {
        countProductCart += parseInt(productsData[i].productQuantity);
    }
    return countProductCart;
}

function calculateTotalPrice(productData) {
    if (productData === undefined) return
    let productSumPrice = 0;
    if (parseFloat(productData.productDiscountPrice) !== 0) {
        productSumPrice = parseFloat(productData.productDiscountPrice) * parseFloat(productData.productQuantity);
    } else {
        productSumPrice = parseFloat(productData.productPrice) * parseFloat(productData.productQuantity);
    }
    return productSumPrice;
}
function calculateTotalOrderPrice(productData) {

    let productSumPrice = 0;
    for (let i = 0; i < productData.length; i++) {
        productSumPrice += parseFloat(productData[i].productTotalPrice);
    }
    return productSumPrice
}
export function checkTokenExpired(tokenDateExpires) {
    const date = MyLibs.createDate();
    const startDate = date.fullFormat;
    const expiresIn = MyLibs.calculateDays(startDate, tokenDateExpires);
    let returnData = true;
    if (expiresIn.asSeconds < 0) {
        returnData = false;
    }
    return returnData;
}

export function checkProductSame(product, productsData) {
    let checkSameStatus = false;
    for (let i = 0; i < productsData.length; i++) {
        if (productsData[i].inventoryId === product.productInventoryId) {
            // productsData[i].productQuantity = parseInt(productsData[i].productQuantity) + parseInt(product.quantityInput);
            // productsData[i].productTotalPrice = calculateTotalPrice(productsData[i])
            checkSameStatus = true;
            break;
        }
    }
    return checkSameStatus;
}

export function handleSetCookkieUserdata(data, key = "") {
    // cookies.remove('userData', { path: '/'});
    // callback();
    if (key === "") {
        localStorage.removeItem('userData');
        localStorage.setItem('userData', JSON.stringify(data));
    } else {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(data));
    }

}

export const counterSlice = createSlice(
    {
        name: 'counter',
        initialState, // state ข้างบน
        reducers: {
            increment: (state) => {
                state.countProductInCart += 1 // เข้าถึง initialState.value
            },
            decrement: (state) => {
                state.countProductInCart -= 1
            },
            loadProductInCart: (state, productCartData) => {
                const productsCartData = productCartData.payload;
                state.productCartData = productsCartData;
                state.countProductInCart = calCountItemInCart(productsCartData)
            },
            addProductToCartF: (state, productData) => { // add product to cart ให้มาทำที่นี่ อิอิจะสามารถนำ data ไปใช้ได้ทุก component
                if (productData.payload === false) return;
                let productsData = state.productCartData;
                function checkProductSame(product) {
                    let checkSameStatus = false;
                    for (let i = 0; i < productsData.length; i++) {
                        if (productsData[i].inventoryId === product.inventoryId && productsData[i].productDetailValue === product.productDetailValue) {
                            productsData[i].productQuantity = parseInt(productsData[i].productQuantity) + parseInt(product.productQuantity);
                            productsData[i].productTotalPrice = calculateTotalPrice(productsData[i])
                            checkSameStatus = true;
                            break;
                        }
                    }
                    state.productCartData = productsData;
                    return checkSameStatus;
                }
                if (checkProductSame(productData.payload) === false) {
                    productData.payload.productTotalPrice = calculateTotalPrice(productData.payload)
                    state.productCartData.push(productData.payload);
                }
                state.countProductInCart = calCountItemInCart(productsData)
            },
            changeProductQuantity: (state, detailForChange) => {
                // ถ้าอยากให้ state เปลี่ยนและ rerender ห้ามทำแบบนี้ ไม่ต้องเอาตัวแปรมารับค่า ให้เข้าถึง state ที่ต้องการเปลี่ยนเลย
                let productsData = state.productCartData;  // XXX fail วิธีที่ผิด
                const dataChange = detailForChange.payload;
                state.productCartData[parseInt(dataChange.indexChange)].productQuantity = parseInt(dataChange.newQuantity); // true วิธีที่ถูก
                state.productCartData[parseInt(dataChange.indexChange)].productTotalPrice = calculateTotalPrice(state.productCartData[parseInt(dataChange.indexChange)]); // true
                state.countProductInCart = calCountItemInCart(state.productCartData)
            },
            deleteProductInCart: (state, indexForDelete) => {
                const indexDelete = indexForDelete.payload;
                state.productCartData.splice(parseInt(indexDelete), 1)
                state.countProductInCart = calCountItemInCart(state.productCartData)
            },
            calTotalPriceInCart: (state) => {
                state.totalPriceInOrder = calculateTotalOrderPrice(state.productCartData);
            },
            setIsAddProductActive: (state, productData) => {

                if (
                    state.isAddProductActive.currentProductId !== state.productCartData[(state.productCartData.length - 1)].inventoryId ||
                    state.isAddProductActive.productDetailValue !== state.productCartData[(state.productCartData.length - 1)].productDetailValue
                ) {
                    state.isAddProductActive.status = true;
                } else {
                    state.isAddProductActive.status = false;
                }
                state.isAddProductActive.currentProductId = state.productCartData[(state.productCartData.length - 1)].inventoryId;
                state.isAddProductActive.productDetailValue = state.productCartData[(state.productCartData.length - 1)].productDetailValue;
                state.isAddProductActive.pathImg = state.productCartData[(state.productCartData.length - 1)].productImageUrl;

            },
            handleSetShoppingInformation: (state, data) => {
                const datas = data.payload;
                state.shoppingInformation[datas.key] = datas.value;
                if (typeof state.shoppingInformation[datas.key] === "string") state.shoppingInformation[datas.key].replace("undefined", "");
                if (datas.key === "shipping") state.totalSumPrice = parseFloat(state.totalPriceInOrder) + parseFloat(datas.value.price);
            },
            setRefeshToken: (state, tokenData) => {
                state.userToken.tokenAccess = tokenData.payload.tokenAccess;
            },
            setIsLogin: (state, userData) => {
                let data = userData.payload;
                if (data.isLogin === true) {
                    // state.userData = data;
                    state.shoppingInformation.firstname = data.firstname;
                    state.shoppingInformation.lastname = data.lastname;
                    handleSetCookkieUserdata(data)
                }
            },
            checkMeWalletLogin: (state, meWalletData) => {
                let data = meWalletData.payload;
                let meWalletCookie = getDataInCookie("meWalletCookie")

                state.meWalletLogin.userRef = data.userKey;
                state.meWalletLogin.userToken = data.userId;
                handleSetCookkieUserdata(data, "meWalletCookie")
            }
        }
    }
)

export const {
    increment,
    decrement,
    addProductToCartF,
    changeProductQuantity,
    deleteProductInCart,
    calTotalPriceInCart,
    setIsAddProductActive,
    handleSetShoppingInformation,
    setIsLogin,
    setRefeshToken,
    loadProductInCart,
    checkMeWalletLogin,
} = counterSlice.actions;
export default counterSlice.reducer;