import { useRef, useState, useEffect, createRef, Component } from "react";
import ServerUrl from './ServerUrl.js';
import MyFunction from './myLib/MyFunction';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import io from 'socket.io-client'


export default function MeWalletLogin({ userAccessToken, userRef }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const socketIoUrl = "https://archer-ecommerce.herokuapp.com/";
    // const socketIoUrl = "http://localhost:3030";
    const socketIOClient = io(socketIoUrl);

    const containerStyle = {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    }
    const wrapperStyle = {
        width: "80%"
    }

    function responseSocketIo(userRef = "") {

        socketIOClient.on(`meWalletLogin-success-${userRef}`, (serverData) => {
            console.log(serverData)
        })
        // รอรับค่าจาก server ว่ามีเพื่อนคนไหนออนไลน์เพิ่ม แล้วให้ไปหาข้อมูลในตัวแปร โดยใช้ id แล้ว update status online เปลี่ยนเป็นสีเขียว
    }

    useEffect(() => {
        responseSocketIo(userRef);
    })

    function send(userRef = "", data) {
        socketIOClient.emit(`meWalletLogin-success`, data);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const myfunction = new MyFunction();
        let dataForSentToBackend = {
            username: username,
            password: password,
        };
        const validate = myfunction.checkEmpty(dataForSentToBackend);
        if (validate.length > 0) { console.log(validate); return; }
        let axiosConfigs = axiosConfig(userAccessToken);
        const serverUrl = ServerUrl().rootUrl + "api/meWallet-login";
        axiosConfigs.url = serverUrl;
        axiosConfigs.data = { data: JSON.stringify(dataForSentToBackend) };
        axios(axiosConfigs)
            .then((response) => {
                if (response.data.status === true) {
                    const meWalletData = { userRef: userRef, meWalletData: response.data.data.data };
                    send(userRef, meWalletData)
                    window.close()
                } else {
                    console.log(response.data.data);
                }

            })
            .catch((error) => {
                console.log(error)
            });
    }
    return (
        <div style={containerStyle}>
            <div className="wrapper" style={wrapperStyle}>
                <h2>Me Wallet</h2>
                <form action="">
                    <div className="form-group">
                        <input id="email" className="form-input" type="email" minLength="256" maxLength="255" value={username} onChange={(e) => { setUsername(e.target.value) }} />
                        <label className={`${username !== undefined && username.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Username</label>
                    </div>
                    <div className="form-group">
                        <input id="password" className="form-input" type="password" minLength="256" maxLength="255" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                        <label className={`${password !== undefined && password.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Password</label>
                    </div>
                    <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(event) => { handleSubmit(event) }}>Login</button>
                </form>
            </div>
        </div>
    )
}