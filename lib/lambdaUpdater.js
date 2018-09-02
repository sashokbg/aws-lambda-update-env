process.env.AWS_SDK_LOAD_CONFIG=1;
var colors = require('colors');
const AWS = require('aws-sdk');
const LAMBDA = new AWS.Lambda({apiVersion: '2015-03-31'});
const CLOUDFORMATION = new AWS.CloudFormation();

var loadEnvironment = function(lambdaFunction){
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

var loadLambdas = function(options){
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

var updateLambdas = function(lambdas){
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

var loadEnvironments = function(functions){
  return Promise.all(functions.map(loadEnvironment));
}

var filterLambdas = function(lambdas, key=options.key){
  return Promise.resolve(lambdas.filter(lambda => {
    if(lambda.functionEnv[key]){
      console.log('UPDATING'.green+`: Function [${lambda.functionName}]`);
      return true;
    } 
    console.log('SKIPPING'.yellow+`: Function [${lambda.functionName}] does not contain key [${options.key}].`);
    return false;
  }));
}

module.exports = {
  loadEnvironments: loadEnvironments,
  filterLambdas: filterLambdas,
  updateLambdas: updateLambdas,
  loadLambdas: loadLambdas,
  loadEnvironment: loadEnvironment
}
