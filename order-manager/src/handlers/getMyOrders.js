const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ordersTable = "OrdersTable";

exports.handler = async (event) => {

  const body = await dynamo.send(
    new ScanCommand({
      TableName: ordersTable,
    })
  );

  console.log('items: ', body.Items)

  if (!body || !body.Items) return { statusCode: 404, body: "Orders not found" };

  return {
    statusCode: 200,
    body: JSON.stringify(body.Items),
  };
};
