const argv = require('minimist')(process.argv.slice(1));

var stack = '';

exports.print_usage = () => {
  console.info('Usage: update-lambda-env {variable name} {new variable value} --stackName myStack');
}

exports.parse_args = () => {
  if((!argv.s && !argv.stackName) || (typeof argv.s != 'string' && typeof argv.stackName != 'string')){
    console.error('Please specify the stack name using -s or --stackName');
    process.exit(1);
  } else {
    stack = argv.s || argv.stackName;
  }

  if(argv._.length < 3){
    console.error('ERROR: Too few args.');
    this.print_usage();
    process.exit(1);
  }

  return {
    key: argv._[1],
    value: argv._[2],
    stack: stack
  }
}
