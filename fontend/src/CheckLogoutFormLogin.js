import { useRef, useState, useEffect, useCallback, createRef, Component } from "react";
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import ServerUrl from './ServerUrl.js';
import { useSelector, useDispatch } from 'react-redux';
export default function CheckLogoutFormLogin({ handleMeWallet }) {
    const [meWalletEmail, setmeWalletEmail] = useState("");
    const [meWalletPassword, setmeWalletPassword] = useState("");
    const userAccessToken = useSelector((state) => state.counter.userToken.tokenAccess);
    function handleMeWalletLogin() {
        const sendData = {
            username: meWalletEmail,
            password: meWalletPassword,
        }
        const serverUrl = ServerUrl().rootUrl + "api/meWallet-login";
        let axiosConfigs = axiosConfig(userAccessToken);
        axiosConfigs.url = serverUrl;
        axiosConfigs.data = { data: JSON.stringify(sendData) };
        axios(axiosConfigs)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error)
            });
        // meWalletEmail
        // meWalletPassword
    }
    return (
        <div>
            <div className="form-group">
                <input className="form-input" type="email" minLength="256" maxLength="255" value={meWalletEmail} onChange={(e) => { setmeWalletEmail(e.target.value) }} />
                <label>meWallet username</label>
            </div>
            <div className="form-group">
                <input className="form-input" type="password" minLength="256" maxLength="255" value={meWalletPassword} onChange={(e) => { setmeWalletPassword(e.target.value) }} />
                <label>meWallet password</label>
            </div>
            <div className="form-group">
                <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { handleMeWalletLogin() }}>Login</button>
            </div>
        </div>
    )
}