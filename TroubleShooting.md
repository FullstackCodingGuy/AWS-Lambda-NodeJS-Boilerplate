## Issue
```
CreateOrderFunction                              Resource handler returned message: "The        
                                                                                                                                                   provided execution role does not have          
                                                                                                                                                   permissions to call CreateNetworkInterface on  
                                                                                                                                                   EC2 (Service: Lambda, Status Code: 400,        
                                                                                                                                                   Request ID:                                    
                                                                                                                                                   22539f14-95da-4ef9-90a7-d6699931dd56)"         
                                                                                                                                                   (RequestToken:                                 
                                                                                                                                                   a6b223ce-78c4-2f4e-7cce-4206a2a73456,          
                                                                                                                                                   HandlerErrorCode: InvalidRequest)   
```

## Possible Solution

### **🔴 Issue:**  
Your **Lambda function** is deployed in a **VPC** but lacks permission to create a **network interface** (ENI) in **Amazon EC2**.  
This is required when a **Lambda function runs inside a VPC** and needs to access **Amazon DocumentDB, MongoDB Atlas, or other VPC services**.

---

## **✅ Solution: Update Lambda Execution Role**
You need to modify the **LambdaExecutionRole** to grant **EC2 network interface permissions**.

### **🔹 Update `template.yaml` with the Following IAM Permissions**
```yaml
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            Service:
              - lambda.amazonaws.com
          Action:
            - sts:AssumeRole
    Policies:
      - PolicyName: LambdaPolicy
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            # ✅ Allow Lambda to write logs
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource: "*"

            # ✅ Allow Lambda to retrieve secrets from AWS Secrets Manager
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref DocumentDBSecret  # Restrict access to this secret

            # ✅ FIX: Allow Lambda to create, delete, and describe network interfaces (ENIs)
            - Effect: Allow
              Action:
                - ec2:CreateNetworkInterface
                - ec2:DescribeNetworkInterfaces
                - ec2:DeleteNetworkInterface
                - ec2:AssignPrivateIpAddresses
                - ec2:UnassignPrivateIpAddresses
              Resource: "*"

            # ✅ FIX: Allow Lambda to attach network interfaces to itself
            - Effect: Allow
              Action:
                - ec2:DescribeInstances
                - ec2:ModifyNetworkInterfaceAttribute
              Resource: "*"
```

---

## **✅ Step-by-Step Fix**
1️⃣ **Modify** the **IAM Role** in your `template.yaml` (as shown above).  
2️⃣ **Deploy** the updated AWS SAM stack:
   ```sh
   sam build
   sam deploy --guided
   ```
3️⃣ **Verify Lambda Networking Permissions**:
   ```sh
   aws iam get-role-policy --role-name <YourLambdaExecutionRole> --policy-name LambdaPolicy
   ```
   - Ensure **`ec2:CreateNetworkInterface`** is included.

4️⃣ **Test Lambda Execution Again**:
   ```sh
   aws lambda invoke --function-name CreateOrderFunction output.json
   ```

---

## **🎯 Why This Fix Works**
- **Lambda in a VPC** requires network interfaces (**ENI**) to communicate.
- **By default**, AWS Lambda **does not** have permission to create or manage **ENIs**.
- **Adding `ec2:CreateNetworkInterface` and related permissions** ensures the function can run in a **VPC**.

🚀 Now your **CreateOrderFunction** should work correctly. Let me know if you need more help!
---


## Issue

```
AWS::DocDB::DBSubnetGroup                        DocDBSubnetGroup                                 The DB subnet group doesn't meet Availability  
                                                                                                                                                   Zone (AZ) coverage requirement. Current AZ     
                                                                                                                                                   coverage: us-east-1d. Add subnets to cover at  
                                                                                                                                                   least 2 AZs. (Service: AmazonRDS; Status Code: 
                                                                                                                                                   400; Error Code:                               
                                                                                                                                                   DBSubnetGroupDoesNotCoverEnoughAZs; Request    
                                                                                                                                                   ID: 9b372e70-1504-4083-86a1-25c8f1f4d607;      
                                                                                                                                                   Proxy: null)             
```

## Possible Solution

### **🔴 Issue:**  
Your **AWS::DocDB::DBSubnetGroup** has only **one Availability Zone (AZ)** (`us-east-1d`), but **Amazon DocumentDB requires at least two AZs** for high availability.  

---

## **✅ Solution: Add More Subnets Across Different Availability Zones**
You need to modify your **DBSubnetGroup** to include **at least two different Availability Zones**.

---

### **🔹 Update `template.yaml` to Fix DBSubnetGroup**
Modify your **AWS::DocDB::DBSubnetGroup** to include **at least two subnets in different AZs**:

```yaml
DocDBSubnetGroup:
  Type: AWS::DocDB::DBSubnetGroup
  Properties:
    DBSubnetGroupName: "docdb-subnet-group"
    DBSubnetGroupDescription: "Subnet group for Amazon DocumentDB"
    SubnetIds:
      - !Ref PrivateSubnet1  # Subnet in AZ1 (e.g., us-east-1a)
      - !Ref PrivateSubnet2  # Subnet in AZ2 (e.g., us-east-1b)
```

---

### **🔹 Ensure You Have Two Private Subnets in Different AZs**
Modify your **VPC** section to define at least **two subnets in different AZs**:

```yaml
VPC:
  Type: AWS::EC2::VPC
  Properties:
    CidrBlock: "10.0.0.0/16"
    EnableDnsSupport: true
    EnableDnsHostnames: true

PrivateSubnet1:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref VPC
    CidrBlock: "10.0.1.0/24"
    AvailabilityZone: !Select [0, !GetAZs us-east-1]

PrivateSubnet2:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref VPC
    CidrBlock: "10.0.2.0/24"
    AvailabilityZone: !Select [1, !GetAZs us-east-1]
```

---

### **✅ Final Steps**
1️⃣ **Modify your `template.yaml`** (as shown above).  
2️⃣ **Deploy the updated AWS SAM stack**:  
   ```sh
   sam build
   sam deploy --guided
   ```
3️⃣ **Verify Subnets Are in Different AZs**:
   ```sh
   aws ec2 describe-subnets --filters "Name=vpc-id,Values=<YourVPCID>"
   ```
   - Ensure you have **at least two subnets** in different **Availability Zones** (`us-east-1a, us-east-1b`, etc.).

---

## **🎯 Why This Fix Works**
✅ **Amazon DocumentDB requires at least two subnets** in different **Availability Zones** for high availability.  
✅ **Ensuring multiple subnets in different AZs** prevents deployment failures.  
✅ **Follows AWS best practices** for resilience and redundancy.  
---


## Issue

```
MyDocumentDBCluster                              The parameter MasterUserPassword is not a      
                                                                                                                                                   valid password. Only printable ASCII           
                                                                                                                                                   characters besides '/', '@', '"', ' ' may be   
                                                                                                                                                   used. (Service: AmazonRDS; Status Code: 400;   
                                                                                                                                                   Error Code: InvalidParameterValue; Request ID: 
                                                                                                                                                   84fc3bec-6f33-4f14-a9fe-b3e2536b9fa7; Proxy:   
                                                                                                                                                   null)     
```


## Possible Solution

### **🔴 Issue:**  
The **MasterUserPassword** you provided **contains invalid characters**.  
**Amazon DocumentDB** only allows **printable ASCII characters**, **excluding**:
- `/` (forward slash)
- `@` (at symbol)
- `"` (double quotes)
- `' '` (spaces)

---

## **✅ Solution: Use a Valid Password Format**
Ensure the password:
- ✅ Is at least **8 characters long**.
- ✅ Contains **uppercase, lowercase, numbers, and special characters** (except `/`, `@`, `"`, `' '`).
- ✅ **Does not include spaces**.

---

### **🔹 If Using Hardcoded Password (Not Recommended)**
Modify `template.yaml`:
```yaml
MyDocumentDBCluster:
  Type: AWS::DocDB::DBCluster
  Properties:
    MasterUsername: "admin"
    MasterUserPassword: "Secure#Pass123"  # ✅ Valid password without restricted characters
```
⚠️ **Hardcoding credentials is NOT secure**. Instead, use AWS Secrets Manager.

---

### **🔹 If Using AWS Secrets Manager (Recommended)**
1️⃣ **Modify Your Secret in AWS Secrets Manager**  
   Run this command to update the stored password:
   ```sh
   aws secretsmanager update-secret \
       --secret-id DocumentDBSecret \
       --secret-string '{"username": "admin", "password": "New#SecurePass123"}'
   ```
   ✅ Ensure the new password **follows the valid character rules**.

2️⃣ **Update `template.yaml` to Retrieve Password Securely**
```yaml
MyDocumentDBCluster:
  Type: AWS::DocDB::DBCluster
  Properties:
    MasterUsername: !Sub "{{resolve:secretsmanager:DocumentDBSecret:SecretString:username}}"
    MasterUserPassword: !Sub "{{resolve:secretsmanager:DocumentDBSecret:SecretString:password}}"
```

---

### **✅ Final Steps**
1️⃣ **Modify your password to meet AWS DocumentDB's requirements**.  
2️⃣ **Redeploy the stack**:  
   ```sh
   sam build
   sam deploy --guided
   ```
3️⃣ **Verify Password Works**  
   If using Secrets Manager:
   ```sh
   aws secretsmanager get-secret-value --secret-id DocumentDBSecret
   ```

---

## **🎯 Why This Fix Works**
- ✅ Ensures the password **follows AWS DocumentDB character restrictions**.
- ✅ **Prevents security risks** by using **AWS Secrets Manager** instead of hardcoding.
- ✅ **Ensures successful deployment** without password errors.



---


## Issue - Solution: Use AWS CloudFormation’s GetAtt to Dynamically Get the DocumentDB Endpoint

Yes! You can dynamically **generate and retrieve the Amazon DocumentDB connection string** inside your **AWS SAM template** without hardcoding the hostname.  

---

## **✅ Solution: Use AWS CloudFormation’s `GetAtt` to Dynamically Get the DocumentDB Endpoint**  
Instead of manually specifying the **host**, use **`Fn::GetAtt`** to get the DocumentDB cluster's **endpoint** dynamically.

---

### **🔹 Step 1: Modify Your AWS SAM Template (`template.yaml`)**  
Modify the **AWS::DocDB::DBCluster** to ensure the **MasterUsername** and **MasterUserPassword** come from AWS Secrets Manager.

```yaml
Resources:
  # ✅ Create Amazon DocumentDB Cluster
  MyDocumentDBCluster:
    Type: AWS::DocDB::DBCluster
    Properties:
      DBClusterIdentifier: "my-docdb-cluster"
      Engine: "docdb"
      MasterUsername: !Sub "{{resolve:secretsmanager:DocumentDBSecret:SecretString:username}}"
      MasterUserPassword: !Sub "{{resolve:secretsmanager:DocumentDBSecret:SecretString:password}}"
      VpcSecurityGroupIds:
        - !Ref DocumentDBSecurityGroup
      DBSubnetGroupName: !Ref DocDBSubnetGroup
      BackupRetentionPeriod: 7

  # ✅ Security Group for DocumentDB
  DocumentDBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: "Allow access to DocumentDB"
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 27017
          ToPort: 27017
          SourceSecurityGroupId: !Ref LambdaSecurityGroup

  # ✅ Store the DocumentDB Connection String in Secrets Manager
  DocumentDBSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: "DocumentDBSecret"
      SecretString: !Sub |
        {
          "username": "admin",
          "password": "YourStrong#Pass123",
          "host": "${MyDocumentDBCluster.Endpoint}",
          "port": "27017",
          "database": "ordersdb"
        }
```

---

### **🔹 Step 2: Grant Lambda Permission to Read Secrets**
Modify your **LambdaExecutionRole** to allow it to access the **Secrets Manager** secret.

```yaml
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            Service: 
              - lambda.amazonaws.com
          Action: 
            - sts:AssumeRole
    Policies:
      - PolicyName: LambdaPolicy
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref DocumentDBSecret
```

---

### **🔹 Step 3: Modify Lambda Code to Retrieve Connection String Dynamically**
Modify your **Lambda function** (`create_order.py`) to **retrieve the connection string dynamically**.

```python
import os
import json
import boto3
import pymongo

def get_secret():
    """Retrieve DocumentDB credentials from AWS Secrets Manager"""
    secret_name = os.getenv("SECRET_NAME", "DocumentDBSecret")
    region = os.getenv("AWS_REGION", "us-east-1")

    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)

    return json.loads(response["SecretString"])

def lambda_handler(event, context):
    """Lambda function to create an order in DocumentDB"""
    secret = get_secret()

    # ✅ Build DocumentDB connection URI dynamically
    mongo_uri = f"mongodb://{secret['username']}:{secret['password']}@{secret['host']}:{secret['port']}/?tls=true&retryWrites=false"

    # ✅ Connect to DocumentDB
    client = pymongo.MongoClient(mongo_uri)
    db = client[secret["database"]]
    collection = db["orders"]

    # ✅ Insert a sample order
    order = {"item": "Laptop", "quantity": 1}
    collection.insert_one(order)

    return {"status": "Success", "message": "Order created", "order": order}
```

---

## **✅ Why This Solution Works**
- 🎯 **Dynamically Retrieves the DocumentDB Endpoint** using `!GetAtt MyDocumentDBCluster.Endpoint`.
- 🔒 **Stores Connection Details Securely** in **AWS Secrets Manager** instead of hardcoding.
- 🛡️ **Lambda Retrieves Credentials Dynamically** from Secrets Manager.
- 🚀 **Fully Automates the Connection String Retrieval** in AWS SAM.

---

### **🔍 Why Do We Need to Enable Port `27017` in Both Security Groups?**  
Amazon **DocumentDB** (MongoDB-compatible) listens on **port 27017**, and AWS **Security Groups** are **stateful**, meaning:  

- **LambdaSecurityGroup** (for Lambda) **needs an outbound rule** to **send requests** to DocumentDB.  
- **DocumentDBSecurityGroup** (for DocumentDB) **needs an inbound rule** to **accept connections** from Lambda.  

---

## **✅ Breakdown of the Required Rules**
### **🔹 Security Group for Lambda (`LambdaSecurityGroup`)**
- **Outbound Rule**:  
  - ✅ **Allows traffic** **from Lambda** to DocumentDB **on port `27017`**.  
  - 🟢 This is **required** because otherwise, **Lambda cannot connect** to the database.

```yaml
  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: "Security group for Lambda function"
      VpcId: !Ref VPC
      SecurityGroupEgress:  # ✅ Outbound rule
        - IpProtocol: tcp
          FromPort: 27017
          ToPort: 27017
          CidrIp: !Ref VPCCidrBlock   # Allow outbound traffic within the VPC
```

---

### **🔹 Security Group for DocumentDB (`DocumentDBSecurityGroup`)**
- **Inbound Rule**:  
  - ✅ **Allows traffic** **to DocumentDB** from Lambda **on port `27017`**.  
  - 🔴 Without this, **DocumentDB will reject connections** from Lambda.

```yaml
  DocumentDBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: "Allow access to DocumentDB"
      VpcId: !Ref VPC
      SecurityGroupIngress:  # ✅ Inbound rule
        - IpProtocol: tcp
          FromPort: 27017
          ToPort: 27017
          CidrIp: !Ref VPCCidrBlock   # Allow inbound traffic within the VPC
```

---

## **🔍 Why Can't We Use Only One Security Group?**
You might think:
> "Can we just use **one security group** for both Lambda and DocumentDB?"

**Answer:** No, because:
1. **Lambda needs a security group for VPC access.**
2. **DocumentDB needs a security group to restrict access.**
3. If they **shared the same security group**, it would allow **any resource in that group** to access DocumentDB, which might be a security risk.

---

## **🎯 Final Takeaway**
✅ **Port 27017 must be opened** in both **security groups** for **bidirectional communication** between Lambda and DocumentDB.  
🚀 **Now, your Lambda function should be able to connect without timeouts!**