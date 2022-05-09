import { useRef, useState, useEffect, useCallback, createRef, Component } from "react";
import InputMask from 'react-input-mask';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect } from 'react-router-dom'
import UserIsLogin, { getDataInCookie } from './UserIsLogin.js';
import Myfunction from "./myLib/MyFunction.js";
import { fas } from '@fortawesome/fontawesome-free-solid';
import ServerUrl from './ServerUrl.js';
import MeWalletPayment from './MeWalletPayment';
import MyFunction from './myLib/MyFunction';
import MobileBankingPayment from './MobileBankingPayment';
import MobileBankingInputFile from './MobileBankingInputFile';
import PaymentSuccess from './PaymentSuccess';
import axios from "axios";
import CheckLogoutFormLogin from "./CheckLogoutFormLogin";
import { axiosConfig } from './axiosConfig.js';
import { handleSetShoppingInformation, calTotalPriceInCart, loadProductInCart, checkMeWalletLogin } from './counterSlice'
import { fetchProductInCart, setProductToCartDataFormat } from './LoadProductInCart';
import "./checkout.css";
import "./cssRoot.css";


function ListProductInCart({ data }) {

    return (
        data.map((value, index) => (
            <li key={index} className="cart-list-item">
                <div className="cart-list-image">
                    <img src={value.productImageUrl} alt="" />
                </div>
                <div className="cart-list-detail flex-basis-36-percen">
                    <h4>{value.productName}</h4>
                    {
                        value.product_storage_key_text === undefined || value.product_storage_key === ""
                            ? ""
                            : <p className="topic">{value.product_color_key_text}: <span>{value.product_color_name}</span></p>
                    }
                    {
                        value.product_storage_key_text === undefined || value.product_storage_key === ""
                            ? ""
                            : <p className="topic d-block">{value.product_storage_key_text}: <span>{value.product_storage_name}</span></p>
                    }
                    <p className="cart-list-price-detail font-1rem">
                        {
                            value.productDiscountPrice === 0
                                ?
                                <span className="topic">ราคา: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productPrice)}</span>
                                :
                                <div>
                                    <p style={{ fontWeight: "bold" }}>ราคา: <span className="cart-discount-price">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productPrice)}</span></p>
                                    <p style={{ fontWeight: "bold" }}>ราคาสุทธิ: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productDiscountPrice)}</p>
                                </div>
                        }

                    </p>
                </div >
                <div className="cart-list-quantity product-quantity text-center font-1rem flex-basis-10-percen">
                    <p>จำนวน</p>
                    <p>{value.productQuantity}</p>
                </div>
                <div className="cart-list-totalPrice text-center font-1rem">
                    <p>รวม</p>
                    <p>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value.productTotalPrice)}</p>
                </div>
            </li >
        ))
    );
}

function NavigatorList({ currentItem, changeForm }) {
    const navagatorList = ["Cart", "Information", "Shipping", "Payment"]
    // ตัวอย่างเรียกใช้ setState จาก component อื่น แต่เราดันได้วิธีอื่นแล้ว อิอิ
    // const handleChangeForm = useCallback(index => {
    //     changeForm(index)
    //   }, [changeForm])
    return (
        navagatorList.map((value, index) => ( //currentItem[index]["status"]
            <li onClick={() => changeForm(index, "doing", "reCheckBack")} key={index} className={`navigator-item${currentItem[index]["status"] === "doing" ? " navigator-item-active color-primary" : (currentItem[index]["status"] === "success") ? " navigator-item-active color-success" : " color-4d4d4d"}`}>
                {/* <li onClick={(e) => changeForm(index)} key={index} className={`navigator-item${index < currentItem ? " navigator-item-active color-success" : (index === currentItem) ? " navigator-item-active color-primary" : " color-4d4d4d"}`}> */}
                {index !== (value.length - 1) && index !== 0 ? <FontAwesomeIcon icon={['fa', 'chevron-right']} /> : ""}
                &nbsp;
                <span>{value}</span>
            </li>
        ))
    )
}

function ShippingChoice({ selectShipping, currentShipping }) {
    const shippingChoice = [
        {
            id: 1,
            name: "Thailand Post",
            detail: "normal",
            price: "40",
            timeForShipping: 4,
            dateSentFinish: "",
        },
        {
            id: 2,
            name: "Thailand Post",
            detail: "ems",
            price: "50",
            timeForShipping: 2,
            dateSentFinish: "",
        },
        {
            id: 3,
            name: "Kerry",
            detail: "",
            price: "40",
            timeForShipping: 2,
            dateSentFinish: "",
        },
        {
            id: 4,
            name: "Flash",
            detail: "",
            price: "30",
            timeForShipping: 5,
            dateSentFinish: "",
        },
    ];

    function setDateSentFinish() {
        const MyFunctions = new MyFunction();
        const currentDate = MyFunctions.createDate();
        for (let i = 0; i < shippingChoice.length; i++) {
            const addDateByTimeForShipping = MyFunctions.addDays(currentDate.dateFormat, shippingChoice[i].timeForShipping);
            const addBeforDateByTimeForShipping = MyFunctions.addDays(currentDate.dateFormat, (shippingChoice[i].timeForShipping - 1));
            shippingChoice[i].dateSentFinish = addBeforDateByTimeForShipping + " - " + addDateByTimeForShipping;
        }
    }

    setDateSentFinish();
    return (

        shippingChoice.map((value, index) => (
            <li key={index} className={`${currentShipping.id === value.id ? "shipping-choice-active" : ""}`} onClick={(e) => selectShipping(value, "shipping")}>
                <p><strong>ผู้ให้บริการ</strong> {value.name} {value.detail !== "" ? ` (${value.detail})` : ""}</p>
                <p><strong>ราคา</strong> {value.price}</p>
                <p><strong>ระยะเวลาจัดส่ง</strong> {value.timeForShipping} วัน</p>
                <p><strong>คาดว่าได้รับ</strong> {value.dateSentFinish}</p>

            </li>
        ))
    )
}

export default function Checkout({ userRef, userData }) {
    // let [userData, setUserData] = useState(getDataInCookie("userData"));
    const productInCart = useSelector((state) => state.counter.productCartData);  // (state) => state.counter.productCartData ความหมายคือ return state.counter.value เลย
    const totalPriceInOrder = useSelector((state) => state.counter.totalPriceInOrder);  // (state) => state.counter.productCartData ความหมายคือ return state.counter.value เลย
    const totalSumPrice = useSelector((state) => state.counter.totalSumPrice);
    const shoppingInformation = useSelector((state) => state.counter.shoppingInformation);
    const dataSentToBackend = useSelector((state) => state.counter.dataSentToBackend);
    const userAccessToken = useSelector((state) => state.counter.userToken.tokenAccess);
    const userMeWallet = useSelector((state) => state.counter.meWalletLogin);
    const meWalletType = "2";
    let [meWalletMemberId, setMeWalletMemberId] = useState("");
    let [showPaymentSuccess, setShowPaymentSuccess] = useState("");
    let [meWalletLoginStatus, setMeWalletLoginStatus] = useState(false);
    let [paymentType, setPaymentType] = useState("");
    let [meWalletFormLoginShow, setMeWalletFormLoginShow] = useState(false);
    let [discountPrice, setDiscountPrice] = useState(0);
    let [inputPhoneActiveStatus, setInputPhoneActiveStatus] = useState(false);
    const disPatch = useDispatch();
    const phoneFormat = "___-___-____";
    // const socketIoUrl = "http://localhost:3030";
    const socketIoUrl = "https://archer-ecommerce.herokuapp.com";
    const socketIOClient = io(socketIoUrl);
    let meWalletCookie = getDataInCookie("meWalletCookie");
    let [slipPaymentImg, setSlipPaymentImg] = useState("");
    // รอรับข้อมูลเมื่อ server มีการ update
    function responseSocketIo(userRef = "") {

        socketIOClient.on(`meWalletLogin-success-${userRef}`, (serverData) => {
            console.log(serverData)
            disPatch(checkMeWalletLogin(serverData.meWalletData))
            setMeWalletLoginStatus(true);
            const MyFunctions = new MyFunction();
            const currentDate = MyFunctions.createDate();
            const rerender = currentDate.year + currentDate.month + currentDate.day + currentDate.hour + currentDate.minute + currentDate.second + currentDate.milliseconds
            setForceRerender(rerender)
        })
        // รอรับค่าจาก server ว่ามีเพื่อนคนไหนออนไลน์เพิ่ม แล้วให้ไปหาข้อมูลในตัวแปร โดยใช้ id แล้ว update status online เปลี่ยนเป็นสีเขียว
    }

    useEffect(() => {
        responseSocketIo(userRef);
        if (meWalletCookie !== null) {
            setMeWalletFormLoginShow(false);
            setMeWalletMemberId(meWalletCookie.userId)
            setMeWalletLoginStatus(true);
        }


    })

    const shippingFormDetail = {
        title: "บริษัท",
        name: "Jhimlhim Shop จำกัด",
        address: "84 ซ. คู้บอน27 แยก32",
        province: "กรุงเทพ",
        district: "บางเขน",
        subDistrict: "ท่าแร้ง",
        postcode: "10220",
        tel: "0845558789"
    };
    const [paymentInformation, setPaymentInformation] = useState([
        {
            paymentId: 1,
            paymentName: "เงินสด",
        },
        {
            paymentId: 2,
            paymentName: "Me Wallet",
        },
    ]);
    let [forceRerender, setForceRerender] = useState("");
    let [currentItem, setCurrentItem] = useState([
        {
            status: "success",
            backupStatus: "success",
        },
        {
            status: "doing",
            backupStatus: "notSuccess",
        },
        {
            status: "notSuccess",
            backupStatus: "notSuccess",
        },
        {
            status: "notSuccess",
            backupStatus: "notSuccess",
        },
        {
            backUpIndex: 0,
            successCurrent: 0,
        }
    ]);
    function handleShoppingInformation(value, key) {
        // ของเดิมใช้ state ในหน้า checkout ปัญหาคือเวลาเปลี่ยนหน้าอื่นแล้วกลับมาหน้าเตรียมซื้อ ต้องกรอกข้อมูลใหม่
        // ใช้ react-redex เปลี่ยนหน้าแล้วกลับมาก็ไม่ต้องกรอกข้อมูลใหม่
        // let data = shoppingInformation;
        // data[key] = value;
        // if(typeof data[key] === "string") data[key].replace("undefined", "");
        // setShoppingInformation(data);
        disPatch(handleSetShoppingInformation({ value: value, key: key }));
        setForceRerender(value);
    }

    function checkLength(phone, lengthLimit, message = "Phone number is valid", field) {
        if (phone.length === lengthLimit) return []
        return { field: field, msg: `${field} '${phone}' ${message}` }
    }

    function handleSubmit(data) {
        let axiosConfigs = axiosConfig(userAccessToken);

        let dataForSentToBackend = {
            paymentType: paymentType,
            meWalletId: meWalletMemberId,
            email: data.shoppingInformation.email,
            firstname: data.shoppingInformation.firstname,
            lastname: data.shoppingInformation.lastname,
            address: data.shoppingInformation.address,
            country: data.shoppingInformation.country,
            province: data.shoppingInformation.province,
            district: data.shoppingInformation.district,
            subDistrict: data.shoppingInformation.subDistrict,
            postcode: data.shoppingInformation.postcode,
            phone: data.shoppingInformation.phone.replace(/-|_/gi, ""),
            discountCode: data.shoppingInformation.discountCode,
            slipPaymentImg: slipPaymentImg,
            shipping: data.shoppingInformation.shipping,
            productInCart: data.productInCart,
            userData: userData,
        };
        const numericIgnore = [
            "email",
            "firstname",
            "lastname",
            "address",
            "discountCode",
            "shipping",
            "productInCart",
            "userData",
            "name",
            "nickname",
            "detail",
            "dateSentFinish",
            "expiresIn",
            "token",
            "isLogin",
            "token",
            "productImageUrl",
            "product_color_key_text",
            "product_color_name",
            "product_storage_key_text",
            "product_storage_name",
            "productName",
            "slipPaymentImg",
        ];
        const validate1 = validateForm(dataForSentToBackend, "shoppingInformation", /[`!#$%^*()+[\]{};'"|,<>~]/, numericIgnore)
        const validate2 = validateForm(dataForSentToBackend.shipping, "", /[`!#$%^&*()_+=[\]{};'"\\|,<>?~]/, numericIgnore)
        const validate3 = validateForm(dataForSentToBackend.productInCart, "", /[`!#$%^*()+[\]{};'"|,<>~]/, numericIgnore)
        const validate4 = validateForm(dataForSentToBackend.userData, "", /[`!#$%^&*()+[\]{};"\\|,<>?~]/, numericIgnore)
        const errorValidate = validate1.concat(
            validate2,
            validate3,
            validate4,
        );
        if (errorValidate.length > 0) { console.log(errorValidate); return; }
        const serverUrl = ServerUrl().rootUrl + "api/confirm-order";
        axiosConfigs.url = serverUrl;
        axiosConfigs.data = { data: JSON.stringify(dataForSentToBackend) };
        axios(axiosConfigs)
            .then((response) => {
                if (response.data.status === true) {
                    // PaymentSuccess
                    // setShowPaymentSuccess(response.data.status);
                    const userId = Buffer.from(userData.id.toString()).toString('base64');
                    const paymentId = Buffer.from(response.data.data[0].billPaymentId.toString()).toString('base64');
                    window.location.replace(`http://localhost:3000/payment-success/${userId}/${paymentId}`);
                    return;
                }
            })
            .catch((error) => {
                console.log(error)
            });
    }

    function validateForm(data, validateType, regexValidate, numericIgnore) {
        const myfunction = new Myfunction()
        let checkEmpOption = ["discountCode", "detail"]
        let checkSpecialCharacterOption = []
        if (paymentType === "1") {
            checkSpecialCharacterOption.push("slipPaymentImg");
        } else {
            checkEmpOption.push("slipPaymentImg");
        }
        // shoppingInformation
        const validate1 = myfunction.checkEmpty(data, checkEmpOption);
        const validate2 = myfunction.checkSpecialCharacter(data, checkSpecialCharacterOption, regexValidate);
        const validate3 = myfunction.checkNumeric(data, numericIgnore);
        let errorValidate = [];
        if (validateType === "shoppingInformation") {
            const validate4 = checkLength(data.phone, 10, "Phone number is valid", "phone");
            const validate5 = checkLength(data.postcode, 5, "Postcode is valid", "postcode");
            errorValidate = validate1.concat(
                validate2,
                validate3,
                validate4,
                validate5,
            );
        } else {
            errorValidate = validate1.concat(
                validate2,
                validate3,
            );
        }
        return errorValidate;
    }


    function phoneInputMaks(myValue) {
        // if(myValue !== undefined) return myValue.replace(/(\d{3})(\d{3})(\d{4})/,"$1-$2-$3");
        if (myValue !== "___-___-____" && myValue !== "") setInputPhoneActiveStatus(true);
        else setInputPhoneActiveStatus(false);
    }
    // function คอยควบคุมการกดดู step ย้อนหลัง
    function handleFormChange(index, status, reCheckForm = "") {
        let shoppingValidate = {
            email: shoppingInformation.email,
            firstname: shoppingInformation.firstname,
            lastname: shoppingInformation.lastname,
            address: shoppingInformation.address,
            country: shoppingInformation.country,
            province: shoppingInformation.province,
            district: shoppingInformation.district,
            subDistrict: shoppingInformation.subDistrict,
            postcode: shoppingInformation.postcode,
            phone: shoppingInformation.phone.replace(/-|_/gi, ""),
            discountCode: shoppingInformation.discountCode,
        };
        const numericIgnore = [
            "email",
            "firstname",
            "lastname",
            "address",
            "discountCode",
            "shipping",
            "productInCart",
            "userData",
            "name",
            "nickname"
        ];
        const validate1 = validateForm(shoppingValidate, "shoppingInformation", /[`!#$%^*()+\[\]{};'"\|,<>~]/, numericIgnore)
        if (index === 1 && validate1.length > 0) return;

        if (index === 0) return;
        let items = [...currentItem];
        let backUpIndex = { ...items[(items.length - 1)] };
        let currentForm = { ...items[index] };
        let nextForm = { ...items[index + 1] };
        currentForm.status = status;
        if (reCheckForm === "") {
            // อัพเดทตัวถัดไป
            nextForm.status = "doing";
            items[index + 1] = nextForm;
            currentForm.backupStatus = status;
            backUpIndex.successCurrent = index;
        }
        items[index] = currentForm;
        if (reCheckForm === "reCheckBack") {
            for (let i = 0; i < items.length; i++) {
                if (i !== index && i !== (items.length - 1)) {
                    let setStatusAnotherForm = { ...items[i] };
                    setStatusAnotherForm.status = setStatusAnotherForm.backupStatus;
                    items[i] = setStatusAnotherForm;
                }
            }
        }
        const checkStatusBeforeCurrentIndex = { ...items[(index - 1 < 0 ? 0 : index - 1)] };
        if (reCheckForm === "reCheckBack" && backUpIndex.successCurrent < index && checkStatusBeforeCurrentIndex.backupStatus !== "success") return;
        setCurrentItem(items);
    }

    function handlePaymentType(paymentValue) {
        setPaymentType(paymentValue.toString())

        if (paymentValue === meWalletType) {
            if (meWalletCookie === null) {
                setMeWalletFormLoginShow(true);
            } else {
                setMeWalletFormLoginShow(false);
            }
        }
    }

    function openMeWalletLogin() {
        const urlPath = `http://localhost:3000/meWallet-login?userRef=${userData.id}`;
        window.open(urlPath, 'Data', 'height=500,width=500')
        setMeWalletFormLoginShow(false);
    }

    useEffect(() => {
        disPatch(calTotalPriceInCart());
        // responseSocketIo();
        // fetchProductInCartHook();
        // async function fetchProductInCartHook() {
        //     const cartData = await fetchProductInCart(userData.id);
        //     const productCartFormat = setProductToCartDataFormat(cartData.data)
        //     disPatch(loadProductInCart(productCartFormat))
        // }
    });

    return (
        <form className="checkout-container" >
            <div className="checkout-wrapper">
                <div className="checkout-left">
                    <div className="navigator-detail-container">
                        <div className="navigator-detail-wrapper">
                            <ul className="navigator-main">
                                <NavigatorList currentItem={currentItem} changeForm={handleFormChange}></NavigatorList>
                            </ul>
                        </div>
                    </div>
                    <div className={`form-step form-step-1${currentItem[1].status === "doing" ? " form-step-active" : ""}`}>
                        <div className="checkout-left-header">
                            <h3>Shipping information</h3>
                            <div className="shopping-navigator">
                            </div>
                        </div>
                        <div className="checkout-left-body">
                            <div className="form-group-wrapper">
                                <h4>Contract information</h4>
                                <div className="form-group">
                                    <input id="email" className="form-input" type="email" minLength="256" maxLength="255" value={shoppingInformation.email} onChange={(e) => { handleShoppingInformation(e.target.value, "email") }} />
                                    <label className={`${shoppingInformation.email !== undefined && shoppingInformation.email.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Email</label>
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <h4>Shipping address</h4>
                                <div className="form-input-inline item-group-2">
                                    <div className="form-group">
                                        <input id="firstname" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.firstname} onChange={(e) => { handleShoppingInformation(e.target.value, "firstname"); }} />
                                        <label className={`${shoppingInformation.firstname !== undefined && shoppingInformation.firstname.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Firstname</label>
                                    </div>
                                    <div className="form-group">
                                        <input id="lastname" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.lastname} onChange={(e) => { handleShoppingInformation(e.target.value, "lastname"); }} />
                                        <label className={`${shoppingInformation.lastname !== undefined && shoppingInformation.lastname.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Lastname</label>
                                    </div>
                                </div>
                                <div className="form-input-inline item-group-3">
                                    <div className="form-group">
                                        <input id="address" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.address} onChange={(e) => { handleShoppingInformation(e.target.value, "address") }} />
                                        <label className={`${shoppingInformation.address !== undefined && shoppingInformation.address.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Address</label>
                                    </div>
                                    <div className="form-group">
                                        <input id="country" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.country} onChange={(e) => { handleShoppingInformation(e.target.value, "country"); }} />
                                        <label className={`${shoppingInformation.country !== undefined && shoppingInformation.country.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Country</label>
                                    </div>
                                    <div className="form-group">
                                        <input id="province" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.province} onChange={(e) => { handleShoppingInformation(e.target.value, "province"); }} />
                                        <label className={`${shoppingInformation.province !== undefined && shoppingInformation.province.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Province</label>
                                    </div>
                                </div>
                                <div className="form-input-inline item-group-3">
                                    <div className="form-group">
                                        <input id="district" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.district} onChange={(e) => { handleShoppingInformation(e.target.value, "district"); }} />
                                        <label className={`${shoppingInformation.district !== undefined && shoppingInformation.district.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>District</label>
                                    </div>
                                    <div className="form-group">
                                        <input id="subDistrict" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.subDistrict} onChange={(e) => { handleShoppingInformation(e.target.value, "subDistrict"); }} />
                                        <label className={`${shoppingInformation.subDistrict !== undefined && shoppingInformation.subDistrict.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Sub district</label>
                                    </div>
                                    <div className="form-group">
                                        <input id="postcode" className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.postcode} onChange={(e) => { handleShoppingInformation(e.target.value, "postcode"); }} />
                                        <label className={`${shoppingInformation.postcode !== undefined && shoppingInformation.postcode.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Post code</label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    {/* <input className="form-input" type="text" minLength="13" maxLength="10" value={ phoneInputMaks(shoppingInformation.phone) } onChange={(e) => { handleShoppingInformation(e.target.value, "phone") }} /> */}
                                    <InputMask id="phone" className={`form-input`} mask="999-999-9999" value={shoppingInformation.phone} onChange={(e) => { handleShoppingInformation(e.target.value, "phone"); phoneInputMaks(shoppingInformation.phone); }} />
                                    <label className={`${shoppingInformation.phone !== phoneFormat && shoppingInformation.phone.length > 0 ? "input-label-active" : "inputPhoneActiveStatus"}`}>Phone</label>
                                    {/* <label className={`${inputPhoneActiveStatus === true ? "input-label-active" : "inputPhoneActiveStatus"}`}>Phone</label> */}

                                </div>
                            </div>

                            <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { handleFormChange(1, "success"); }}>Confirm</button>
                            {/* <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { setCurrentItem((currentItem) => currentItem[1]["status"] = "success"); }}>Confirm</button> */}
                            {/* <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { setCurrentItem(2); }}>Confirm</button> */}
                        </div>
                    </div>
                    {/* step1 end */}
                    <div className={`form-step form-step-2${currentItem[2].status === "doing" ? " form-step-active" : ""}`}>
                        <div className="checkout-left-header">
                            <div className="address-wrapper">
                                <h3>ข้อมูลผู้ส่ง</h3>
                                <div className="address-group">
                                    <p>{`${shippingFormDetail.title} ${shippingFormDetail.name}`}</p>
                                    <p>{`${shippingFormDetail.address}`}</p>
                                    <p>{`${shippingFormDetail.province} ${shippingFormDetail.district} ${shippingFormDetail.subDistrict} ${shippingFormDetail.postcode}`}</p>
                                    <p>{`${shippingFormDetail.tel}`}</p>
                                </div>
                            </div>
                            <div className="address-wrapper">
                                <h3>ข้อมูลผู้รับ</h3>
                                <div className="address-group">
                                    <p>{`${shippingFormDetail.title} ${shippingFormDetail.name}`}</p>
                                    <p>{`${shippingFormDetail.address}`}</p>
                                    <p>{`${shippingFormDetail.province} ${shippingFormDetail.district} ${shippingFormDetail.subDistrict} ${shippingFormDetail.postcode}`}</p>
                                    <p>{`${shippingFormDetail.tel}`}</p>
                                </div>
                            </div>
                            <div className="address-wrapper shipping-detail-wrapper">
                                <h3>ข้อมูลการจัดส่ง</h3>
                                <ul className="shipping-container">
                                    <ShippingChoice selectShipping={handleShoppingInformation} currentShipping={shoppingInformation.shipping} />
                                </ul>
                            </div>
                        </div>
                        <div className="checkout-left-body"></div>
                        <div className="checkout-left-footter"><button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { handleFormChange(2, "success"); }}>ชำระเงิน</button></div>
                    </div>
                    {/* step2 end */}
                    <div className={`form-step form-step-3${currentItem[3].status === "doing" ? " form-step-active" : ""}`}>
                        <div className="checkout-left-header">
                            <h3>Payment information</h3>
                            <div className="shopping-navigator">
                            </div>
                        </div>
                        <div className="checkout-left-body">
                            <div className="payment-choice-container">
                                <ul className="myUl-inline">
                                    {
                                        paymentInformation.map((value, index) => (
                                            <li className="payment-list-item" key={value.paymentId}>
                                                <input
                                                    type="radio"
                                                    value={value.paymentId}
                                                    name="paymentInformation"
                                                    // checked={ == "oneWay"}
                                                    onChange={(event) => { handlePaymentType(event.target.value) }}
                                                />
                                                <label className="position-static payment-list-label custom-radio-container">
                                                    {value.paymentName}
                                                </label>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                            {
                                meWalletFormLoginShow === true &&
                                    paymentType === meWalletType
                                    ?
                                    openMeWalletLogin()
                                    :
                                    meWalletFormLoginShow === false &&
                                        meWalletLoginStatus === true &&
                                        paymentType === meWalletType
                                        ?
                                        <MeWalletPayment userData={userData} />
                                        :
                                        <></>
                            }
                            {
                                paymentType === "1"
                                    ?
                                    <div className="mt-05">
                                        <div style={{ display: "flex" }}>
                                            <div style={{ order: "5" }}>
                                                <MeWalletPayment userData={userData} />
                                            </div>
                                            <div style={{ order: "5" }}>
                                                <MobileBankingPayment totalPayments={(totalSumPrice === 0 ? totalPriceInOrder : totalSumPrice)} />
                                            </div>
                                        </div>

                                        <div>
                                            <h3>โอนเงินแล้วอัพโหลดสลิปเลย</h3>
                                            <MobileBankingInputFile setSlipPaymentImg={setSlipPaymentImg} />
                                        </div>
                                    </div>

                                    :
                                    <></>
                            }
                        </div>
                        <div className="checkout-left-footter">
                            {
                                (meWalletFormLoginShow === false &&
                                    paymentType === meWalletType) ||
                                    paymentType !== meWalletType
                                    ?
                                    <button type="button" className="btn bg-primary color-white btn-sm btn-full-width" onClick={(e) => { handleSubmit({ shoppingInformation: shoppingInformation, productInCart: productInCart }); handleFormChange(3, "success"); }}>Confirm3</button>
                                    :
                                    <></>
                            }

                        </div>
                    </div>
                    {/* step3(last step) end */}
                </div>
                <div className="checkout-right">
                    <div className="checkout-right-header">
                        <ListProductInCart data={productInCart} />
                    </div>
                    <div className="checkout-right-body">
                        <div className="form-input-inline item-group-2 size-item-8020">
                            <div className="form-group">
                                <input className="form-input" type="text" minLength="256" maxLength="255" value={shoppingInformation.discountCode} onChange={(e) => { handleShoppingInformation(e.target.value, "discountCode") }} />
                                <label>Gift card or Discount code</label>
                            </div>
                            <div className="form-group">
                                <button className="btn bg-orange btn-sm btn-full-width color-white">Check code</button>
                            </div>
                        </div>
                    </div>
                    <div className="checkout-right-footter">
                        <div className="price-detail-1">
                            <div className="price-main">
                                {/* ราคารวมก่อน - discount code*/}
                                <div className="price-item">Sub total</div>

                                <div className="price-item">{new Intl.NumberFormat().format(totalPriceInOrder)}</div>
                            </div>
                            {
                                discountPrice !== 1
                                    ?
                                    <div className="price-main">
                                        {/* ราคารวมก่อน - discount code*/}
                                        <div className="price-item">Discount</div>
                                        <div className="price-item">{discountPrice}</div>
                                    </div>
                                    : ""
                            }
                            <div className="price-main">
                                <div className="price-item">Shipping</div>
                                <div className="price-item">{currentItem[1].backupStatus !== "success" ? "Calculated next step" : (shoppingInformation.shipping.price !== undefined ? shoppingInformation.shipping.price : 0)}</div>
                            </div>
                        </div>
                        <div className="price-detail-2">
                            <div className="price-main">
                                {/* เอาไป - กับ discount code */}
                                <div className="price-item">Total</div>

                                <div className="price-item">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format((totalSumPrice === 0 ? totalPriceInOrder : totalSumPrice))}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}