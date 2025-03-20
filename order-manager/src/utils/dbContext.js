const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, ScanCommand, PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ordersTable = "OrdersTable";

// console.log("🔒 HOSTING_ENV:", process.env.HOSTING_ENV);
// console.log("🔒 AWS Region:", process.env.AWS_REGION);

const dbActions = (tableName) => {

    const actions = {
        Get: async (whereClause) => {
            const command = new GetCommand({
                TableName: tableName,
                Key: whereClause
            });

            const response = await docClient.send(command);
            return response.Item;
        },
        Put: async (obj) => {
            const command = new PutCommand({
                TableName: tableName,
                Item: obj,
            });

            const response = await docClient.send(command);
            return response;
        },
        Scan: async () => {
            const body = await docClient.send(
                new ScanCommand({
                    TableName: tableName,
                })
            );
            return body.Items;
        },
    };
    return (actions)

}

const dbContext = {

    Orders: () => dbActions(ordersTable)

};

module.exports = dbContext;
