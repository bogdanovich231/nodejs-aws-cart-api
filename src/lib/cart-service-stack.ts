import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole',
      ),
    );

    const cartLambda = new lambda.Function(this, 'CartLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      handler: 'dist/lambda.handler',
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DB_HOST: 'rsdatabase.cfmkgeaa86l4.eu-west-1.rds.amazonaws.com',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: '0hlpMp0kalQmlFHIqBIZ',
        DB_NAME: 'rsdatabase',
      },
    });

    new apigateway.LambdaRestApi(this, 'CartApi', {
      handler: cartLambda,
      proxy: true,
    });
  }
}
