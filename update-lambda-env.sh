#!/bin/bash

KEY_BASE=".Environment.Variables"
KEY="$KEY_BASE.$1"
NEW_VALUE=$2
STACK_NAME=$3

#Colors
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Setting field $KEY to value $NEW_VALUE in stack $STACK_NAME"

update_lambdas(){
  for function in $FUNCTIONS;
  do
    echo "$function";
  
    #Check if value exists
    VALUE=`aws lambda get-function-configuration --function-name ${function} | jq ${KEY}`;
    if [ -z "$VALUE" ] || [ "$VALUE" = "null" ]; then 
      printf "SKIPPING:\t$function \t\t- Key Not Found in function!\n"
    else
      printf "${RED}UPDATING:${NC}\t$function \t\t- Old value $VALUE:\n";
      #set -x
      new_env=`aws lambda get-function-configuration --function-name ${function} | jq ''$KEY=\"$NEW_VALUE\"'' | jq -j --tab '.Environment'`;
      aws lambda update-function-configuration --function-name $function --environment "$new_env"
      #set +x
    fi

  done
}

prompt_user(){
  set -x
  FUNCTIONS=`aws cloudformation list-stack-resources --stack-name $STACK_NAME | grep -A1 -B3 AWS::Lambda::Function | grep -oP '(?<="PhysicalResourceId":\s")[a-zA-Z0-9_-]*'`
  set +x
  printf "Will update following functions: \n$FUNCTIONS\nUpdate ? Y/N" 
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    echo "Updating functions"
    update_lambdas
  else
    exit
  fi
}

prompt_user
