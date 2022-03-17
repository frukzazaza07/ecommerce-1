import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/fontawesome-free-solid'
import { Link } from "react-router-dom";
import Cookies from 'universal-cookie';
import axios from "axios";
import ServerUrl from './ServerUrl.js';
import MyLib from './myLib/MyFunction.js';
import { useSelector, useDispatch } from 'react-redux';
import { setIsLogin, handleSetCookkieUserdata, setRefeshToken } from './counterSlice';
import Spinner from "./Spinner.js";
import { Redirect } from "react-router-dom";
import "./login.css"
import "./checkout.css";
import history from "./history.js";
import logo from './image/logo/logo.jpg'; // Tell webpack this JS file uses this image
const cookies = new Cookies();
const MyLibs = new MyLib();
export default function Login() {
    const disPatch = useDispatch();
    let [dataForSent, setDataForSent] = useState({
        username: "",
        password: "",
    });

    const [axiosConfig, setAxiosConfig] = useState({
        method: 'POST',
        url: "",
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6Im15R2lybGZyaWVuZCJ9LCJpYXQiOjE2MzM3NjczMTYsImV4cCI6MTYzMzc5ODc5OX0.nAYD9bEeGfCSQliyRxSpelvFgBUo2KSaSKXcqQ-PN8M',
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: "",
    });

    let [onBtnClick, setOnBtnClick] = useState("");
    let [validateFail, setValidateFail] = useState([]);
    let [forceRerender, setForceRerender] = useState("");
    function handleDataForSent(value, key) {
        let data = dataForSent;
        data[key] = value
        setDataForSent(data);
        setForceRerender(value);
        validateInput(300, key);
    }
    function handleSentData() {
        setOnBtnClick("disabled");
        if (validateInput(800) > 0) {
            setTimeout(() => {
                setOnBtnClick("");
            }, 700)
            return;
        }
        const serverUrl = ServerUrl().rootUrl + "api/loginToken";
        axiosConfig.url = serverUrl;
        axiosConfig.data = dataForSent;

        axios(axiosConfig)
            .then((response) => {
                if (response.data.status === true) {
                    const userData = response.data.data;
                    let dataSetToken = {
                        tokenAccess: userData.refeshToken,
                    };
                    // handleSetCookkieUserdata(dataSetToken, "token");
                    disPatch(setIsLogin(userData));
                    setTimeout(() => {
                        setOnBtnClick("");
                        // disPatch(setRefeshToken(dataSetToken));
                        setForceRerender("rerender now");
                        // history.push('/home');
                        window.location.reload();
                    }, 1600)

                    //   const classCheckLogin = new CheckLogin()
                    //   classCheckLogin.setLogin(userData);
                } else {
                    throw response.data;
                }
            })
            .catch((error) => {
                console.error(error);
                setTimeout(() => {
                    setOnBtnClick("");
                }, 700)
            });
    }

    function validateInput(milliseconds, keyCheck = "") {
        let dataForSents = dataForSent;
        if (keyCheck !== "") {
            dataForSents = {};
            dataForSents[keyCheck] = dataForSent[keyCheck];
        }
        let validate1 = MyLibs.checkEmpty(dataForSents);
        let validate2 = MyLibs.checkSpecialCharacter(
            dataForSents,
            [],
            /[ `#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
        );
        let validate3 = MyLibs.checkString(dataForSents);
        let errorValidate = [];
        errorValidate = validate1.concat(validate2, validate3);


        if (keyCheck === "") {
            setTimeout(() => {
                setValidateFail(errorValidate);
            }, milliseconds)
        } else {
            // setValidateFail(keyCheck, errorValidate);
            removeValidateData(keyCheck, errorValidate); // เช็คว่าแก้ไข error แล้วหรือยัง
        }
        return errorValidate.length;
    }
    function checkFieldValidateError(fieldName, dataCheck) {
        if (dataCheck.length === 0) return
        let validateFail = dataCheck;
        let returnData = true;
        for (let i = 0; i < validateFail.length; i++) {
            if (validateFail[i].field === fieldName) {
                returnData = validateFail[i].field;
                break;
            }
        }
        return returnData;
    }

    function removeValidateData(fieldName, errorValidate) {
        // setValidateFail(errorValidate);
        if (errorValidate.length !== 0) return;
        let returnData = validateFail;
        if (errorValidate.length === 0) {
            for (let i = 0; i < validateFail.length; i++) {
                if (validateFail[i].field === fieldName) {
                    returnData.splice(i, 1);
                    setValidateFail(returnData);
                    break
                }
            }
        }

    }

    return (
        <div className="login-container">
            <form className="login-wrapper">
                <div className="login-header">
                    <img src={logo} alt="" />
                </div>
                <div className="login-body">
                    <div className="form-group">
                        <input id="username" className={`form-input${checkFieldValidateError("username", validateFail) === "username" ? " input-error" : ""}`} type="text" minLength="256" maxLength="255" value={dataForSent.username} onChange={(e) => { handleDataForSent(e.target.value, "username") }} />
                        <label className={`${dataForSent.username !== undefined && dataForSent.username.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Username</label>
                    </div>
                    <div className="form-group">
                        <input id="password" className={`form-input${checkFieldValidateError("password", validateFail) === "password" ? " input-error" : ""}`} type="password" minLength="256" maxLength="255" value={dataForSent.password} onChange={(e) => { handleDataForSent(e.target.value, "password") }} />
                        <label className={`${dataForSent.password !== undefined && dataForSent.password.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Password</label>
                    </div>
                    <button type="button" className="btn btn-sm color-white btn-full-width bg-02416d" disabled={onBtnClick} onClick={() => { handleSentData(); }}>
                        {onBtnClick === "disabled" ? <Spinner /> : ""}
                        <span>เข้าสู่ระบบ</span>
                    </button>
                </div>
                <div className="login-footter">
                    <div className="choice-login">
                        <div><span className="line"></span></div>
                        <div><span>หรือ</span></div>
                        <div><span className="line"></span></div>
                    </div>
                    <button type="button" className="btn btn-sm btn-full-width bg-white">เข้าสู่ระบบด้วย Facebook</button>
                    <div className="register-navigator">
                        <span>ยังไม่มีบัญชีเหรอ? </span>
                        <Link to="/register" className="color-FFAB21">ลงทะเบียน</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}