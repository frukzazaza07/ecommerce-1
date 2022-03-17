import { useState, useEffect } from "react";
import "./styles.css";
import ServerUrl from './ServerUrl.js';
import MyHeader from "./MyHeader";
import Introduction from "./Introduction";
import Interests from "./Interests";
import Promotions from "./Promotions";
import PromotionsOfWeek from "./PromotionsOfWeek";
import ZoomProduct from "./ZoomProduct";
import MeWalletLogin from "./MeWalletLogin";
import MyCart from "./MyCart";
import Checkout from "./Checkout";
import Login from "./Login";
import CalculatorShipping from "./CalculatorShipping";
import UserIsLogin, { getDataInCookie, refeshTokens } from './UserIsLogin.js';
import { fetchProductInCart, setProductToCartDataFormat } from './LoadProductInCart';
import Cookies from 'universal-cookie';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import history from "./history";
import Myfunction from "./myLib/MyFunction.js";
import { useSelector, useDispatch } from 'react-redux';// useSelector = เข้าถึงข้อมูล  useDispatch = ส่งออก action
import { setRefeshToken, setIsLogin, checkTokenExpired, handleSetCookkieUserdata, loadProductInCart } from './counterSlice'
var md5 = require('md5');
let logo =
  "https://tradingplatforms.com/pt/wp-content/uploads/sites/27/2021/04/dogecoin-logo3.svg";
const myLib = new Myfunction();
export default function App() {
  const cookies = new Cookies();
  const count = useSelector((state) => state.counter.value);  // (state) => state.counter.value ความหมายคือ return state.counter.value เลย
  const userToken = useSelector((state) => state.counter.userToken);  // (state) => state.counter.value ความหมายคือ return state.counter.value เลย
  const userData = getDataInCookie("userData");  // (state) => state.counter.value ความหมายคือ return state.counter.value เลย
  const disPatch = useDispatch();
  const timeForCheckRefeshToken = 1000 * 60 * 5;
  let userRef = "";
  if (userData !== null && userData.isLogin === true) {
    userRef = md5(Buffer.from(userData.id.toString()).toString('base64'));
  }


  useEffect(() => {
    if (userData !== null && userData.isLogin === true) {
      disPatch(setIsLogin(userData));
      getRefeshToken("token");
      fetchProductInCartHook();
      async function fetchProductInCartHook() {
        const cartData = await fetchProductInCart(userData.id);
        const productCartFormat = setProductToCartDataFormat(cartData.data)
        disPatch(loadProductInCart(productCartFormat))
      }

    }
  }, []);
  // handleSetCookkieUserdata({}, "userData"); // ใช้ test clear cookie
  async function getRefeshToken(workType) {
    const refeshTokenData = await refeshTokens(workType);
    if (refeshTokenData !== undefined && refeshTokenData.status === true && refeshTokenData.type === "refeshToken") {
      // กรณี token หลักยังไม่หมดอายุ
      const addRefeshTokenData = await addRefeshToken(refeshTokenData);
    } else if (refeshTokenData !== undefined && refeshTokenData.type === "token") {
      // กรณี token หลักหมดอายุ
      handleSetCookkieUserdata({}, "userData");
      const addRefeshTokenData = await addRefeshToken({});
      // redirect to sigup
      history.push('/login');
      alert("Login Exprired please login again!");
      window.location.reload();
    }
  }

  function addRefeshToken(refeshTokenData) {
    return new Promise((resolve, reject) => {
      if (refeshTokenData !== undefined && refeshTokenData.status === true) {
        let dataSetToken = {
          tokenAccess: refeshTokenData.data.token,
        };
        disPatch(setRefeshToken(dataSetToken));
        // setForceRerender(refeshTokenData.data.token);
        resolve("Added token success.");
      } else {
        resolve("token ยังไม่หมดเวลา");
      }
    });

  }

  function getExpiredTokenSecond(dateEnd) {
    const startData = myLib.createDate();
    let remainingRefeshToken = myLib.calculateDays(startData.fullFormat, dateEnd);
    if (remainingRefeshToken < 0) remainingRefeshToken = 1;
    return remainingRefeshToken;
  }

  setInterval(() => {
    // disPatch(refeshToken())
    // refeshTokens();
    // check refeshToken
    getRefeshToken("refeshToken");
  }, timeForCheckRefeshToken); // 5 นาที 1000*60*5
  setInterval(() => {
    getRefeshToken("token");
  }, 1000); // 5 นาที
  // setTimeout(() => {
  // check token หมดอายุตอนสิ้นวัน
  //   getRefeshToken();
  // }, tokenExpSecond);
  return (
    // วิธีการใช้ routh <BrowserRouter> <Switch> <Route path="/my-cart"> {component} </Route> </Switch> </BrowserRouter>
    <BrowserRouter>
      <div>
        <Switch>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route path="/home">
            <MyHeader />
            <Introduction />
            <Interests />
            <Promotions />
            <PromotionsOfWeek />
            <ZoomProduct userData={userData} />
          </Route>
          <Route path="/my-cart">
            <MyHeader />
            <MyCart />
          </Route>
          <Route path="/checkout">
            <MyHeader />
            {userData !== null && userData.isLogin === true
              ?
              <Checkout userRef={userRef} userData={userData} />
              :
              <>
                <Redirect to="/login" />
              </>
            }

          </Route>
          <Route path="/login">
            {userData !== null && userData.isLogin === true
              ?
              <Redirect to="/home" />
              :
              <>
                <MyHeader />
                <Login />
              </>
            }
          </Route>
          {userData !== null && userData.isLogin === true
            ?
            <Route Route path="/meWallet-login">
              <MeWalletLogin userData={userData} userRef={userRef} />
            </Route>
            : <Redirect to="/login" />
          }

        </Switch>
      </div>
    </BrowserRouter >
  );
}
