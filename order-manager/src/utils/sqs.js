const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({ region: "us-east-1" });

const sendToQueue = async (message) => {
  const params = {
    QueueUrl: process.env.SQS_URL,
    MessageBody: JSON.stringify(message),
  };
  await sqs.send(new SendMessageCommand(params));
};

module.exports = { sendToQueue };
