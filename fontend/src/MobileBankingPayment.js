import { useRef, useState, useEffect, createRef, Component } from "react";
import ServerUrl from './ServerUrl.js';
import { useSelector, useDispatch } from 'react-redux';
import MyFunction from './myLib/MyFunction';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import io from 'socket.io-client'
import "./mobileBankingPayment.css"
import "./cssRoot.css"
var md5 = require('md5');

export default function MobileBankingPayment({ totalPayments }) {
    const userAccessToken = useSelector((state) => state.counter.userToken.tokenAccess);
    const [qrPaymentPath, setQrPaymentPath] = useState("");
    const prompayName = "นายวณัฐพงศ์ บุญปัญญา";
    const prompayNo = "0865297465";

    const containerStyle = {
        // height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        textAlign: "center",
    }
    const prompayImage = {
        maxWidth: "300px",
    }
    const fontBold = {
        fontWeight: "bold",
    }
    function getQrPayment(totalPayments) {
        let axiosConfigs = axiosConfig(userAccessToken);
        const serverUrl = `${ServerUrl().rootUrl}api/get-qrPayment/${totalPayments}`;
        axiosConfigs.method = "GET";
        axiosConfigs.url = serverUrl;
        axios(axiosConfigs)
            .then((response) => {
                console.log(response.data);
                setQrPaymentPath(response.data.data.qrPath);
            })
            .catch((error) => {
                console.log(error)
            });
    }
    useEffect(() => {
        // getQrPayment(totalPayments);
        let axiosConfigs = axiosConfig(userAccessToken);
        const serverUrl = `${ServerUrl().rootUrl}api/get-qrPayment/${totalPayments}`;
        axiosConfigs.method = "GET";
        axiosConfigs.url = serverUrl;
        axios(axiosConfigs)
            .then((response) => {
                setQrPaymentPath(response.data.data.qrPath);
            })
            .catch((error) => {
                console.log(error)
            });
        // console.log(totalPayments)
    });

    return (

        <div style={containerStyle}>
            <div className="qr-wrapper">
                <h3>QR PAYMENT</h3>
                <h3 className="mt-05">prompay</h3>
                <p><span style={fontBold}>ชื่อ </span>{prompayName}</p>
                <p><span style={fontBold}>พร้อมเพย์ </span>{prompayNo}</p>
                <div style={prompayImage}>
                    <img src={qrPaymentPath} alt="" style={{ width: "300px" }} />
                </div>
            </div>

        </div>
    )
}