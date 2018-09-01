process.env.AWS_SDK_LOAD_CONFIG=1;
var colors = require('colors');
const stdin = process.openStdin();
const { parse_args } = require('./lib/argumentsParser.js'); 
const AWS = require('aws-sdk');

const LAMBDA = new AWS.Lambda({apiVersion: '2015-03-31'});
const CLOUDFORMATION = new AWS.CloudFormation();

function loadEnvironment(lambdaFunction){
  return new Promise((resolve, reject) =>{
    LAMBDA.getFunctionConfiguration({FunctionName: lambdaFunction.functionName}, (err, data) =>{
      if(err){
        err.functionName = lambdaFunction.functionName;
        reject(err);
      } else {
        lambdaFunction.functionEnv = data.Environment.Variables;
        resolve(lambdaFunction);
      }
    });
  });
}

function loadLambdas(options){
  console.log(`Updating Key [${options.key}] with new value [${options.value}] on Stack [${options.stack}]`);

  return new Promise(function(resolve, reject){
    CLOUDFORMATION.listStackResources({StackName: options.stack}, function(err, data) {
      if (err){
        console.log(err, err.stack);
        reject(err);
      } else {
        let functions = data.StackResourceSummaries.filter(resource => resource.ResourceType==='AWS::Lambda::Function').map(funct => {return {functionName: funct.PhysicalResourceId}});
        resolve(functions);
      }
    });
  });
}

function loadEnvironments(functions){
  return Promise.all(functions.map(loadEnvironment));
}

function filterLambdas(lambdas, key=options.key){
  return Promise.resolve(lambdas.filter(lambda => {
    if(lambda.functionEnv[key]){
      console.log('UPDATING'.green+`: Function [${lambda.functionName}]`);
      return true;
    } 
    console.log('SKIPPING'.yellow+`: Function [${lambda.functionName}] does not contain key [${options.key}].`);
    return false;
  }));
}

function updateLambdas(lambdas){
  lambdas.forEach(lambda => {
    lambda.functionEnv[options.key] = options.value;

    let lambdaEnv = {
      Variables: {
        ...lambda.functionEnv
      }
    }

    LAMBDA.updateFunctionConfiguration({FunctionName: lambda.functionName, Environment: lambdaEnv}, (err, data) =>{
      if(err){
        console.error(err);
      } else {
        console.log('SUCCESS'.green+`: Function [${lambda.functionName}] updated`);
      }
    });
  });
}

function promptUser(lambdas){
  console.log('Is this OK ? (Y/y)');

   return new Promise((resolve, reject) => {
    stdin.addListener("data", function(input) {
      if(input.toString().trim().toUpperCase() === 'Y'){
        resolve(lambdas);
      }
      else{
        reject('Process aborted by user');
      }
    }); 
  });
}


let options = parse_args();
loadLambdas(options)
  .then(loadEnvironments)
  .then(filterLambdas)
  .then(promptUser)
  .then(updateLambdas)
  .catch((err) => console.log(err)); 












