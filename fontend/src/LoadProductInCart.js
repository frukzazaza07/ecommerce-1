import ServerUrl from './ServerUrl.js';
import axios from "axios";
import { getProductDetail } from './AddProductCart'
import { axiosConfig } from './axiosConfig.js';
const axiosConfigs = axiosConfig();
const rootUrl = ServerUrl().rootUrl;
export async function fetchProductInCart(userId) {
    try {
        axiosConfigs.method = "GET";
        let apiUrl = rootUrl + `api/load-product-cart/${userId}`;
        axiosConfigs.url = apiUrl;
        const productInCartData = await axios(axiosConfigs);
        if (productInCartData.data.status === false) {
            throw new Error(productInCartData.data.message)
        }

        return new Promise((resolve, reject) => {
            resolve(productInCartData.data)
        })
    } catch (error) {
        console.log(error)
    }
}

export function setProductToCartDataFormat(data) {

    let dataFormatReturn = [];
    for (let i = 0; i < data.length; i++) {
        let dataFormat = [];
        dataFormat.push(data[i].inventoryId);
        dataFormat.push(`${data[i].product_name} ${data[i].product_model_name}`);
        dataFormat.push(data[i].product_inventory_price);
        dataFormat.push(data[i].product_discount_total_price);
        dataFormat.push(data[i].product_sub_cart_amount);
        dataFormat.push(data[i].product_inventory_image);
        dataFormat.push(data[i].product_color_key_text);
        dataFormat.push(data[i].product_color_name);
        dataFormat.push(data[i].product_storage_key_text);
        dataFormat.push(data[i].product_storage_name);
        dataFormat.push(data[i].subCartId);
        dataFormat.push(data[i].cartId);
        dataFormatReturn.push(getProductDetail(dataFormat));

    }
    return dataFormatReturn;
}