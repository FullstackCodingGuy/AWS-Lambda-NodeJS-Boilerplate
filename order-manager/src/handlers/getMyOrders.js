const dbContext = require("../utils/dbContext");

exports.handler = async (event) => {

  const body = await dbContext.Orders().Scan();

  console.log('items: ', body.Items)

  if (!body || !body.Items) return { statusCode: 404, body: "Orders not found" };

  return {
    statusCode: 200,
    body: JSON.stringify(body.Items),
  };
};
