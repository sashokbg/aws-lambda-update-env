process.env.AWS_SDK_LOAD_CONFIG=1;
var colors = require('colors');

const { parse_args } = require('./lib/argumentsParser.js'); 
const AWS = require('aws-sdk');

var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var cloudformation = new AWS.CloudFormation();

function updatLambda(functionName, options){
}

function filterFunction(functionName, key){
  load_lambda_env(functionName)
    .then((data) => {
      if(data.functionEnv[options.key]){
      } else {
      } 
    })
    .catch(err => {
      console.error(`Problem loading function configuration for [${err.functionName}]`,err);
    });
}

function loadEnvironment(lambdaFunction){
  console.log(`Loading function [${lambdaFunction.functionName}]`);
  return new Promise((resolve, reject) =>{
    lambda.getFunctionConfiguration({FunctionName: lambdaFunction.functionName}, (err, data) =>{
      if(err){
        err.functionName = lambdaFunction.functionName;
        reject(err);
      } else {
        lambdaFunction.functionEnv = data.Environment.Variables;
        resolve(lambdaFunction);
        //let currentEnv = data.Environment;
        //currentEnv.Variables[key] = value;
        //lambda.updateFunctionConfiguration({FunctionName: func, Environment: currentEnv}, (err, data) =>{
        //  if(err){
        //    console.error(err);
        //  } else {
        //    console.log(data);
        //  }
        //});
      }
    });
  });
}

function loadLambdas(options){
  console.log(`Updating Key [${options.key}] with new value [${options.value}] on Stack [${options.stack}]`);

  return new Promise(function(resolve, reject){
    cloudformation.listStackResources({StackName: options.stack}, function(err, data) {
      if (err){
        console.log(err, err.stack);
        reject(err);
      } else {
        let functions = data.StackResourceSummaries.filter(resource => resource.ResourceType==='AWS::Lambda::Function').map(funct => {return {functionName: funct.PhysicalResourceId}});
        console.dir(functions);
        resolve(functions);
      }
    });
  });
}

function loadEnvironments(functions){
  return Promise.all(functions.map(loadEnvironment));
}

function filterFunctions(lambdas, key){
  return Promise.resolve(lambdas.filter(lambda => {
    if(lambda.functionEnv[key]){
      console.log('UPDATING'.green+`: Function [${lambda.functionName}]`);
      return true;
    } 
    console.log('SKIPPING'.yellow+`: Function [${lambda.functionName}] does not contain key [${options.key}].`);
    return false;
  }));
}

let options = parse_args();
loadLambdas(options)
  .then((functions) => loadEnvironments(functions))
  .then((loadedFunctions) => filterFunctions(loadedFunctions, options.key))
  .then((data) => console.dir(data));
