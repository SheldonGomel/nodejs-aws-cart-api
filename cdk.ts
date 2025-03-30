import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'CartServiceStack', {
  env: { region: 'eu-west-1' },
});

// Create Lambda function for NestJS app
const nestLambda = new nodejs.NodejsFunction(stack, 'NestJSLambda', {
  functionName: 'CartServiceLambda',
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'handler',
  entry: './src/lambda.ts',
  bundling: {
    externalModules: [
      '@aws-sdk/*',
      '@nestjs/microservices',
      '@nestjs/websockets',
      'cache-manager',
      'class-transformer',
      'class-validator',
    ],
    minify: true,
    sourceMap: false,
  },
  environment: {
    NODE_ENV: 'production',
  },
  memorySize: 512,
  timeout: cdk.Duration.seconds(30),
});

// Add a Function URL to the Lambda function
const functionUrl = new lambda.FunctionUrl(stack, 'NestLambdaFunctionUrl', {
  function: nestLambda,
  authType: lambda.FunctionUrlAuthType.NONE,
});

// Output the Function URL
new cdk.CfnOutput(stack, 'FunctionUrl', {
  value: functionUrl.url,
  description: 'The URL of the Lambda Function',
});
