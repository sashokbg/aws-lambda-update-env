const argv = require('minimist')(process.argv.slice(1));
const Confirm = require('prompt-confirm');
var colors = require('colors');

var stack = '';

exports.print_usage = () => {
  console.info('Usage: update-lambda-env {variable name} {new variable value} --stackName myStack');
}

exports.parse_args = () => {
  if((!argv.s && !argv['stack-name']) || (typeof argv.s != 'string' && typeof argv['stack-name'] != 'string')){
    console.error('Please specify the stack name using -s or --stack-name');
    process.exit(1);
  } else {
    stack = argv.s || argv['stack-name'];
  }

  if(argv._.length < 3){
    console.error('ERROR'.red+': Too few args.');
    this.print_usage();
    process.exit(1);
  }

  return {
    key: argv._[1],
    value: argv._[2],
    stack: stack
  }
}

exports.promptUser = function(lambdas){
  let prompt = new Confirm('Is this OK ?');

  return new Promise((resolve, reject) => {
    prompt.run()
      .then(function(answer){
        if(answer){
          resolve(lambdas);
        }
        else{
          reject('Process aborted by user');
        }
      })
  });
}
