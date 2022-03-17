const express = require('express');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');
// const moment = require("moment");
const crypto = require('crypto');
const md5 = require('md5');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const fs = require('fs');

const port = 3030;
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const classCustomValidation = require('./libary/CustomValidation.js');
const CustomValidation = new classCustomValidation();
const domainName = `http://localhost:${port}/`;
const passport = require('passport');
const request = require('request');
// qrPayment
const generatePayload = require('promptpay-qr')
const qrcode = require('qrcode')
// socket io
const http = require('http');
const { json } = require('body-parser');
// const ioS = require("socket.io");
// const socketIO = ioS();

require('./configs/passport');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src')));
// access folder uploads
app.use('/uploads', express.static(process.cwd() + '/uploads'))
app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());


const server = http.createServer(app);
const rootServer = "http://localhost:3030";
// socketio
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});
// const io = socketIO.listen(server);

// start of server
server.listen(port, function () {
    console.log('listening on *: ' + port + "\n");
});
// const server = app.listen(port, () => {
//     console.log(`Server started on port ${port}`);
// });


// var socket = socketIO('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
// รอการ connect จาก client
io.on('connection', (client) => {
    // console.log(client.handshake.query);
    // console.log('user connected')

    // เมื่อ Client ตัดการเชื่อมต่อ
    client.on('disconnect', () => {
        console.log('user disconnected')
    })

    // ส่งข้อมูลไปยัง Client ทุกตัวที่เขื่อมต่อแบบ Realtime
    client.on('meWalletLogin-success', function (clientData) {
        io.sockets.emit(`meWalletLogin-success-${clientData.userRef}`, clientData)
        console.log(clientData.userRef);
    })
})
// socketio end
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
// homepage route
app.get('/', (req, res) => {
    return res.send({
        error: false,
        message: 'Welcome to RESTful CRUD API with NodeJS, Express, MYSQL',
        written_by: 'Patiphan',
        published_on: 'https://milerdev.dev'
    })
})

async function connect() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'ecommerce',
            connectionLimit: 10000,
        });
        return connection;
    } catch (e) {
        return false;
    }
}
// get zone
app.get('/api/load-contents', async (req, res) => {
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };
    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const [rows, fields] = await dbCon.query(`SELECT * FROM contents WHERE content_active = 1`);
    if (rows.length == 0) {
        returnData.status = false;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-content/:contentGroupId', async (req, res) => {
    const contentGroupId = req.params.contentGroupId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([contentGroupId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const [rows, fields] = await dbCon.query(`SELECT * FROM contents WHERE content_group_id = ? AND content_active = 1`, [contentGroupId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-content-product/:contentGroupId', async (req, res) => {
    const contentGroupId = req.params.contentGroupId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([contentGroupId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT \
    products.id, \
    products.product_name, \
    products.product_detail \
    FROM contents \
    INNER JOIN products_contents \
    ON contents.id = products_contents.content_id\
    INNER JOIN products \
    ON products.id = products_contents.product_id\
    WHERE content_group_id = ? \
    AND product_active = 1 \
    AND product_content_active = 1 \
    AND content_active = 1 \
    ";

    const [rows, fields] = await dbCon.query(strSQL, [contentGroupId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/product-model/:productId', async (req, res) => {
    const productId = req.params.productId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([productId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    // FROM contents \
    // INNER JOIN products_contents \
    // ON contents.id = products_contents.content_id\
    // INNER JOIN products \
    // ON products.id = products_contents.product_id\
    // INNER JOIN product_model \
    // ON product_model.product_id = products.id \
    const strSQL = "SELECT \
    product_model.id, \
    product_model.product_model_name, \
    product_model.product_model_key_text \
    FROM product_model \
    WHERE product_model.product_id = ? \
    AND product_model_active = 1 \
    ";

    const [rows, fields] = await dbCon.query(strSQL, [productId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-product_color/:productId/:modelId', async (req, res) => {
    const productId = req.params.productId;
    const modelId = req.params.modelId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([productId, modelId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT DISTINCT\
    product_color.id ,\
    product_color.product_color_name, \
    product_color.product_color_key_text, \
    product_color.code_color \
    FROM product_color \
    INNER JOIN product_inventory \
    ON product_color.id = product_inventory.color_id \
    WHERE product_inventory.product_id = ? \
    AND product_inventory.model_id = ? \
    AND product_color.product_color_active = 1 \
    AND product_inventory.product_inventory_active = 1 \
    ";
    const [rows, fields] = await dbCon.query(strSQL, [productId, modelId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "data not found!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-product_storage/:productId/:modelId', async (req, res) => {
    const productId = req.params.productId;
    const modelId = req.params.modelId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([productId, modelId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT DISTINCT\
    product_storage.id ,\
    product_storage.product_storage_name, \
    product_storage.product_storage_key_text \
    FROM product_storage \
    INNER JOIN product_inventory \
    ON product_storage.id = product_inventory.storage_id \
    WHERE product_inventory.product_id = ? \
    AND product_inventory.model_id = ? \
    AND product_storage.product_storage_active = 1 \
    AND product_inventory.product_inventory_active = 1 \
    ";
    const [rows, fields] = await dbCon.query(strSQL, [productId, modelId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "data not found!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-product_inventory/:productId/:modelId/:colorId/:storageId', async (req, res) => {
    const productId = req.params.productId;
    const modelId = req.params.modelId;
    const colorId = req.params.colorId;
    const storageId = req.params.storageId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([productId, modelId, colorId, storageId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT DISTINCT\
    product_inventory.id AS product_inventory_id,\
    product_inventory.product_inventory_image,\
    product_inventory.product_inventory_image_group,\
    product_inventory.product_inventory_price, \
    products_discount.product_discount_amount, \
    products_discount.product_discount_total_price \
    FROM product_inventory \
    LEFT JOIN products_discount ON \
    products_discount.product_inventory_id = product_inventory.id\
    WHERE product_inventory.product_id = ? \
    AND product_inventory.model_id = ? \
    AND product_inventory.color_id = ? \
    AND product_inventory.storage_id = ? \
    AND product_inventory.product_inventory_active = 1 \
    ";
    const [rows, fields] = await dbCon.query(strSQL, [productId, modelId, colorId, storageId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "data not found!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});


// ทำเผื่อไว้แบบโหลดครั้งเดียว แต่จริงๆให้ลูกค้าเลือกก่อนถึงโหลด
app.get('/api/load-content-discount/:contentGroupId', async (req, res) => {
    const contentGroupId = req.params.contentGroupId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([contentGroupId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT \
    contents.content_detail, \
    products.product_name, \
    products_discount.product_discount_total_price, \
    products_discount.product_discount_amount, \
    product_inventory.id, \
    product_inventory.product_inventory_image, \
    product_inventory.product_inventory_price, \
    product_model.product_model_name \
    FROM contents \
    INNER JOIN products_contents ON \
    products_contents.content_id = contents.id \
    LEFT JOIN products_discount ON \
    products_discount.id = products_contents.product_discount_id \
    RIGHT JOIN product_inventory ON \
    product_inventory.id = products_discount.product_inventory_id \
    INNER JOIN products ON \
    products.id = product_inventory.product_id \
    INNER JOIN product_model ON \
    product_model.id = product_inventory.model_id \
    WHERE contents.content_group_id = ? \
    AND content_active = 1\
    AND product_content_active = 1\
    AND product_discount_active = 1\
    AND product_inventory_active = 1\
    AND product_active = 1\
    ";

    const [rows, fields] = await dbCon.query(strSQL, [contentGroupId]);
    if (rows.length == 0) {
        returnData.status = false;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-content-zoomProduct/:contentGroupId', async (req, res) => {
    const contentGroupId = req.params.contentGroupId;
    let returnData = { status: true, data: [], message: "Loaded contents successfully." };

    const error = CustomValidation.checkNumeric([contentGroupId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }

    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    const strSQL = "SELECT DISTINCT \
    contents.content_detail, \
    products.product_name, \
    product_model.id AS modelId, \
    product_model.product_model_name, \
    product_model.product_model_key_text, \
    product_color.id AS colorId, \
    product_color.product_color_name, \
    product_storage.id AS storageId , \
    product_storage.product_storage_name , \
    product_inventory.id, \
    product_inventory.product_inventory_image, \
    product_inventory.product_inventory_price \
    FROM contents \
    INNER JOIN products_contents ON \
    products_contents.content_id = contents.id \
    INNER JOIN products ON \
    products.id = products_contents.product_id \
    INNER JOIN product_inventory ON \
    product_inventory.product_id = products.id \
    INNER JOIN product_model ON \
    product_model.id = product_inventory.model_id \
    INNER JOIN product_color ON \
    product_color.id = product_inventory.color_id \
    INNER JOIN product_storage ON \
    product_storage.id = product_inventory.storage_id\
    WHERE contents.content_group_id = ? \
    AND contents.content_group_active = 1\
    ";

    const [rows, fields] = await dbCon.query(strSQL, [contentGroupId]);
    if (rows.length == 0) {
        returnData.status = true;
        returnData.data = [];
        returnData.message = "Can't find contents data!";
        return res.send(returnData);
    }
    returnData.data = rows;

    dbCon.end();
    return res.send(returnData);
});

app.get('/api/load-product-cart/:userId', verifyToken, async (req, res) => {
    const userId = req.params.userId;
    let returnData = { status: true, data: [], message: "Loaded product in cart successfully." };

    const error = CustomValidation.checkNumeric([userId])
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Format request failed!" });
    }
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        const dbCon = await connect();
        // if (dbCon === false) {
        //     returnData.status = false;
        //     returnData.message = "Can't connect database.";
        //     return res.status(500).send(returnData)
        // }

        const strSQL = "SELECT DISTINCT \
    products_cart.id AS cartId, \
    products_sub_cart.id AS subCartId, \
    products.product_name, \
    product_model.id AS modelId, \
    product_model.product_model_name, \
    product_model.product_model_key_text, \
    product_color.id AS colorId, \
    product_color.product_color_name, \
    product_color.product_color_key_text, \
    product_storage.id AS storageId, \
    product_storage.product_storage_name, \
    product_storage.product_storage_key_text, \
    product_inventory.id AS inventoryId, \
    product_inventory.product_inventory_image, \
    product_inventory.product_inventory_price, \
    products_discount.product_discount_amount, \
    products_discount.product_discount_percen, \
    IF(products_discount.product_discount_total_price IS NULL, 0, products_discount.product_discount_total_price) AS product_discount_total_price,\
    products_sub_cart.product_sub_cart_amount, \
    products_sub_cart.product_sub_cart_total_sum \
    FROM product_inventory \
    INNER JOIN products ON \
    products.id = product_inventory.product_id \
    INNER JOIN product_model ON \
    product_model.id = product_inventory.model_id \
    INNER JOIN product_color ON \
    product_color.id = product_inventory.color_id \
    INNER JOIN product_storage ON \
    product_storage.id = product_inventory.storage_id\
    LEFT JOIN products_discount ON \
    products_discount.product_inventory_id = product_inventory.id\
    INNER JOIN products_sub_cart ON \
    products_sub_cart.product_inventory_id = product_inventory.id\
    INNER JOIN products_cart ON \
    products_cart.id = products_sub_cart.product_cart_id\
    WHERE products_cart.user_id = ? \
    AND product_sub_cart_active = 1\
    ";
        /*
        CASE\
        WHEN products_discount.product_discount_total_price > 0 THEN products_discount.product_discount_total_price\
        WHEN products_discount.product_discount_total_price <= 0 THEN product_inventory.product_inventory_price\
    END AS product_sum_price,\
        */
        const [rows, fields] = await dbCon.query(strSQL, [userId]);
        if (rows.length == 0) {
            returnData.status = true;
            returnData.data = [];
            returnData.message = "Can't find contents data!";
            return res.send(returnData);
        }
        returnData.data = rows;

        dbCon.end();
        return res.send(returnData);
    });
});

app.post('/api/confirm-order', verifyToken, async (req, res) => {
    if (!JSON.parse(req.body.data)) {
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    let returnData = { status: true, data: [], message: "Confirm order successfully." };
    const data = JSON.parse(req.body.data);
    // console.log(data)
    // ทำคำนวณของในตะกร้าบันทึกเข้า database โดยดึงข้อมู,จากตาราง product_cart มาบันทึก ไม่เอาจากหน้า fontend 
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
    ];
    const validate1 = validateForm(data, "shoppingInformation", /[`!#$%^*()+\[\]{};'"\|,<>~]/, numericIgnore)
    const validate2 = validateForm(data.shipping, "", /[`!#$%^&*()_+\=\[\]{};'"\\|,<>?~]/, numericIgnore)
    const validate3 = validateForm(data.productInCart, "", /[`!#$%^*()+\[\]{};'"\|,<>~]/, numericIgnore)
    const validate4 = validateForm(data.userData, "", /[`!#$%^&*()+\=\[\]{};"\\|,<>?~]/, numericIgnore)
    const errorValidate = validate1.concat(
        validate2,
        validate3,
        validate4,
    );
    if (Object.entries(errorValidate).length > 0) {
        return res.send({ status: false, data: errorValidate, message: "Validate error!" });
    }

    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) return res.status(403).send({ status: false, data: err, message: "Please send secret key!" });
        const dbCon = await connect();
        const cartId = data.productInCart[0].cartId;
        const userId = data.userData.id;
        // เดี๋ยวต้องทำ featture เช็คว่าสินค้าในตะกร้าว่า ส่วนลดหมดเขตหรือยังถ้าหมดแล้วต้องอัพเดท
        const totalPriceInCart = await getDetailInCart(cartId);
        const cartTotalSum = totalPriceInCart.cartTotalSum;
        const cartTotalCountItem = totalPriceInCart.cartTotalCountItem;
        const cartTotalDiscount = totalPriceInCart.cartTotalDiscount;
        let lastInsertIdBillOrder, lastInsertIdTransectionPay, lastInsertId3
        const billSubId = await generateBillSubId();
        let strSql = "INSERT INTO bill_orders\
            (\
                bill_order_count,\
                bill_order_total_sum,\
                bill_order_total_discount,\
                bill_order_by,\
                bill_sub_id\
            )\
            VALUES(?, ?, ?, ?, ?)\
            ";

        const response = await dbCon.query(strSql, [cartTotalCountItem, cartTotalSum, cartTotalDiscount, userId, billSubId]);
        lastInsertIdBillOrder = response[0].insertId;

        const orderIncart = await getOrderInCart(cartId);
        const orderIncartFinish = setOrderInCartForInsert(orderIncart, lastInsertIdBillOrder, userId);
        strSql = "INSERT INTO bill_sub_orders\
            (\
                bill_order_id,\
                product_inventory_id,\
                bill_sub_order_amount,\
                bill_sub_order_total_sum,\
                bill_sub_order_total_discount,\
                bill_sub_order_by\
            )\
            VALUES ?\
            ";

        const response2 = await dbCon.query(strSql, [orderIncartFinish]);
        const updatePaymentUrl = domainName + "api/updatePayment";
        strSql = "INSERT INTO transection_pay\
            (\
                ref1,\
                amount,\
                update_url\
            )\
            VALUES(?, ?, ?)\
            ";
        const currentDate = CustomValidation.createDate();
        const ref1Id = `${lastInsertIdBillOrder}${currentDate.year}${currentDate.month}${currentDate.day}${currentDate.hours}${currentDate.minutes}${currentDate.seconds}`;
        const ref1Base64 = Buffer.from(ref1Id).toString('base64');
        const response3 = await dbCon.query(strSql, [ref1Base64, cartTotalSum, updatePaymentUrl]);
        lastInsertIdTransectionPay = response3[0].insertId;

        strSql = "INSERT INTO bill_payment\
        (\
            bill_order_id,\
            payment_type_id,\
            transection_id,\
            bill_payment_by\
        )\
        VALUES(?, ?, ?, ?)\
        ";
        const response4 = await dbCon.query(strSql, [lastInsertIdBillOrder, 2, lastInsertIdTransectionPay, userId]);


        // ยิง api ไปยังระบบ me-wallet

        const meWalletForm = {
            'apiKey': 'JDJ5JDEwJHh6cExYM3BwcVdkcWU1RjFEbHVNdk9aTTNTU3hPT1liV3BWY2dwYi4veUlvL3pFb0wxQTFH',
            'partnerId': 'MjAyMjAxMTQ0',
            'memberId': data.meWalletId,
            'amount': cartTotalSum,
            'update_url': updatePaymentUrl,
            'success_url': updatePaymentUrl,
            'fail_url': updatePaymentUrl,
            'ref1': ref1Base64,
            'ref2': 'ref2',
            'ref3': 'ref3',
        }
        const meWalletUrl = 'http://127.0.0.1:8000/api/payment-order';
        const responseMeWallet = await sendToPaymentMeWallet("POST", meWalletUrl, meWalletForm);
        const responseMeWalletObject = JSON.parse(responseMeWallet);

        if (responseMeWalletObject.status !== false) {
            strSql = "DELETE FROM `products_sub_cart`\
             WHERE \
             product_cart_id = ?\
            ";
            await dbCon.query(strSql, [cartId]);
            returnData.message = "Payment successfully";
        } else {
            returnData.status = false;
            returnData.data = responseMeWalletObject.error;
            returnData.message = responseMeWalletObject.message;

        }
        dbCon.end();
        return res.send(returnData);
    });
});

async function getPaymentMeWalletToken() {
    const options = {
        'method': 'POST',
        'url': 'http://127.0.0.1:8000/api/accessToken',
        'headers': {
            'Accept': 'application/json',
        },
        formData: {
            'apiKey': 'JDJ5JDEwJHh6cExYM3BwcVdkcWU1RjFEbHVNdk9aTTNTU3hPT1liV3BWY2dwYi4veUlvL3pFb0wxQTFH',
            'partnerId': 'MjAyMjAxMTQ0'
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) { console.log(error); throw new Error(error); }
            // console.log(response);
            resolve(response.body);
        })

    });
}

async function sendToPaymentMeWallet(method, url, formData) {
    const accessPaymentToken = await getPaymentMeWalletToken();
    const accessPaymentTokenJson = JSON.parse(accessPaymentToken);
    const options = {
        'method': method,
        'url': url,
        'headers': {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessPaymentTokenJson.data.token}`
        },
        formData: formData
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) { console.log(error); throw new Error(error); }
            resolve(response.body);
        })
    });

}

function validateForm(data, validateType, regexValidate, numericIgnore) {
    // shoppingInformation
    const validate1 = CustomValidation.checkEmpty(data, ["discountCode", "detail"]);
    const validate2 = CustomValidation.checkSpecialCharacter(data, [], regexValidate);
    const validate3 = CustomValidation.checkNumeric(data, numericIgnore);
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

function checkLength(phone, lengthLimit, message = "Phone number is valid", field) {
    if (phone.length === lengthLimit) return []
    return { field: field, msg: `${field} '${phone}' ${message}` }
}

app.post('/api/add-product-cart', verifyToken, async (req, res) => {
    if (!JSON.parse(req.body.data)) {
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    let returnData = { status: true, data: [], message: "Add product to cart successfully" };
    const data = JSON.parse(req.body.data);
    // return res.send({ status: false, data: data, message: "Validate format data error!"});
    const tokenAccess = getTokenFromBearer(req.headers.authorization);
    let error = {};
    const error1 = CustomValidation.checkEmpty(data)
    const error2 = CustomValidation.checkNumeric(data, ["token"])
    const error3 = CustomValidation.checkSpecialCharacter(data, ["token"], /[`!#$%^&*()_+\=\[\]{};'"\\|,<>?~]/)
    error = error1.concat(error2, error3);
    if (Object.entries(error).length > 0) {
        return res.send({ status: false, data: error, message: "Validate error!" });
    }
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) return res.status(403).send({ status: false, data: err, message: "Please send secret key!" });

        const productPrice = await calProductPriceBeforeInsert(data.productInventoryId);
        const productDiscount = await calProductDiscountBeforeInsert(data.productInventoryId);

        const dbCon = await connect();

        // check ว่า มี product ชิ้นนั้นอยู่ในตะกร้าหรือยัง
        const productSubData = await checkSameProductInCart(data.productInventoryId);
        if (productSubData) {

            const productTotalPrice = (parseFloat(productPrice) * data.quantityInput) + productSubData[0].product_sub_cart_total_sum;
            const productTotalDiscount = (parseFloat(productDiscount) * data.quantityInput) + productSubData[0].product_sub_cart_total_discount;
            const productTotalQuantity = parseInt(data.quantityInput) + parseInt(productSubData[0].product_sub_cart_amount);
            const strSql = "UPDATE products_sub_cart\
            SET\
                product_sub_cart_amount = ?,\
                product_sub_cart_total_sum = ?,\
                product_sub_cart_total_discount = ?\
            WHERE id = ?\
            ";

            await dbCon.query(strSql, [productTotalQuantity, productTotalPrice, productTotalDiscount, productSubData[0].id])
            returnData.data = [];
            returnData.message = ["Add product to cart successfully"];
            return res.send(returnData);
        }

        //   check ว่ามี cart แล้วหรือยัง
        let lastInsertId = await checkProductCart(data.userId);
        // ยังไม่มีสร้าง cart ก่อน
        if (lastInsertId === false) {
            const strSql = "INSERT INTO products_cart\
            (user_id, product_cart_by, product_cart_active)\
            VALUES(?, ?, 1)\
            ";

            const response = await dbCon.query(strSql, [data.userId, data.userId])
            lastInsertId = response[0].insertId;
        }
        // มีแล้ว add product to cart เลย
        if (lastInsertId) {
            const productTotalPrice = productPrice * data.quantityInput;
            const productTotalDiscount = productDiscount * data.quantityInput;
            const strSql2 = "INSERT INTO products_sub_cart\
            (\
                product_cart_id, \
                product_inventory_id,\
                product_sub_cart_amount,\
                product_sub_cart_by,\
                product_sub_cart_active,\
                product_sub_cart_total_sum,\
                product_sub_cart_total_discount\
            )\
            VALUES(\
                    ?,\
                    ?,\
                    ?,\
                    ?,\
                    1,\
                    ?,\
                    ?\
                )\
            ";

            // const response2 = await dbCon.query(strSql2, [lastInsertId, data.productInventoryId, data.quantityInput, data.userId])
            dbCon.query(strSql2, [lastInsertId, data.productInventoryId, data.quantityInput, data.userId, productTotalPrice, productTotalDiscount]).then(([rows, fields]) => {
                returnData.data = [];
                returnData.message = ["Add product to cart successfully"];
                return res.send(returnData);
            })
                .catch(async (err) => {
                    console.log(err)
                    const strSql = "DELETE FROM products_cart WHERE id = ?";
                    await dbCon.query(strSql, [lastInsertId]);
                    returnData.status = false;
                    returnData.data = [];
                    returnData.message = ["Someting went wrong2!"];
                    dbCon.end();
                    return res.send(returnData);
                })
        } else {
            returnData.status = false;
            returnData.data = [];
            returnData.message = ["Someting went wrong1!"];
            dbCon.end();
            return res.send(returnData);
        }
    });
});

app.post('/api/delete-product-inCart', verifyToken, async (req, res) => {
    if (!JSON.parse(req.body.data)) {
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    const data = JSON.parse(req.body.data);
    if (data.secret !== "juju") return res.send({ status: false, data: [], message: "Secret is valid!" });
    const subCartId = data.subCartId;
    let returnData = { status: true, data: [], message: "Delete product cart successfully." };
    const validateError = CustomValidation.checkNumeric([subCartId])

    if (validateError.length > 0) {
        return res.send({ status: false, data: error, message: "Validate error!" });
    }
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) return res.status(403).send({ status: false, data: err, message: "Please send secret key!" });
        const dbCon = await connect();
        const strSql = "UPDATE products_sub_cart SET product_sub_cart_active = 0 WHERE id = ?";
        const [results, fields] = await dbCon.execute(strSql, [subCartId]);
        returnData.data = ["success"];
        dbCon.end();
        return res.send(returnData);
    });
});


app.post('/api/update-quantity-product-inCart', verifyToken, async (req, res) => {
    if (!JSON.parse(req.body.data)) {
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    const data = JSON.parse(req.body.data);
    if (data.secret !== "juju") return res.send({ status: false, data: [], message: "Secret is valid!" });
    const subCartId = data.subCartId;
    let newQuantity = data.newQuantity;
    const inventoryId = data.inventoryId;
    let returnData = { status: true, data: [], message: "Updated product cart successfully." };
    const validateError = CustomValidation.checkNumeric([(subCartId === undefined ? 0 : subCartId), newQuantity, inventoryId])

    if (validateError.length > 0) {
        return res.send({ status: false, data: error, message: "Validate error!" });
    }
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) return res.status(403).send({ status: false, data: err, message: "Please send secret key!" });

        const productPrice = await calProductPriceBeforeInsert(inventoryId);
        const productDiscount = await calProductDiscountBeforeInsert(inventoryId);
        const productTotalPrice = productPrice * newQuantity;
        const productTotalDiscount = productDiscount * newQuantity;

        const strSql = `UPDATE products_sub_cart 
        SET product_sub_cart_amount = ?, 
            product_sub_cart_total_sum = ? ,
            product_sub_cart_total_discount = ? 
            WHERE id = ?`;
        const dbCon = await connect();
        const [results, fields] = await dbCon.execute(strSql, [newQuantity, productTotalPrice, productTotalDiscount, subCartId]);
        returnData.data = ["success"];
        dbCon.end();
        return res.send(returnData);
    });
});

app.post('/api/updatePayment', async (req, res) => {
    if (!JSON.stringify(req.body.data)) {
        console.log("Validate format data error!")
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    // jwt.verify(req.token, 'secretkey', async (err, authData) => {
    const data = req.body.data;
    const paymentRef = data.paymentRef;
    const statusPay = data.statusPay;
    const ref1 = data.ref1;
    const validateError1 = CustomValidation.checkSpecialCharacter([paymentRef, statusPay], [], /[`!#$%^&*()_+\[\]{};'"\\|,<>?~]/)
    const validateError2 = CustomValidation.checkString([paymentRef, statusPay]);
    const validate = validateError1.concat(validateError2);
    if (validate.length > 0) {
        console.log(validate)
        return res.send({ status: false, data: validate, message: "Validate error!" });
    }

    const dbCon = await connect();
    let strSql = "UPDATE transection_pay SET \
    api_server_id = ?, \
    status_pay = ?, \
    json = ?\
    WHERE \
    ref1 = ?";
    await dbCon.execute(strSql, [paymentRef, statusPay, JSON.stringify(req.body.data), ref1]);

    strSql = "SELECT id FROM transection_pay \
    WHERE \
    ref1 = ?";
    const [rows, fields] = await dbCon.query(strSql, [ref1]);

    strSql = "UPDATE bill_payment SET \
    bill_payment_status = ?, \
    bill_payment_date = ? \
    WHERE \
    transection_id = ?";
    let billPaymentStatus = 0;
    if (statusPay === "success") {
        billPaymentStatus = 1
    }
    await dbCon.execute(strSql, [billPaymentStatus, billPaymentStatus, rows[0]["id"]]);
    dbCon.end();
    return res.send({ status: true, data: [], message: "Update transection successfully" });
    // });
});

app.post('/api/meWallet-login', verifyToken, async (req, res) => {
    if (!JSON.stringify(req.body.data)) {
        console.log("Validate format data error!")
        return res.send({ status: false, data: [], message: "Validate format data error!" });
    }
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        const data = JSON.parse(req.body.data);
        const username = data.username;
        const password = data.password;
        const validateError = CustomValidation.checkString(data);
        if (validateError.length > 0) {
            console.log(validateError)
            return res.send({ status: false, data: validateError, message: "Validate error!" });
        }
        const meWalletForm = {
            'apiKey': 'JDJ5JDEwJHh6cExYM3BwcVdkcWU1RjFEbHVNdk9aTTNTU3hPT1liV3BWY2dwYi4veUlvL3pFb0wxQTFH',
            'partnerId': 'MjAyMjAxMTQ0',
            'username': username,
            'password': password,
        }
        const meWalletUrl = 'http://127.0.0.1:8000/api/meWallet-login';
        const responseLogin = await sendToPaymentMeWallet("POST", meWalletUrl, meWalletForm);
        const response = JSON.parse(responseLogin);
        if (response.status === true) {
            return res.send({ status: true, data: response, message: "Login successfully" });
        } else {
            return res.send({ status: false, data: response, message: "Login failed" });
        }


    });
});

app.post('/api/loginToken', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let returnData = { status: true, data: [], message: "Login successfully." };
    if (username === undefined || password === undefined) {
        returnData.status = false;
        returnData.data = [];
        returnData.message = "Incorrect information";
        return res.send(returnData);
    }
    const validateData = validationData(req.body);
    if (validateData.length > 0) {
        returnData.status = false;
        returnData.data = validateData;
        returnData.message = "Validate fail.";
        return res.send(returnData);
    }
    const dbCon = await connect();
    // if (dbCon === false) {
    //     returnData.status = false;
    //     returnData.message = "Can't connect database.";
    //     return res.status(500).send(returnData)
    // }
    // md5(password)
    const [rows, fields] = await dbCon.query(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password]);
    if (rows.length == 0) {
        returnData.status = false;
        returnData.data = ["Incorrect username or password"];
        returnData.message = "Incorrect username or password";
        return res.send(returnData);
    }
    // Mock user
    const userData = {
        id: rows[0]["id"],
        // username: rows[0]["username"],
        firstname: rows[0]["firstname"],
        lastname: rows[0]["lastname"],
        nickname: rows[0]["nickname"],
        expiresIn: "",
        expiresInSecond: 0,
        token: "",
        isLogin: true,
    }
    // let mySession = req.session;
    req.session.cookie.userData = userData;
    // mySession.userData = userData;
    const jwtTokenData = await createJwtToken(userData);
    userData.token = jwtTokenData.token;
    userData.expiresIn = jwtTokenData.expiresIn;
    returnData.data = userData;
    // const sessionOption = {
    //     secret: 'keyboard cat',
    //     resave: false,
    //     saveUninitialized: true,
    //     cookie: { secure: true }
    //   };
    // session(sessionOption, {userData: userData});

    dbCon.end();
    return res.send(returnData);

});
app.post('/api/refeshToken', verifyToken, async (req, res) => {
    jwt.verify(req.body.token.token, 'secretkey', async (err, authData) => {
        let data = req.body.token;
        let returnData = { token: "", expiresIn: "" };
        const jwtTokenData = await createJwtToken(data, 5);
        returnData.expiresIn = jwtTokenData.expiresIn;
        returnData.token = jwtTokenData.token;
        res.status(200).send({ status: true, data: returnData, message: "OK" });
    });
    // gen new token
});

app.get('/api/get-qrPayment/:qrPaymentAmount', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.status(401).send({ status: false, data: [], message: "auth fail" });
            return
        }
        const qrPaymentAmount = req.params.qrPaymentAmount;
        const qrPath = await genQRPayment(qrPaymentAmount);
        const returnData = { qrPath: qrPath, amount: qrPaymentAmount };
        res.status(200).send({ status: true, data: returnData, message: "OK" });
    });

});

function getTokenFromBearer(bearer) {
    let bearerText = "bearer";
    let bearerArray = bearerText.split(" ");
    return bearerArray[1];
}

// validation
function validationData(objectData) {
    const error1 = CustomValidation.checkEmpty(objectData)
    const error2 = CustomValidation.checkSpecialCharacter(objectData, [], /[`!#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/)
    const error = error1.concat(error2);
    if (Object.entries(error).length > 0) {
        return error;
    }
    return [];
}

// fetch total price in cart
async function getDetailInCart(cartId) {
    let returnData = [];
    const dbCon = await connect();
    const strSQL = "SELECT DISTINCT \
    products_cart.id AS cartId, \
    SUM(product_sub_cart_total_sum) AS cartTotalSum,\
    SUM(product_sub_cart_amount) AS cartTotalCountItem,\
    SUM(product_sub_cart_total_discount) AS cartTotalDiscount\
    FROM products_cart \
    INNER JOIN products_sub_cart ON \
    products_cart.id = products_sub_cart.product_cart_id\
    WHERE products_cart.id = ? \
    AND product_sub_cart_active = 1\
    ";
    const [rows, fields] = await dbCon.query(strSQL, [cartId]);
    if (rows.length > 0) {
        returnData = rows;
    }
    dbCon.end();
    return new Promise((resolve, reject) => {
        resolve(rows[0]);
    });
}

function setOrderInCartForInsert(cartData, LastOrderId, userId) {
    let returnData = [];
    for (let i = 0; i < cartData.length; i++) {
        returnData.push([
            LastOrderId,
            cartData[i].product_inventory_id,
            cartData[i].product_sub_cart_amount,
            cartData[i].product_sub_cart_total_sum,
            cartData[i].product_sub_cart_total_discount,
            userId,
        ]);

    }
    return returnData;
}
// bill_sub_order detail
async function getOrderInCart(cartId) {
    let returnData = [];
    const dbCon = await connect();
    const strSQL = "SELECT \
    product_inventory_id, \
    product_sub_cart_amount, \
    product_sub_cart_total_sum, \
    product_sub_cart_total_discount \
    FROM products_cart \
    INNER JOIN products_sub_cart ON \
    products_cart.id = products_sub_cart.product_cart_id\
    WHERE products_cart.id = ? \
    AND product_sub_cart_active = 1\
    ";
    const [rows, fields] = await dbCon.query(strSQL, [cartId]);
    if (rows.length > 0) {
        returnData = rows;
    }
    dbCon.end();
    return new Promise((resolve, reject) => {
        resolve(rows);
    });
}

// fetch total price in cart ทำ gen bill เพิ่ม
async function generateBillSubId() {
    let returnData = "";
    const dbCon = await connect();
    const currentDate = CustomValidation.createDate();
    const currentYear = currentDate.year;
    const currentMonth = currentDate.month;
    const currentdDate = currentDate.day;
    const strSQL = "SELECT \
    bill_sub_id,\
    DATE_FORMAT(bill_order_created_at, '%Y-%m-%d') AS bill_order_created_at\
    FROM bill_orders \
    ORDER BY id DESC\
    LIMIT 1 \
    ";
    const [rows, fields] = await dbCon.query(strSQL);
    dbCon.end();
    if (rows.length === 0) {
        returnData = `${currentYear}${currentMonth}${currentdDate}|000001`;
        return new Promise((resolve, reject) => {
            resolve(returnData);
        });
    }

    const billDate = rows[0].bill_order_created_at;
    if (billDate == currentDate.dateFormat) {
        const billSub = rows[0].bill_sub_id;
        const billSubSplit = billSub.split("|");
        const billLastNumber = parseInt(billSubSplit[1]);
        const billSubFinish = setBillNumberFormat(billLastNumber, 6);
        returnData = `${currentYear}${currentMonth}${currentdDate}|${billSubFinish}`;
    } else {
        returnData = `${currentYear}${currentMonth}${currentdDate}|000001`;
    }

    return new Promise((resolve, reject) => {
        resolve(returnData);
    });
}

function setBillNumberFormat(billSubInt, maxBill) {

    const billSubString = (billSubInt + 1).toString();
    let returnData = "";
    const maxBillFormat = maxBill - billSubString.length;
    for (let i = 0; i < maxBillFormat; i++) {
        returnData += "0";
    }
    returnData += billSubString;
    return returnData;
}

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
async function createJwtToken(user, minutes = "") {
    const date = CustomValidation.createDate();
    const startDate = date.fullFormat;
    let endDate = `${date.year}-${date.month}-${date.day} 23:59:59`;
    if (minutes !== "") {
        const endDates = CustomValidation.addMinutes(parseInt(minutes));
        endDate = endDates.dateFormat;
    }
    const expiresIn = CustomValidation.calculateDays(startDate, endDate);
    const tokenGen = jwt.sign({ user }, 'secretkey', { expiresIn: `${expiresIn.asSeconds}s` });
    return { token: tokenGen, expiresIn: endDate, expiresInSecond: expiresIn.asSeconds }
    // jwt.sign({user}, 'secretkey', { expiresIn: `${expiresIn.asSeconds}s` }, (err, token) => {
    //     user.token = token;
    //   res.json({
    //     user
    //   });
    //     return user;
    // });
}
// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}

async function calProductPriceBeforeInsert(inventoryId) {
    let productPrice = 0;
    const dbCon = await connect();
    const [rowsDiscount, fields] = await dbCon.query(`SELECT product_discount_total_price FROM products_discount WHERE product_inventory_id = ? AND product_discount_active = 1`, [inventoryId]);
    if (rowsDiscount.length > 0) {
        dbCon.end();
        return new Promise((resolve, reject) => {
            resolve(rowsDiscount[0].product_discount_total_price)
        })
    }
    const [rowsInventory, fields1] = await dbCon.query(`SELECT product_inventory_price FROM product_inventory WHERE id = ?`, [inventoryId]);
    dbCon.end();
    return new Promise((resolve, reject) => {
        resolve(rowsInventory[0].product_inventory_price)
    })
}

async function calProductDiscountBeforeInsert(inventoryId) {
    let productDiscount = 0;
    const dbCon = await connect();
    const [rowsDiscount, fields] = await dbCon.query(`SELECT product_discount_amount FROM products_discount WHERE product_inventory_id = ? AND product_discount_active = 1`, [inventoryId]);
    dbCon.end();
    if (rowsDiscount.length > 0) {
        productDiscount = rowsDiscount[0].product_discount_amount;
    }
    return new Promise((resolve, reject) => {
        resolve(productDiscount);
    })
}

async function checkSameProductInCart(productInventoryId) {

    const dbCon = await connect();
    let returnData = false;
    const [rowsSubCart, fields] = await dbCon.query(`SELECT
    id , 
    product_inventory_id ,
    product_sub_cart_amount ,
    product_sub_cart_by ,
    product_sub_cart_active ,
    product_sub_cart_total_sum ,
    product_sub_cart_total_discount 
    FROM products_sub_cart 
    WHERE product_inventory_id = ?
    AND product_sub_cart_active = 1
    `
        , [productInventoryId]);
    dbCon.end();

    if (rowsSubCart.length > 0) {

        returnData = rowsSubCart;
    }
    return new Promise((resolve, reject) => {
        resolve(returnData)
    })
}

async function checkProductCart(userId) {
    const dbCon = await connect();
    let returnData = false;
    const [rowsCart, fields] = await dbCon.query(`SELECT id FROM products_cart WHERE user_Id = ?`, [userId]);
    dbCon.end();
    if (rowsCart.length > 0) {

        returnData = rowsCart[0].id;
    }
    return new Promise((resolve, reject) => {
        resolve(returnData)
    })
}

async function uploadImage(imgBase64) {
    let returnData = { status: true, message: "", validation: [], pathImage: "" };
    if (imgBase64 == "" || imgBase64 == undefined) {
        returnData.validation = [`The file is not empty.`];
        returnData.status = false;
        returnData.message = "Validate fail.";
        return returnData;
    }
    const imageData = imgBase64;
    const imageFile = CustomValidation.decodeBase64Image(imageData)
    const imageFileBase64 = imageFile.base64;
    const imageFileDataBase64 = imageFile.data;
    const currentDateObject = CustomValidation.createDate();
    const currentYear = currentDateObject.year;
    const currentMonth = currentDateObject.month;
    const currentDay = currentDateObject.day;
    const currentHours = currentDateObject.hours;
    const pathImage = `${currentYear}${currentMonth}${currentDay}`;
    // const pathImageHash = "./uploads/" + crypto.createHash('md5').update(pathImage).digest('hex'); // ถ้าไม่ใส่ host เข้าไป เวลา fontend fetch แล้วหาที่อยู่รูปไม่เจอ
    const pathImageHash = "uploads/" + crypto.createHash('md5').update(pathImage).digest('hex');
    const pathImageSuccess = `${pathImageHash}/${pathImage}`;
    const imageName = `${currentYear}${currentMonth}${currentDay}${currentHours}${currentDateObject.minutes}${currentDateObject.seconds}${currentDateObject.milliseconds}`;
    const imageNameBase64 = Buffer.from(imageName).toString('base64') + "." + imageFile.imageType;
    const maxSizeMB = 3;
    // check path ก่อนสร้าง
    if (!fs.existsSync(pathImageSuccess)) {
        // สร้าง path
        fs.mkdirSync(pathImageSuccess, { recursive: true });
    }
    if (!CustomValidation.checkFileSizeBase64(imageFileBase64, maxSizeMB)) {
        returnData.validation = [`The file size must not exceed ${maxSizeMB} MB.`];
        returnData.status = false;
        returnData.message = "Validate fail.";
        return returnData;
    }
    return new Promise(function (resolve, reject) {
        fs.writeFile(`${pathImageSuccess}/${imageNameBase64}`, imageFileDataBase64, function (err) {
            if (err) {
                returnData.status = false;
                returnData.message = "Something went wrong in fs.writeFile!";
                returnData.validation = ["Something went wrong in fs.writeFile!"];
                resolve(returnData);
            } else {
                returnData.pathImage = `${domainName}${pathImageSuccess}/${imageNameBase64}`;
                resolve(returnData)
            };
        });
    });
    // await fs.writeFile(`${pathImageSuccess}/${imageNameBase64}`, imageFileDataBase64, function(err) { 
    //     console.log(err) 
    // }) 
    // return returnData;
}

function genQRPayment(qrAmount) {
    const mobileNumber = '086-529-7465';
    const IDCardNumber = '0-0000-00000-00-0';
    const amount = parseFloat((Math.round(qrAmount * 100) / 100).toFixed(2));
    const payload = generatePayload(mobileNumber, { amount }); //First parameter : mobileNumber || IDCardNumber
    let returnData = "";
    // Convert to SVG QR Code
    // chek qrcode image
    const pathCheck = `uploads/qr-payment/qr-${qrAmount}.png`;
    return new Promise((resolve, reject) => {


        try {
            fs.lstatSync(pathCheck).isDirectory();
            resolve(`${rootServer}/${pathCheck}`);
        } catch (e) {
            // Handle error
            if (e.code == 'ENOENT') {
                const options = { type: 'svg', color: { dark: '#000', light: '#fff' } };

                const option = {
                    color: {
                        dark: "#000", // สีตัว QRcode ตรงนี้กำหนดไว้เป็นสีน้ำ
                        light: "#fff" // สีพื้นหลัง
                    }
                }
                qrcode.toFile(pathCheck, payload, option, function (err) {
                    if (err) {
                        console.log(err)
                        resolve(err);
                    }
                    returnData = pathCheck;
                    resolve(`${rootServer}/${returnData}`);
                })
            } else {
                resolve("Create qr fail");
            }
        }

        // if (path.basename(pathCheck)) {
        //     returnData = pathCheck
        //     console.log("dog")

        //     resolve(returnData)
        // } else {
        //     const options = { type: 'svg', color: { dark: '#000', light: '#fff' } }
        //     qrcode.toString(payload, options, (err, svg) => {
        //         if (err) {
        //             resolve(err)
        //             console.log(err)
        //             return
        //         }
        //         returnData = pathCheck;
        //         console.log(returnData)
        //         fs.writeFileSync(returnData, svg)
        //         resolve(returnData)
        //     })
        // }
    })
}






