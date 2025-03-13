const connectDB = require("../utils/db");
const Order = require("../models/orderModel");
const { getCache, setCache } = require("../utils/cache");

exports.handler = async (event) => {
  await connectDB();

  const orderId = event.pathParameters.id;
  let order = await getCache(`order:${orderId}`);

  if (!order) {
    order = await Order.findOne({ orderId });
    if (!order) return { statusCode: 404, body: "Order not found" };
    await setCache(`order:${orderId}`, order);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
};
