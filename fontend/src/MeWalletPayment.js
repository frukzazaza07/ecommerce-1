import { useRef, useState, useEffect, createRef, Component } from "react";
import ServerUrl from './ServerUrl.js';
import { useSelector, useDispatch } from 'react-redux';
import MyFunction from './myLib/MyFunction';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import "./meWalletPayment.css"
import "./cssRoot.css"
var md5 = require('md5');

export default function MeWalletPayment({ userData }) {
    const shoppingInformation = useSelector((state) => state.counter.shoppingInformation);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const containerStyle = {
        // height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    }
    const wrapperStyle = {
        width: "80%"
    }
    const fontBold = {
        fontWeight: "bold"
    }
    return (
        <div style={containerStyle}>
            <div className="wrapper" style={wrapperStyle}>
                <h2 className="mb-05 mt-05">Me Wallet Payment</h2>
                <div className="bill-wrapper">
                    <div className="bill-header">
                        <div className="bill-header-left">
                            <div className="bill-customer-name">
                                <h3 className="mb-05">ข้อมูลผู้ซื้อ</h3>
                                <p><span style={fontBold}>ชื่อ:</span> {userData.firstname}</p>
                                <p><span style={fontBold}>นามสกุล:</span> {userData.lastname}</p>
                            </div>
                            <div className="bill-customer-address">
                                <h3 className="mb-05 mt-05">ที่อยู่จัดส่ง</h3>
                                <p><span style={fontBold}>ที่อยู่:</span> {shoppingInformation.address}</p>
                                <p><span style={fontBold}>จังหวัด:</span> {shoppingInformation.province}</p>
                                <p><span style={fontBold}>อำเภอ:</span> {shoppingInformation.district}</p>
                                <p><span style={fontBold}>ตำบล:</span> {shoppingInformation.subDistrict}</p>
                                <p><span style={fontBold}>รหัสไปรษณีย์:</span> {shoppingInformation.postcode}</p>
                            </div>
                        </div>
                        <div className="bill-header-right">
                            <div className="bill-shipping-information">
                                <h3 className="mb-05">ข้อมูลการจัดส่ง</h3>
                                <p><span style={fontBold}>ชื่อขนส่ง:</span> {shoppingInformation.shipping.name}</p>
                                <p><span style={fontBold}>รายละเอียด:</span> {shoppingInformation.shipping.detail}</p>
                                <p><span style={fontBold}>ราคาจัดส่ง:</span> {shoppingInformation.shipping.price}</p>
                                <p><span style={fontBold}>ระยะเวลาการจัดส่ง:</span> {shoppingInformation.shipping.timeForShipping} วัน</p>
                                <p><span style={fontBold}>วันที่คลาดว่าจะได้รับ:</span> {shoppingInformation.shipping.dateSentFinish}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bill-body"></div>
                    <div className="bill-footter"></div>
                </div>


            </div>
        </div>
    )
}