# AWS Lambda - Update Environment

This module performs bulk operations on environment variables of AWS Lambda functions.

## The problem

AWS CLI allows you to update your lambda function's configuration with the following command:

```
aws lambda update-function-configuration --function-name <function> --environment <env-as-json>
```

Unfortunately this command replaces the whole environemnt with the newly provided, making it impossible to update 
just one env variable.

## Requirements

You need to configure your AWS credentials in *~/.aws/credentials* and your region in *~/.aws/configuration*

More on that here : https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

## Usage

```
update-lambda-env <ENV_VAR_KEY> <ENV_VAR_VALUE> --stack-name <STACK_NAME>
```

Where:
 
 * **ENV_VAR_KEY** is the name of the environment variable you wish to update on all lambdas inside your stack that have it.
 * **ENV_VAR_VALUE** is the new value for the environment variable you wish to change
 * **STACK_NAME** is the CloudFormation stack name on which you wish to operate

Example:

```
update-lambda-env KEY "My New Test Value" --stack-name myApplicationStack
```

![Alt text](images/example2.png?raw=true "Example 2")

Result:

![Alt text](images/example1.png?raw=true "Example 1")

## How it works

The **update-lambda-env** module will do the following:

1) Read your stack and list all the resources which are of type *AWS::Lambda::Function*
2) Load the environment variables of your lambda functions
3) Check if the env variables contain the one you wish to update and filter those which do not
4) Prompt you if it's ok to execute the change
5) Run *aws update-function-configuration --environment <modified-env-as-json>* 

