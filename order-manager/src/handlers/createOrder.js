// const { setCache } = require("../utils/cache");
// const { sendToQueue } = require("../utils/sqs");
const { v4: uuidv4 } = require("uuid");
const dbContext = require("../utils/dbContext");



exports.handler = async (event) => {
  try {

    const { items } = event;

    if (!items || !items.length) {
      throw 'Items not configured in the payload'
    }

    const order = {
      id: uuidv4(),
      items
    };

    const response = await dbContext.Orders().Put(order);

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
