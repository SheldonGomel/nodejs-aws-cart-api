import cdk from 'aws-cdk-lib';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'CartServiceStack', {
  env: { region: 'eu-west-1' },
});
