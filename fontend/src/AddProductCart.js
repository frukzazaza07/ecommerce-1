
export function getProductDetail(productData) {
    if (productData.length === 0) return false;
    let returnData = {};
    returnData["inventoryId"] = productData[0];
    returnData["productName"] = productData[1];
    returnData["productPrice"] = productData[2];
    if (productData[2] === productData[3]) {
        returnData["productDiscountPrice"] = 0;
    } else {
        returnData["productDiscountPrice"] = productData[3];
    }
    returnData["productQuantity"] = productData[4];
    returnData["productImageUrl"] = productData[5];
    returnData["product_color_key_text"] = productData[6];
    returnData["product_color_name"] = productData[7];
    returnData["product_storage_key_text"] = productData[8];
    returnData["product_storage_name"] = productData[9];
    returnData["productTotalPrice"] = 0;
    returnData["subCartId"] = productData[10];
    returnData["cartId"] = productData[11];
    returnData = calculateTotalPrice(returnData, "object");
    return returnData;
}

export function calculateTotalPrice(productInCart, index = null) {
    let newData = productInCart
    let productSumPrice = 0;
    if (index === null) {
        for (let i = 0; i < newData.length; i++) {
            productSumPrice = calculateTotalPriceLogic(newData[i]);
            newData[i].productTotalPrice = productSumPrice;
        }
    } else if (typeof newData === "object") {
        // console.log("object")
        productSumPrice = calculateTotalPriceLogic(newData);
        newData.productTotalPrice = productSumPrice;
    } else {
        // console.log("else")
        productSumPrice = calculateTotalPriceLogic(newData[index]);
        newData[index].productTotalPrice = productSumPrice;
    }
    return newData;
}

function calculateTotalPriceLogic(productData) {
    let productSumPrice = 0;
    if (parseFloat(productData.productDiscountPrice) !== 0) {
        productSumPrice = parseFloat(productData.productDiscountPrice) * parseFloat(productData.productQuantity);
    } else {
        productSumPrice = parseFloat(productData.productPrice) * parseFloat(productData.productQuantity);
    }
    return productSumPrice;
}