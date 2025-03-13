const connectDB = require("../utils/db");
const Order = require("../models/orderModel");
const { setCache } = require("../utils/cache");
// const { sendToQueue } = require("../utils/sqs");
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  await connectDB();
  console.log('db connected');

  const { customerName, items } = JSON.parse(event.body);
  
  console.log('customerName:', customerName);
  console.log('items:', items);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const order = new Order({ orderId: uuidv4(), customerName, items, totalAmount });
  await order.save();

  console.log('order-created:', order);

  // await setCache(`order:${order.orderId}`, order);

  // console.log('cache-set:', order);

  // await sendToQueue({ orderId: order.orderId, status: "Pending" });

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Order created", orderId: order.orderId }),
  };
};
