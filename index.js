#!/usr/bin/env node

const { filterLambdas, updateLambdas, loadLambdas, loadEnvironments} = require('./lib/lambdaUpdater.js');
const { parse_args, promptUser } = require('./lib/argumentsParser.js'); 

options = parse_args();

loadLambdas(options)
  .then(loadEnvironments)
  .then(filterLambdas)
  .then(promptUser)
  .then(updateLambdas)
  .catch((err) => console.log(err)); 












