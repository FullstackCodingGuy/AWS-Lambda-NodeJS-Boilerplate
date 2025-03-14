# AWS-Lambda-NodeJS-Boilerplate
Boilerplate code for AWS Lambda Function - using NodeJS runtime.

- API Gateway → Exposes endpoints for CRUD operations.
- AWS Lambda → Handles business logic for order management.
- Amazon DocumentDB (MongoDB-compatible) → Stores order data.
- Amazon SQS → Handles message queue processing.
- Amazon ElastiCache (Redis) → Caches order details for fast retrieval.
- AWS SAM (Serverless Application Model) → Defines infrastructure as code.

---

1️⃣ **template.yaml (AWS SAM Template)**
> Defines the Lambda functions, API Gateway, SQS, and ElastiCache.

1. Create ```mongodb``` test instance (preferably local), Configure your mongodb url at ```DB_URI``` in template.yaml
2. Create ```redis``` test instance at REDIS_HOST
```
docker run --name local-redis -p 6379:6379 -d redis

This command will start a Redis server on localhost at port 6379.

```


### Commands you can use next
- Create pipeline: ```cd order-manager && sam pipeline init --bootstrap```
- Validate SAM template: ```cd order-manager && sam validate```
- Test Function in the Cloud: ```cd order-manager && sam sync --stack-name {stack-name} --watch```


### Build project

```
sam build
```

### Deploy project

```
sam deploy --guided
```

**The AWS SAM CLI deploys your application by doing the following:**
- The AWS SAM CLI creates  ̑an Amazon S3 bucket and uploads your .aws-sam directory.
- The AWS SAM CLI transforms your AWS SAM template into AWS CloudFormation and uploads it to the AWS CloudFormation service.
- AWS CloudFormation provisions your resources.

### Output

![alt text](image.png)

Once the stack is created/updated successfully, then you will find the api gateway endpoint url. 

**To get the endpoint url:**

Use the ```sam list endpoints --output json``` command to get this information

**To Invoke the function**

1. Using curl
```
curl https://ets1gv8lxi.execute-api.us-west-2.amazonaws.com/Prod/hello/
{"message": "hello world"}
```

2. Using sam command

```
# example
sam remote invoke HelloWorldFunction --stack-name sam-app

# real

sam remote invoke CreateOrderFunction --stack-name order-manager-stack

```

![alt text](image-1.png)


### Modify and sync your application to the AWS Cloud

> Use the AWS SAM CLI sam sync --watch command to sync local changes to the AWS Cloud.


In your command line, from the sam-app project directory, run the following:

```
sam sync --watch
```

> The AWS SAM CLI prompts you to confirm that you are syncing a development stack. Since the ```sam sync --watch``` command automatically deploys local changes to the AWS Cloud in real time, we recommend it for development environments only.


### Test your application locally

> Use the AWS SAM CLI sam local command to test your application locally. To accomplish this, the AWS SAM CLI creates a local environment using Docker. This local environment emulates the cloud-based execution environment of your Lambda function.

1. Create a local environment for your Lambda function and invoke it.
2. Host your HTTP API endpoint locally and use it to invoke your Lambda function.

In your command line, from the sam-app project directory, run the following:
```
sam local invoke

// To call a specific function
sam local invoke CreateOrderFunction --event events/createOrder.json

// To pass local env variables - only for local testing
sam local invoke CreateOrderFunction --event events/createOrder.json --env-vars env.json


```

![alt text](image-2.png)

### To host your API locally

In your command line, from the sam-app project directory, run the following:

```
sam local start-api
```

![alt text](image-3.png)


### Delete

In your command line, from the sam-app project directory, run the following:

```
sam delete
```


### **🚨 Recovering from Accidental S3 Bucket Deletion in AWS SAM**  

If you've **accidentally deleted the S3 bucket** used by **AWS SAM**, you’ll need to **create a new bucket** and **remap it** to AWS SAM.

---

## **1️⃣ Create a New S3 Bucket**
You can manually create an S3 bucket or use the AWS CLI:

```sh
aws s3 mb s3://my-new-sam-bucket --region us-east-1
```
🔹 Replace **`my-new-sam-bucket`** with a unique bucket name.  
🔹 Replace **`us-east-1`** with your AWS region.

---

## **2️⃣ Update AWS SAM to Use the New Bucket**
Modify your **SAM configuration file (`samconfig.toml`)** to reference the new bucket.

🔹 **Locate `samconfig.toml`** in your project.  
🔹 Update the `s3_bucket` value:

```toml
[default.deploy.parameters]
s3_bucket = "my-new-sam-bucket"
s3_prefix = "my-app"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
stack_name = "my-app-stack"
```

Alternatively, specify the new bucket during deployment:

```sh
sam deploy --s3-bucket my-new-sam-bucket
```

---

## **3️⃣ Rebuild and Deploy AWS SAM**
Run the following to rebuild and redeploy:

```sh
sam build
sam deploy --guided
```

This ensures that SAM now uses the **new S3 bucket**.

---

## **4️⃣ Optional: Clean Up Old References**
If AWS SAM was using a **deleted bucket**, you might encounter an error like:  

🚨 **"The specified bucket does not exist"**  

To fix this:
- **Check `.aws-sam` directory**:  
  ```sh
  rm -rf .aws-sam
  ```
- **Clear SAM cache** (if needed):
  ```sh
  sam cache clear
  ```
- Then **rebuild & deploy** again.

---

### **✅ Summary**
✔️ **Created a new S3 bucket**  
✔️ **Updated AWS SAM to use the new bucket**  
✔️ **Rebuilt & deployed the application**  



### References

- https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html
- [A Practical Guide to Surviving AWS SAM](https://medium.com/bip-xtech/a-practical-guide-to-surviving-aws-sam-d8ab141b3d25)
- [Different Ways of Passing Parameters Securely in CloudFormation](https://tutorialsdojo.com/different-ways-of-passing-parameters-securely-in-cloudformation/)