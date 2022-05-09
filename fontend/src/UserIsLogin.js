import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'universal-cookie';
import { fas } from '@fortawesome/fontawesome-free-solid'
import { Link } from "react-router-dom";
import axios from "axios";
import ServerUrl from './ServerUrl.js';
import { checkTokenExpired, setRefeshToken, handleSetCookkieUserdata } from './counterSlice'
import { useSelector, useDispatch } from 'react-redux';
import './userIsLogin.css';
const serverUrl = ServerUrl().rootUrl;
const cookies = new Cookies();
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

export const refeshTokens = (workType) => {
    let cookkieSession = getDataInCookie("userData");

    if (cookkieSession !== null && cookkieSession.isLogin === true) {
        return new Promise((resolve, reject) => {
            let returnData = {};
            if (checkTokenExpired(cookkieSession.expiresIn) === true && workType === "refeshToken") {

                axiosConfig.url = serverUrl + "api/refeshToken";
                axiosConfig.data = { token: cookkieSession };
                // การเขียนแบบ return promise for async await
                axios(axiosConfig)
                    .then((response) => {
                        returnData = response.data;
                        returnData["type"] = "refeshToken";
                        resolve(returnData);
                    })
                    .catch((error) => {
                        console.error(error);
                        reject(error);
                    });


            } else if (checkTokenExpired(cookkieSession.expiresIn) === false && workType === "token") {
                returnData["type"] = "token";
                resolve(returnData);
            }
        });
    }
};

export function getDataInCookie(key) {
    return JSON.parse(localStorage.getItem(key));
    // return cookies.get(key);
}

export default function UserIsLogin() {
    let [userData, setUserDatas] = useState(getDataInCookie("userData"));
    return (
        <li className="user-container">
            <span>{userData.firstname}</span>
        </li>
    );
}
