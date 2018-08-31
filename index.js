const argv = require('minimist')(process.argv.slice(1));

process.env.AWS_SDK_LOAD_CONFIG=1;

const AWS = require('aws-sdk');
const { spawn } = require('child_process');

let key;
let value;
let stack;

var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var cloudformation = new AWS.CloudFormation();

let functions = [];

function print_usage(){
  console.info('Usage: update-lambda-env {variable name} {new variable value} --stackName myStack');
}

function parse_args(){
  if((!argv.s && !argv.stackName) || (typeof argv.s != 'string' && typeof argv.stackName != 'string')){
    console.error('Please specify the stack name using -s or --stackName');
  } else {
    stack = argv.s || argv.stackName;
  }

  if(argv._.length < 3){
    console.error('ERROR: Too few args.');
    print_usage();
    return;
  }

  key = argv._[1];
  value = argv._[2];
  stack = stack;

  console.log(`Updating Key [${key}] with new value [${value}] on Stack [${stack}]`);
}

function update_lambdas(){
  lambda.getFunctionConfiguration({FunctionName: 'createJobs-test'}, (err, data) =>{
    if(err){
      console.err(err);
      return;
    } else {
      console.log(data.Environment.Variables);
      let currentEnv = data.Environment;
      currentEnv.Variables[key] = value;
      lambda.updateFunctionConfiguration({FunctionName: 'createJobs-test', Environment: currentEnv}, (err, data) =>{
        if(err){
          console.error(err);
        } else {
          console.log(data);
        }
      });
    }
  });
}

function find_lambdas(){
  cloudformation.listStackResources({StackName: stack}, function(err, data) {
    if (err){
      console.log(err, err.stack);
      return;
    } else {
      var functions = data.StackResourceSummaries.filter(resource => resource.ResourceType==='AWS::Lambda::Function').map(funct => funct.PhysicalResourceId);
      console.log('Found the following functions to update:\n');
      console.dir(functions);
      update_lambdas();
    }
  });
}

parse_args();
find_lambdas();
