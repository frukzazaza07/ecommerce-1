import { useRef, useState, useEffect, createRef, Component } from "react";
import {
    useParams
} from "react-router-dom";
import ServerUrl from './ServerUrl.js';
import { useSelector, useDispatch } from 'react-redux';
import MyFunction from './myLib/MyFunction';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import { BsCheckCircle } from 'react-icons/bs';
import "./PaymentSuccess.css"
import "./cssRoot.css"

export default function PaymentSuccess() {
    const { userId, paymentId } = useParams();
    const userAccessToken = useSelector((state) => state.counter.userToken.tokenAccess);
    const headerText = "Payment successfully";
    const [paymentData, setPaymentData] = useState([]);
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

    const headerFontSize = { fontSize: "var(--font-size-heading-small)" }
    const footterFontSize = { fontSize: "var(--font-size-body-08)" }

    function fetchPaymentDetails(userId, paymentId) {
        let axiosConfigs = axiosConfig(userAccessToken);
        const serverUrl = `${ServerUrl().rootUrl}api/get-payment-detail/${userId}/${paymentId}`;
        const bodyData = {
            secret: "juju",
        }
        axiosConfigs.method = "POST";
        axiosConfigs.url = serverUrl;
        axiosConfigs.data = { data: JSON.stringify(bodyData) };
        axios(axiosConfigs)
            .then((response) => {
                console.log(response.data);
                if (response.data.data) {
                    setPaymentData(response.data.data);
                }
            })
            .catch((error) => {
                console.log(error)
            });
    }

    useEffect(() => {
        fetchPaymentDetails(userId, paymentId);
    }, []);
    return (

        <div style={containerStyle}>
            <div className="payment-wrapper">
                <div className="payment-header">
                    <h2 className="color-success mt-05" style={headerFontSize}>{headerText}</h2>
                    <h2 className="color-success mt-05" style={headerFontSize}><BsCheckCircle /></h2>
                </div>
                <div className="payment-body">
                    <table className="payment-detail-table">
                        <tr style={fontBold}>
                            <td className="text-left">Bill id</td>
                            <td className="text-right">B1010101010</td>
                        </tr>
                        <tr>
                            <td className="text-left">Payment type</td>
                            <td className="text-right">Mobile</td>
                        </tr>
                        <tr>
                            <td className="text-left">Bank</td>
                            <td className="text-right">KBank</td>
                        </tr>
                        <tr>
                            <td className="text-left">Mobile</td>
                            <td className="text-right">0865297465</td>
                        </tr>
                        <tr>
                            <td className="text-left">Email</td>
                            <td className="text-right">frukza3000@gmail.com</td>
                        </tr>
                        <tr>
                            <td className="text-left">Amount paid</td>
                            <td className="text-right">500.00</td>
                        </tr>

                    </table>
                </div>
                <div className="payment-footer">
                    <button type="button" className="btn bg-primary color-white btn-sm" style={footterFontSize} onClick="">PRINT</button>
                    <button type="button" className="btn bg-success color-white btn-sm" style={footterFontSize} onClick="">View shipping</button>
                </div>
            </div>
        </div>
    )
}