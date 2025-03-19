const connectDB = require("../utils/db");
const Order = require("../models/orderModel");
// const { setCache } = require("../utils/cache");
// const { sendToQueue } = require("../utils/sqs");
const { v4: uuidv4 } = require("uuid");

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ordersTable = "OrdersTable";


exports.handler = async (event) => {
  try {

    console.log('Environment:', process.env);

    const res = await dynamodb.get({
      TableName: ordersTable,
      Key: { "id": "3" }
    }).promise();

    console.log("res from get item:", res);
    console.log("item from res: ", res.Item);

    const newCount = res.Item.count + 1;

    const res2 = await dynamodb.put({
      TableName: ordersTable,
      Item: {
        "id": "3",
        "count": newCount
      }
    }).promise();

    console.log("res2 after update: ", res2);


    // await connectDB();

    // const { customerName, items } = JSON.parse(event.body);

    // const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // const order = new Order({ orderId: uuidv4(), customerName, items, totalAmount });
    // await order.save();

    // console.log('order-created:', order);

    // await setCache(`order:${order.orderId}`, order);

    // console.log('cache-set:', order);

    // await sendToQueue({ orderId: order.orderId, status: "Pending" });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Order created", orderId: order.orderId }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        event: event,
        exception: e.toString()
      })
    };
  }
};
