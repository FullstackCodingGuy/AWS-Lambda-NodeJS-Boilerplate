import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { MongoClient } from "mongodb";
import * as fs from "fs";

const secretsManager = new SecretsManagerClient({});
const SECRET_NAME = "my-documentdb-secret";
const DB_NAME = "mydatabase";
const COLLECTION_NAME = "orders";

// Function to retrieve secrets from AWS Secrets Manager
async function getSecret(): Promise<{ username: string; password: string; host: string }> {
    try {
        const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
        const secretData = await secretsManager.send(command);
        if (!secretData.SecretString) throw new Error("SecretString is empty");
        return JSON.parse(secretData.SecretString);
    } catch (error) {
        console.error("Error retrieving secrets:", error);
        throw error;
    }
}

const getCertificate = async () => {
    try {
        const secretName = "my-documentdb-ca-cert";
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await secretsManager.send(command);
        // if (response.SecretString) {
        //     return Buffer.from(response.SecretString, "utf-8");
        // }

        // Save the certificate to a temp file
        const certPath = "/tmp/rds-ca.pem"; 
        fs.writeFileSync(certPath, response.SecretString);

        return certPath;
    } catch (error) {
        console.error("❌ Error retrieving certificate from Secrets Manager:", error);
        throw error;
    }
};

export default async function handler(event: any) {

    let client: MongoClient | null = null;

    try {

        console.log('acquiring db credentials..')
        // Retrieve DocumentDB credentials
        const { username, password, host } = await getSecret();

        console.log('username, password, host: ', username, password, host)

        const certPath = await getCertificate();

        // Construct MongoDB connection URI
        const uri = `mongodb://${username}:${password}@${host}:27017/${DB_NAME}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

        console.log('mongodb.uri: ', uri)

        // Connect to DocumentDB
        client = new MongoClient(uri, {
            tls: true,
            tlsCAFile: certPath,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Insert Order
        const order = {
            orderId: new Date().getTime(),
            product: "Laptop",
            quantity: 2,
            status: "Pending",
            createdAt: new Date(),
        };

        const result = await collection.insertOne(order);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Order added successfully",
                orderId: result.insertedId,
            }),
        };
    } catch (error) {
        console.error("Error connecting to DocumentDB", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to DocumentDB" }),
        };
    } finally {
        if (client) await client.close();
    }
    
}


// export const handler = async (event: any) => {
//     let client: MongoClient | null = null;

//     try {

//         console.log('acquiring db credentials..')
//         // Retrieve DocumentDB credentials
//         const { username, password, host } = await getSecret();

//         console.log('username, password, host: ', username, password, host)

//         // Construct MongoDB connection URI
//         const uri = `mongodb://${username}:${password}@${host}:27017/${DB_NAME}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

//         console.log('mongodb.uri: ', uri)

//         // Connect to DocumentDB
//         client = new MongoClient(uri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             tlsCAFile: "/opt/rds-combined-ca-bundle.pem", // Required for TLS
//         });

//         await client.connect();
//         const db = client.db(DB_NAME);
//         const collection = db.collection(COLLECTION_NAME);

//         // Insert Order
//         const order = {
//             orderId: new Date().getTime(),
//             product: "Laptop",
//             quantity: 2,
//             status: "Pending",
//             createdAt: new Date(),
//         };

//         const result = await collection.insertOne(order);

//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 message: "Order added successfully",
//                 orderId: result.insertedId,
//             }),
//         };
//     } catch (error) {
//         console.error("Error connecting to DocumentDB", error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: "Failed to connect to DocumentDB" }),
//         };
//     } finally {
//         if (client) await client.close();
//     }
// };
