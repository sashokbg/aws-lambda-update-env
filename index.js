process.env.AWS_SDK_LOAD_CONFIG=1;
var colors = require('colors');

const { parse_args } = require('./lib/argumentsParser.js'); 
const AWS = require('aws-sdk');

var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var cloudformation = new AWS.CloudFormation();


function update_lambdas(functions, options){
  console.log('Found the following functions to update:\n');
  console.dir(functions);

  for(functionName of functions){
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

}

function load_lambda_env(functionName){
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

function find_lambdas(){
  console.log(`Updating Key [${this.key}] with new value [${this.value}] on Stack [${this.stack}]`);
  let parent = this;

  return new Promise(function(resolve, reject){
    cloudformation.listStackResources({StackName: parent.stack}, function(err, data) {
      if (err){
        console.log(err, err.stack);
        reject(err);
      } else {
        let functions = data.StackResourceSummaries.filter(resource => resource.ResourceType==='AWS::Lambda::Function').map(funct => funct.PhysicalResourceId);
        resolve(functions);
      }
    });
  });
}

let options = parse_args();
find_lambdas.call(options)
  .then((functions)=>update_lambdas(functions, options))
  .catch(err=> console.error(err));
