import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { config } from 'dotenv';

config();

const app = new cdk.App();
const stack = new cdk.Stack(app, 'CartServiceStack', {
  env: { region: 'eu-west-1' },
});

const vpc = new ec2.Vpc(stack, 'CartServiceVPC', {
  maxAzs: 2,
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'Private',
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    },
    {
      cidrMask: 24,
      name: 'Public',
      subnetType: ec2.SubnetType.PUBLIC,
    },
  ],
});
// Create Lambda function for NestJS app
const nestLambda = new nodejs.NodejsFunction(stack, 'NestJSLambda', {
  functionName: 'CartServiceLambda',
  architecture: lambda.Architecture.ARM_64,
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'handler',
  entry: './dist/main.js',
  bundling: {
    externalModules: [
      '@aws-sdk/*',
      '@nestjs/microservices',
      '@nestjs/websockets',
    ],
    minify: false,
    sourceMap: false,
  },
  environment: {
    NODE_ENV: 'production',
    // POSTGRES_HOST: process.env.POSTGRES_HOST, // added below
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
  },
  memorySize: 512,
  timeout: cdk.Duration.seconds(10),
});

// Add a Function URL to the Lambda function
const functionUrl = new lambda.FunctionUrl(stack, 'NestLambdaFunctionUrl', {
  function: nestLambda,
  authType: lambda.FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [lambda.HttpMethod.ALL],
    allowedHeaders: ['*'],
  },
});

const dbSecurityGroup = new ec2.SecurityGroup(stack, 'DatabaseSecurityGroup', {
  vpc,
  description: 'Allow database access',
  allowAllOutbound: true,
});

dbSecurityGroup.addIngressRule(
  ec2.Peer.anyIpv4(), // This allows 0.0.0.0/0
  ec2.Port.tcp(5432),
  'Allow PostgreSQL access from anywhere',
);

const database = new rds.DatabaseInstance(stack, 'CartServiceDatabase', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_15,
  }),
  vpc,
  publiclyAccessible: true,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
  },
  instanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T3,
    ec2.InstanceSize.MICRO,
  ), // Free tier eligible
  databaseName: process.env.POSTGRES_DB,
  allocatedStorage: 20, // Maximum free tier storage
  maxAllocatedStorage: 20, // Removed autoscaling to stay in free tier
  multiAz: false, // Single AZ for free tier
  credentials: rds.Credentials.fromPassword(
    process.env.POSTGRES_USER,
    cdk.SecretValue.unsafePlainText(
      process.env.POSTGRES_PASSWORD || 'test_password',
    ),
  ),
  securityGroups: [dbSecurityGroup],
});

// Add database connection details to Lambda environment variables
nestLambda.addEnvironment('POSTGRES_HOST', database.instanceEndpoint.hostname);

// Output the Function URL
new cdk.CfnOutput(stack, 'FunctionUrl', {
  value: functionUrl.url,
  description: 'The URL of the Lambda Function',
});

// Output DB host address
new cdk.CfnOutput(stack, 'DatabaseEndpoint', {
  value: database.instanceEndpoint.hostname,
  description: 'Database endpoint',
});
