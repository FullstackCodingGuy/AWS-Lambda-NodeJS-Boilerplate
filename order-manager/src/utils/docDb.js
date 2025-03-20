const mongoose = require("mongoose");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// console.log("🔒 HOSTING_ENV:", process.env.HOSTING_ENV);
// console.log("🔒 AWS Region:", process.env.AWS_REGION);

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

const getMongoDBURI = async () => {
  try {
    const secretArn = process.env.MONGODB_SECRET_ARN; // ARN from SAM
    // console.log("🔒 MongoDB Secret ARN:", secretArn);
    const secret = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );
    const secretValue = JSON.parse(secret.SecretString);

    // console.log("🔒 Secret MongoDB URI:", secretValue.mongodb_uri);

    return secretValue.mongodb_uri; // Fetch MongoDB URI from Secrets Manager
  } catch (err) {
    console.error("❌ Error fetching secret:", err);
    throw err;
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  let connectionString = process.env.DB_URI;

  if (process.env.HOSTING_ENV !== "Development") {
    connectionString = await getMongoDBURI();
  }

  // console.log("✅ Final MongoDB URI:", connectionString);

  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;
