const dbContext = require("../utils/dbContext");
// const { getCache, setCache } = require("../utils/cache");

exports.handler = async (event) => {

  const id = event.pathParameters.id;
  // let order = await getCache(`order:${orderId}`);

  // if (!order) {
  //   order = await Order.findOne({ orderId });
  //   if (!order) return { statusCode: 404, body: "Order not found" };
  //   await setCache(`order:${orderId}`, order);
  // }

  const order = dbContext.Orders().Get({ id });

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
};
