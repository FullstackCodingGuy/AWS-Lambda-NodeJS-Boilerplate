const connectDB = require("../utils/db");
const Order = require("../models/orderModel");

exports.handler = async (event) => {
  await connectDB();

  order = await Order.find({});
  if (!order) return { statusCode: 404, body: "Order not found" };

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
};
