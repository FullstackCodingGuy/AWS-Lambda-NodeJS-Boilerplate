const connectDB = require("../utils/db");
const Order = require("../models/orderModel");
// const { setCache } = require("../utils/cache");
// const { sendToQueue } = require("../utils/sqs");
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ordersTable = "OrdersTable";


exports.handler = async (event) => {
  try {

    const { id, items } = event;

    if (!items || !items.length) {
      throw 'Items not configured in the payload'
    }

    console.log('Processing Order Id:', id, ', Item Count: ', items.length);

    const order = {
      id,
      items
    };

    const command = new PutCommand({
      TableName: ordersTable,
      Item: order,
    });

    const response = await docClient.send(command);
    console.log('order-created:', order, response);

    // Payload Sample
    // {
    //   "id": "2",
    //   "items": [
    //     {
    //       "id": "1",
    //       "name": "tv"
    //     },
    //     {
    //       "id": "2",
    //       "name": "monitor"
    //     }
    //   ]
    // }


    // await setCache(`order:${order.orderId}`, order);

    // console.log('cache-set:', order);

    // await sendToQueue({ orderId: order.orderId, status: "Pending" });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Order created", orderId: order.id }),
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
