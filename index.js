process.env.AWS_SDK_LOAD_CONFIG=1;
var colors = require('colors');

const { parse_args } = require('./lib/argumentsParser.js'); 
const AWS = require('aws-sdk');

var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var cloudformation = new AWS.CloudFormation();

function updatLambda(functionName, options){
}

function hasKey(functionName, key){
  load_lambda_env(functionName)
    .then((data) => {
      if(data.functionEnv[options.key]){
        console.log('UPDATING'.green+`: Function [${data.functionName}]`);
      } else {
        console.log('SKIPPING'.yellow+`: Function [${data.functionName}] does not contain key [${options.key}].`);
      } 
    })
    .catch(err => {
      console.error(`Problem loading function configuration for [${err.functionName}]`,err);
    });
}

function loadEnvironment(functionName){
  console.log(`Loading function [${functionName}]`);
  return new Promise((resolve, reject) =>{
    lambda.getFunctionConfiguration({FunctionName: functionName}, (err, data) =>{
      if(err){
        err.functionName = functionName;
        reject(err);
      } else {
        resolve({
          functionName: functionName,
          functionEnv: data.Environment.Variables});
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
        let functions = data.StackResourceSummaries.filter(resource => resource.ResourceType==='AWS::Lambda::Function').map(funct => {functionName: funct.PhysicalResourceId});
        functions.forEach(func => loadEnvironment())
        conosle.dir(functions);
        resolve(functions);
      }
    });
  });
}

let options = parse_args();
loadLambdas
  .then((functions) => {
    functions
      .fitler(lambdaFunction => hasKey(lambdaFunction, options.key))
      .forEach(lambdaFunction => updateLambda(lambdaFunction, options))
  }).catch(err => console.error(err));
