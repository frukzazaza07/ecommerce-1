
import { useRef, useState, useEffect, createRef, Component } from "react";
// github
import { useSelector, useDispatch } from 'react-redux';// useSelector = เข้าถึงข้อมูล  useDispatch = ส่งออก action การนำ react-redux เพื่อนำ props ไปใช้ทุก component
import { addProductToCartF, setIsAddProductActive, checkProductSame, loadProductInCart } from './counterSlice' // การนำ react-redux เพื่อนำ props ไปใช้ทุก component
import { getProductDetail } from './AddProductCart'
import ServerUrl from './ServerUrl.js';
import axios from "axios";
import { axiosConfig } from './axiosConfig.js';
import InputQuantity from './InputQuantity';
import Myfunction from "./myLib/MyFunction.js";
import { fetchProductInCart, setProductToCartDataFormat } from './LoadProductInCart';
import "./zoomProduct.css"
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
const myfunction = new Myfunction()
// ทำเพิ่มให้มี 
function imageZoom(imgID, resultID, status = "") {
  if (imgID === "" || status === "") return;
  // ต้องลบก่อนไม่งั้นค้าง
  const elements = document.getElementsByClassName("img-zoom-lens");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }

  var img, lens, result, cx, cy;
  let lensWidth = "200px"; // ยิ่งเยอะจะยิ่งซูมกว้างขึ้น
  let lensheight = "200px"; // ยิ่งเยอะจะยิ่งซูมกว้างขึ้น
  img = document.getElementById(imgID);
  if (status === "clear") {
    img.src = "";
  }
  result = document.getElementById(resultID);
  /*create lens:*/
  lens = document.createElement("DIV");
  lens.setAttribute("class", "img-zoom-lens");
  lens.style.width = lensWidth;
  lens.style.height = lensheight;
  /*insert lens:*/
  img.parentElement.insertBefore(lens, img);
  /*calculate the ratio between result DIV and lens:*/
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  /*set background properties for the result DIV:*/
  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
  /*execute a function when someone moves the cursor over the image, or the lens:*/
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);
  result.addEventListener("mousemove", moveLens);
  /*and also for touch screens:*/
  lens.addEventListener("touchmove", moveLens);
  img.addEventListener("touchmove", moveLens);
  result.addEventListener("touchmove", moveLens);
  function moveLens(e) {
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image:*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    /*calculate the position of the lens:*/
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    /*prevent the lens from being positioned outside the image:*/
    if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
    if (x < 0) { x = 0; }
    if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
    if (y < 0) { y = 0; }
    /*set the position of the lens:*/
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /*display what the lens "sees":*/
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }
}

function addKeyFrames(animationName, from, to, cssAttribute) {
  let keyframes = `@keyframes ${animationName} { 0% { ${cssAttribute}: ${from}; } 100% { ${cssAttribute}: ${to}; } }`;
  let styleSheet = document.styleSheets[0];
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

function changeBackgroundColor(animationName, animationDuration = ".5s", animationFillMode = "forwards") {
  let style = {
    // animation: `${animationName} .4s linear forwards`,
    animationName: animationName,
    animationDuration: animationDuration,
    animationFillMode: animationFillMode,
    color: "#fff",
  };
  return style;
}

function ProductModel({ data, currentOptionProduct, handleProductPriceShow, setQuantityInput, setModelId, clearSelectProduct }) {
  return (
    <ul className="product-option">
      {
        data.productListPrice.map((value, index) => (
          <li key={index} className={`option-item btn${value.typeValue === currentOptionProduct.typeValue ? " option-item-active" : ""}`} onClick={() => {
            handleProductPriceShow(value, data.productId); setQuantityInput(1);
            setModelId(value.modelId);
            clearSelectProduct();
          }}><p>{value.typeValue}</p></li>
        ))
      }
    </ul>
  )
}

function ProductColor({ data, handleProductOptionShow, setProductColorData, setColorId, parameterFetch, fetProductInventory }) {


  return (
    <ul className="product-option">
      {
        data.map((value, index) => (
          <li key={index} style={value.showStatus === true ? changeBackgroundColor("backgroundChange") : {}} className="option-item btn" onClick={() => {
            setProductColorData(handleProductOptionShow(index, data));
            addKeyFrames("backgroundChange", "#fff", value.codeColor, "background-color");
            setColorId(value.productColorId);
            fetProductInventory(
              parameterFetch.productId,
              parameterFetch.modelId,
              value.productColorId,
              parameterFetch.storageId,
            );
          }}><p>{value.productColorName}</p></li>
        ))
      }
    </ul>
  )
}

function ProductStorage({ data, handleProductOptionShow, setProductStorageData, setStorageId, parameterFetch, fetProductInventory }) {
  return (
    <ul className="product-option">
      {
        data.map((value, index) => (
          <li key={index} className={`option-item btn${value.showStatus === true ? " option-item-active" : ""}`} onClick={() => {
            setProductStorageData(handleProductOptionShow(index, data));
            setStorageId(value.productStorageId);
            fetProductInventory(
              parameterFetch.productId,
              parameterFetch.modelId,
              parameterFetch.colorId,
              value.productStorageId,
            );
          }}><p>{value.productStorageName}</p></li>
        ))
      }
    </ul>
  )
}


export default function ZoomProduct({ userData }) {
  const disPatch = useDispatch(); // ใช้ add product to store react-redux
  const productInCart = useSelector((state) => state.counter.productCartData);
  const resultRef = useRef();
  const imgRef = useRef();
  // const quantityInputRef = useRef();
  let [resultStyle, setResultStyle] = useState({});
  let [animationShowStatus, setAnimationShowStatus] = useState(false);
  let [quantityInput, setQuantityInput] = useState("1");
  let [forceUpdate, setForceUpdate] = useState(1);
  let [disabledStatus, setDisabledStatus] = useState("");
  const defaultImageListData = [
    {
      productId: "",
      productInventoryId: "",
      productName: "",
      reviewStar: "",
      productListPrice: [
        {
          typeKey: "",
          typeValue: "",
          totalPrice: 0,
          discount: 0,
          discountPrice: 0,
        },
        {
          typeKey: "",
          typeValue: "",
          totalPrice: 0,
          discount: 0,
          discountPrice: 0,
        },
        {
          typeKey: "",
          typeValue: "",
          totalPrice: 0,
          discount: 0,
          discountPrice: 0,
        },
      ],
      productImage: [
        {
          imgSrc: "",
          imgActive: true
        },
        {
          imgSrc: "",
          imgActive: false
        },
        {
          imgSrc: "",
          imgActive: false
        },
        {
          imgSrc: "",
          imgActive: false
        },
      ]
    },

  ];
  const [imageListData, setImageListData] = useState(defaultImageListData);
  let [fetchProductStatus, setFetchProductStatus] = useState(false);
  let [productColorData, setProductColorData] = useState([]);
  let [productStorageData, setProductStorageData] = useState([]);
  let [productId, setProductId] = useState(0);
  let [modelId, setModelId] = useState(0);
  let [colorId, setColorId] = useState(0);
  let [storageId, setStorageId] = useState(0);
  let [imageCurrentActive, setImageCurrentActive] = useState(0);
  // อย่าลืมเอารูปมาใส่ตรงนี้ด้วย 16/12/64
  let [imageForZoom, setImageForZoom] = useState("")
  let [currentOptionProduct, setCurrentOptionProduct] = useState({});
  // let [imageForZoom, setImageForZoom] = useState(imageListData[0].productImage[0].imgSrc)
  // let [currentOptionProduct, setCurrentOptionProduct] = useState(imageListData[0].productListPrice[0]);
  let [loading, setLoading] = useState(true);
  const productCartData1 = useSelector((state) => state.counter.productCartData);
  useEffect(() => {
    fetchProductData();
    // peramid();
  }, [])

  const [imgStyle, setImgStyle] = useState({
    backgroundImage: `url(${imageForZoom})`,
    backgroundPosition: '0% 0%'
  });

  function handleImageActive(index) {
    let activeCurrentIndex = imageCurrentActive;
    imageListData[0].productImage[index].imgActive = true;
    imageListData[0].productImage[activeCurrentIndex].imgActive = false;
    setImageCurrentActive(index);
    setImageListData(imageListData);
  }

  function ImageList({ imageData }) {
    return (
      <ul className="image-list">
        {
          imageData.map((value, index) => (
            <li key={index} className={`image-item ${value.imgActive === true ? "image-item-active" : ""}`}>
              <button className="" type="button" onClick={() => { setImageForZoom(value.imgSrc); handleImageActive(index); }} >
                <img src={value.imgSrc} alt="" />
              </button>
            </li>
          ))
        }
      </ul>
    );

  }

  function handleZoomImageEffect(status) {
    if (status === "out") {
      setAnimationShowStatus(false);
      setResultStyle({
        opacity: "1",
      })
    }
    if (animationShowStatus === true) return;
    if (status === "zoom") {
      setAnimationShowStatus(true);
      setResultStyle({
        animation: `opacityFadeShow .4s linear forwards`,
      })
    }

  }

  function handleProductPriceShow(data, productId) {
    setCurrentOptionProduct(data);
    fetchColorProductData(productId, data.modelId);
    fetchStorageProductData(productId, data.modelId);
  }

  function handleAnimationAddProductToCart() {
    if (imageListData[0].productImage.length === 0) return [];
    disPatch(setIsAddProductActive(true))
    setDisabledStatus("disabled");
    setTimeout(() => {
      disPatch(setIsAddProductActive(false))
      setDisabledStatus("");
    }, 500)
  }
  // productInventoryId
  // async function handleAddProductCart(productData, currentOptionProduct, quantityInput, productInventoryId = ""){
  async function handleAddProductCart(productInventoryId = "", quantityInput) {
    if (productInventoryId === "") return
    try {

      let dataForSent = {
        userId: userData.id,
        productInventoryId: productInventoryId,
        quantityInput: quantityInput,
      };;

      const error1 = myfunction.checkEmpty(dataForSent);
      const error2 = myfunction.checkSpecialCharacter(dataForSent, ["token"]);
      const validateError = error1.concat(error2);
      if (validateError.length !== 0) { console.log(validateError); return; }
      let url = rootUrl + "api/add-product-cart";
      // ใช้ url เดียวกับ add new product เลย
      // if (checkProductSame(dataForSent, productInCart) === true) {
      //   // ถ้ามี product ในตะกร้าแล้ว
      //   dataForSent = {
      //     newQuantity: quantityInput,
      //     inventoryId: productInventoryId,
      //     secret: "juju"
      //   };
      //   url = rootUrl + "api/update-quantity-product-inCart";
      // }
      axiosConfigs.method = "POST";
      axiosConfigs.url = url;
      axiosConfigs.data = { data: JSON.stringify(dataForSent) };
      const addProductCart = await axios(axiosConfigs);
      if (addProductCart.data.status === false) {
        console.log(addProductCart.data);
        throw new Error(addProductCart.data.message)
      }

      const cartData = await fetchProductInCart(userData.id);
      const productCartFormat = setProductToCartDataFormat(cartData.data)
      disPatch(loadProductInCart(productCartFormat))

    } catch (error) {
      console.log(error)
    }

  }
  function convertDataToAddproductCart() {
    if (imageListData[0].productImage.length === 0) return [];
    let sentData = [];
    sentData.push(imageListData[0].productInventoryId);
    sentData.push(currentOptionProduct.typeValue);
    sentData.push(currentOptionProduct.totalPrice);
    sentData.push(currentOptionProduct.discountPrice);
    sentData.push(quantityInput);
    sentData.push(imageListData[0].productImage[0].imgSrc);
    sentData.push(currentOptionProduct.typeKey);
    sentData.push(currentOptionProduct.typeValue);
    return sentData;
  }

  function handleProductDataForFontendFormat(data) {
    let returnData = [];

    for (let i = 0; i < data.length; i++) {
      let fontendFormat = {
        productId: "",
        productName: "",
        reviewStar: "",
        productListPrice: [],
        productImage: [],
      }
      fontendFormat.productId = data[i].id;
      fontendFormat.productName = data[i].product_name;
      fontendFormat.reviewStar = data[i].content_detail;
      returnData.push(fontendFormat);
    }
    return returnData;
  }

  function handleProductModelDataForFontendFormat(data, imageListDataFormat) {
    let returnData = [];
    let imageListDataFormatFontend = imageListDataFormat;
    // let imageListDataState = [...imageListData]; // ไว้ดึงค่าจาก state ที่กำหนดไว้ทั้งมามา update ผ่าน state
    // let item = {...imageListDataState[0]};
    for (let i = 0; i < data.length; i++) {
      let fontendProductModelFormat = {
        modelId: "",
        typeKey: "",
        typeValue: "",
        totalPrice: 0,
        discount: 0,
        discountPrice: 0,
      };
      fontendProductModelFormat.modelId = data[i].id;
      fontendProductModelFormat.typeKey = data[i].product_model_key_text;
      fontendProductModelFormat.typeValue = `${imageListDataFormat[0].productName} ${data[i].product_model_name}`;
      returnData.push(fontendProductModelFormat);
    }
    // item.productListPrice = returnData;
    // imageListDataState[0] = item;
    imageListDataFormatFontend[0].productListPrice = returnData;
    return imageListDataFormatFontend;
  }

  function handleProductColorDataForFontendFormat(data) {
    let returnData = [];
    // let imageListDataState = [...imageListData]; // ไว้ดึงค่าจาก state ที่กำหนดไว้ทั้งมามา update ผ่าน state
    // let item = {...imageListDataState[0]};
    for (let i = 0; i < data.length; i++) {
      let productColorFormat = {
        productColorId: data[i].id,
        productColorName: data[i].product_color_name,
        productColorKey: data[i].product_color_key_text,
        codeColor: data[i].code_color,
        showStatus: false,
      };
      returnData.push(productColorFormat);
    }
    // item.productListPrice = returnData;
    // imageListDataState[0] = item;
    // imageListDataFormatFontend[0].productListPrice = returnData;
    return returnData;
  }

  function handleProductStorageDataForFontendFormat(data) {
    let returnData = [];
    // let imageListDataState = [...imageListData]; // ไว้ดึงค่าจาก state ที่กำหนดไว้ทั้งมามา update ผ่าน state
    // let item = {...imageListDataState[0]};
    for (let i = 0; i < data.length; i++) {
      let productColorFormat = {
        productStorageId: data[i].id,
        productStorageName: data[i].product_storage_name,
        productStorageKey: data[i].product_storage_key_text,
        showStatus: false,
      };
      returnData.push(productColorFormat);
    }
    // item.productListPrice = returnData;
    // imageListDataState[0] = item;
    // imageListDataFormatFontend[0].productListPrice = returnData;
    return returnData;
  }

  function handleProductInventoryDataForFontendFormat(data) {
    let productImage = [];
    let imageListDataState = [...imageListData]; // ไว้ดึงค่าจาก state ที่กำหนดไว้ทั้งมามา update ผ่าน state
    let item = { ...imageListDataState[0] };
    const imageList = JSON.parse(data.product_inventory_image_group);
    for (let i = 0; i < imageList.length; i++) {
      let show = false;
      if (i === 0) {
        show = true;
      }
      productImage.push(
        {
          imgSrc: imageList[i].imageUrl,
          imgActive: show,
        }
      );
    }
    item.productInventoryId = data.product_inventory_id;
    item.productImage = productImage;
    // item.productListPrice = returnData;
    imageListDataState[0] = item;
    handleCurrentOptionProduct(data.product_inventory_price, data.product_discount_total_price, data.product_discount_amount); // อยู่นี่
    return imageListDataState;
  }

  function handleCurrentOptionProduct(totalPrice = 0, discountPrice = 0, discount = 0) {
    let item = { ...currentOptionProduct };
    item["totalPrice"] = (totalPrice === null ? 0 : totalPrice);
    item["discountPrice"] = (discountPrice === null ? 0 : discountPrice);
    item["discount"] = (discount === null ? 0 : discount);
    currentOptionProduct = item;
    setCurrentOptionProduct(currentOptionProduct);
    // console.log(currentOptionProduct)
  }

  async function fetchProductData() {
    if (fetchProductStatus === true) return;
    try {
      axiosConfigs.method = "GET";
      let apiContent6sURL = rootUrl + "api/load-content-product/6";
      axiosConfigs.url = apiContent6sURL;
      const productProductData = await axios(axiosConfigs);
      if (productProductData.data.status === false) {
        throw new Error({
          productProductData: productProductData,
        })
      }
      setLoading(false);
      setFetchProductStatus(true);
      const imageListDataFormat = handleProductDataForFontendFormat(productProductData.data.data);
      fetchModelProductData(productProductData.data.data[0].id, imageListDataFormat);
      setProductId(productProductData.data.data[0].id);
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchModelProductData(productId, imageListData) {
    try {
      axiosConfigs.method = "GET";
      let apiContent6sURL = rootUrl + `api/product-model/${productId}`;
      axiosConfigs.url = apiContent6sURL;
      const productModelData = await axios(axiosConfigs);
      if (productModelData.data.status === false) {
        throw new Error({
          productModelData: productModelData,
        })
      }

      setLoading(false);
      const imageListDataFormat = handleProductModelDataForFontendFormat(productModelData.data.data, imageListData);
      setImageListData(imageListDataFormat);
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchColorProductData(productId, modelId) {
    try {
      axiosConfigs.method = "GET";
      let apiContent6sURL = rootUrl + `api/load-product_color/${productId}/${modelId}`;
      axiosConfigs.url = apiContent6sURL;
      let productColorData = await axios(axiosConfigs);
      if (productColorData.data.status === false) {
        throw new Error(productColorData.data.message)
      }
      const productColorDataSuccess = handleProductColorDataForFontendFormat(productColorData.data.data);
      setProductColorData(productColorDataSuccess);
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchStorageProductData(productId, modelId) {
    try {
      axiosConfigs.method = "GET";
      let apiContent6sURL = rootUrl + `api/load-product_storage/${productId}/${modelId}`;
      axiosConfigs.url = apiContent6sURL;
      const productStorageData = await axios(axiosConfigs);
      if (productStorageData.data.status === false) {
        throw new Error({
          productStorageData: productStorageData,
        })
      }

      const productStorageDataSuccess = handleProductStorageDataForFontendFormat(productStorageData.data.data);
      setProductStorageData(productStorageDataSuccess);
    } catch (error) {
      console.log(error)
    }
  }

  function peramid() {
    let text = "";
    for (let i = 1; i <= 5; i++) {
      for (let a = 5; a > 0; a--) {

        if (a <= i) {
          // text += "*";
        } else {
          // text += " ";
        }
      }
      // text += "\n";
    }
    for (let i = 1; i <= 5; i++) {
      for (let a = 9; a > 0; a--) {

        if (a > (parseInt(9 / 2) + 1) - i && a < (parseInt(9 / 2) + 1) + i) {
          text += "*";
        } else {
          text += " ";
        }
      }
      text += "\n";
    }
    //  *
    //  **
    //  ***
    //  ****
    //  *****
    // ข้อ 2
    //  *****
    //  ****
    //  ***
    //  **
    //  *
    // ข้อ 3
    //       *
    //      **
    //     ***
    //    ****
    //   *****
    // ข้อ 4
    //  *****
    //   ****
    //    ***
    //     **
    //      *
    // ข้อ 5
    //     *    
    //    ***    
    //   *****    
    //  *******   
    //  console.log(text);
  }
  // ทำต่อ ไปดึงจากตาราง inventory เพื่อเอาราคามาหลังจากเลือก option ครบ
  function handleProductOptionShow(index, data) {
    let dataState = data;
    for (let i = 0; i < dataState.length; i++) {
      if (i === index) {
        dataState[i].showStatus = true;
      }
      else {
        dataState[i].showStatus = false;
      }
    }

    setForceUpdate(++forceUpdate);
    return dataState;
  }

  async function fetProductInventory(productId, modelId, colorId, storageId) {
    if (productId === 0 || modelId === 0 || colorId === 0 || storageId === 0) return;
    if (productId === undefined || modelId === undefined || colorId === undefined || storageId === undefined) return;
    try {

      axiosConfigs.method = "GET";
      let apiContent6sURL = rootUrl + `api/load-product_inventory/${productId}/${modelId}/${colorId}/${storageId}`;
      axiosConfigs.url = apiContent6sURL;
      const productInventoryData = await axios(axiosConfigs);
      if (productInventoryData.data.status === false) {
        throw new Error(productInventoryData.data.message)
      }
      const imageListDataFormat = handleProductInventoryDataForFontendFormat(productInventoryData.data.data[0])
      setImageForZoom(imageListDataFormat[0].productImage[0].imgSrc);
      setImageListData(imageListDataFormat)
      imageZoom("myimage", "myresult", "zoom");
      setForceUpdate(++forceUpdate);
    } catch (error) {
      console.log(error)
    }
  }

  function clearSelectProduct() {
    if (modelId === 0) return
    setProductColorData([]);
    setProductStorageData([]);
    // setModelId(0);
    setColorId(0);
    setStorageId(0);
    setImageCurrentActive(0);
    setImageForZoom("");
    // setCurrentOptionProduct({});
    let imageListDataState = [...imageListData]; // ไว้ดึงค่าจาก state ที่กำหนดไว้ทั้งมามา update ผ่าน state
    let item = { ...imageListDataState[0] };
    item.productInventoryId = "";
    item.productImage = [];
    imageListDataState[0] = item;
    setImageListData(imageListDataState);
    imageZoom("", "", "clear");
    setForceUpdate(++forceUpdate);
  }

  return (
    <div className="zoomProduct-container">
      {/* <button onClick={() => disPatch(addProductToCartF(["asd", "312"]))}>Add Products</button> */}
      <div className="zoomProduct-wrapper">
        <div className="zoomProduct-left">
          <div className="image-main">
            {
              imageListData[0].productImage.length === 0
                ? ""
                :
                <ImageList imageData={imageListData[0].productImage} />
            }
          </div>
          <div className="img-zoom-container">
            {
              imageListData[0].productImage.length === 0
                ? ""
                :
                <figure id="myresult" className="img-zoom-result" onMouseOver={() => { handleZoomImageEffect("zoom"); }} onMouseLeave={() => { handleZoomImageEffect("out"); }} style={resultStyle} >
                  {
                    imageForZoom === ""
                      ? <div id="myimage" alt="" />
                      : <img id="myimage" src={imageForZoom} alt="" />
                  }
                </figure>
            }

          </div>
        </div>
        <div className="zoomProduct-right">
          <div className="product-buy-container">
            <div className="product-buy-header">
              <h2>{imageListData[0].productName}</h2>
              <div className="review-star-container">
                <div className="star"><p>*****</p></div>
                <div className="text-review"><p>3 review</p></div>
              </div>
              {/* <div className="product-price-container"> */}
              {
                currentOptionProduct.totalPrice !== undefined &&
                  currentOptionProduct.totalPrice !== 0 &&
                  currentOptionProduct.discountPrice !== undefined &&
                  currentOptionProduct.discount !== undefined
                  ?
                  <div className="product-price-container">
                    <div className={`discount-amount${currentOptionProduct.discount !== 0 ? ` btn bg-orange` : ""}`}>{currentOptionProduct.discount !== 0 ? `Save ${currentOptionProduct.discount}` : ""}</div>
                    <div className={`total-price ${currentOptionProduct.discount !== 0 ? "total-price-special" : ""}`}>${currentOptionProduct.totalPrice}</div>
                    <div className="discount-price">{currentOptionProduct.discount !== 0 ? `$${currentOptionProduct.discountPrice}` : ""}</div>
                  </div>
                  : ""
              }
              {/* </div> */}
            </div>
            <div className="product-buy-body">
              {

                currentOptionProduct.typeValue !== "" && currentOptionProduct.typeValue !== undefined
                  ? <h2>{currentOptionProduct.typeKey}: {currentOptionProduct.typeValue}</h2>
                  : ""
              }
              {/* <ul className="product-option">
                        {
                          imageListData[0].productListPrice.length === 0 
                          ? ""
                          : 
                          imageListData[0].productListPrice.map((value, index) => (
                            <li key={index} className={`option-item btn${value.typeValue === currentOptionProduct.typeValue ? " option-item-active" : ""}`} onClick={() => {handleProductPriceShow(imageListData, index); setQuantityInput(1);}}>{ value.typeValue }</li>
                          ))
                        }
                      </ul> */}
              {
                imageListData[0].productListPrice.length === 0
                  ? ""
                  :
                  <ProductModel
                    data={imageListData[0]}
                    currentOptionProduct={currentOptionProduct}
                    handleProductPriceShow={handleProductPriceShow}
                    setQuantityInput={setQuantityInput}
                    setModelId={setModelId}
                    clearSelectProduct={clearSelectProduct}
                  />
              }
              {
                productColorData.length === 0
                  ? ""
                  :

                  <ProductColor
                    data={productColorData}
                    handleProductOptionShow={handleProductOptionShow}
                    setProductColorData={setProductColorData}
                    setColorId={setColorId}
                    parameterFetch={{
                      productId: productId,
                      modelId: modelId,
                      colorId: colorId,
                      storageId: storageId,
                    }}
                    fetProductInventory={fetProductInventory}
                  />
              }
              {
                productStorageData.length === 0
                  ? ""
                  :

                  <ProductStorage
                    data={productStorageData}
                    handleProductOptionShow={handleProductOptionShow}
                    setProductStorageData={setProductStorageData}
                    setStorageId={setStorageId}
                    parameterFetch={{
                      productId: productId,
                      modelId: modelId,
                      colorId: colorId,
                      storageId: storageId,
                    }}
                    fetProductInventory={fetProductInventory}
                  />
              }

              <div className="product-cart-container">
                <div className="product-quantity">
                  {/* <label>Quantity</label>
                          <input autoFocus  ref={quantityInputRef} type="text" className={`${quantityInputShow === true ? "d-block" : "d-none"}`} value={quantityInput} onChange={(e) => { handleQuantityValue(e.target.value); }} />
                          <select value={quantityInput} className={`${quantityInputShow === false ? "d-block" : "d-none"}`} onChange={(e) => { handleQuantityValue(e.target.value); }}>
                            <Option quantity={10} />
                          </select> */}
                  <InputQuantity quantityInput={quantityInput} setQuantityInput={setQuantityInput} />
                </div>
                <div className="product-add-cart">
                  {/* convertDataToAddproductCart */}
                  <button className="btn" disabled={disabledStatus} onClick={() => { disPatch(addProductToCartF(getProductDetail(convertDataToAddproductCart()))); handleAddProductCart(imageListData[0].productInventoryId, quantityInput); handleAnimationAddProductToCart(); }}>Add to cart</button>
                  {/* <button className="btn" disabled={disabledStatus} onClick={ () => {disPatch(addProductToCartF(getProductDetail(handleAddProductCart(imageListData[0], currentOptionProduct, quantityInput)))); handleAnimationAddProductToCart(); }}>Add to cart</button> */}
                </div>
              </div>
            </div>
            <div className="product-buy-footter"></div>
          </div>
        </div>
      </div>
    </div>
  )
}


