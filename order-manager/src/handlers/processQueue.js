exports.handler = async (event) => {
    for (const record of event.Records) {
      const { orderId, status } = JSON.parse(record.body);
      console.log(`Processing order ${orderId} with status: ${status}`);
    }
    return { statusCode: 200, body: "SQS messages processed" };
  };
  