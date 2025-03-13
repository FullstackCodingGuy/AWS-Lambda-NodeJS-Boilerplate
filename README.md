# AWS-Lambda-NodeJS-Boilerplate
Boilerplate code for AWS Lambda Function - using NodeJS runtime.

Commands you can use next
=========================
- Create pipeline: ```cd order-manager && sam pipeline init --bootstrap```
- Validate SAM template: ```cd order-manager && sam validate```
- Test Function in the Cloud: ```cd order-manager && sam sync --stack-name {stack-name} --watch```