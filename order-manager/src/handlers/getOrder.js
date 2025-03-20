const dbContext = require("../utils/dbContext");
// const { getCache, setCache } = require("../utils/cache");

exports.handler = async (event) => {

  console.log('get-order-event: ', event)
  if (!event || !event.pathParameters || !event.pathParameters.id) {
    throw 'Invalid parameters specified.'
  }

  const id = event.pathParameters.id;
  // let order = await getCache(`order:${orderId}`);

  // if (!order) {
  //   order = await Order.findOne({ orderId });
  //   if (!order) return { statusCode: 404, body: "Order not found" };
  //   await setCache(`order:${orderId}`, order);
  // }

  const order = await dbContext.Orders().Get({ id });

  if (!order) {
    return {
      statusCode: 404,
      body: 'Data not found for the give id.'
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
};
