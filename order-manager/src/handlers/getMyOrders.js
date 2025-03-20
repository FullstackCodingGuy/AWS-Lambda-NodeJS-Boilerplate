const dbContext = require("../utils/dbContext");

exports.handler = async (event) => {

  const items = await dbContext.Orders().Scan();

  console.log('items: ', items)

  if (!items) return { statusCode: 404, body: "Orders not found" };

  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
