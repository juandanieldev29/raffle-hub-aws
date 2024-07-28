import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { join } from 'path';

interface RaffleHubMicroservicesProps {
  raffleTable: ITable;
  googleOAuthConfigSecret: ISecret;
}

export class RaffleHubMicroservices extends Construct {
  public readonly raffleIndexMicroservice: NodejsFunction;
  public readonly raffleNewMicroservice: NodejsFunction;
  public readonly signInMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: RaffleHubMicroservicesProps) {
    super(scope, id);
    this.raffleIndexMicroservice = this.createRaffleIndexFunction(props.raffleTable);
    this.raffleNewMicroservice = this.createRaffleNewFunction(props.raffleTable);
    this.signInMicroservice = this.createSignInFunction(props.googleOAuthConfigSecret);
  }

  private createRaffleIndexFunction(raffleTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: raffleTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
    };
    const lambdaFunction = new NodejsFunction(this, 'raffleIndexLambdaFunction', {
      entry: join(__dirname, `/../src/raffle/index.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createRaffleNewFunction(raffleTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: raffleTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
    };
    const lambdaFunction = new NodejsFunction(this, 'raffleNewLambdaFunction', {
      entry: join(__dirname, `/../src/raffle/new.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createSignInFunction(googleOAuthConfigSecret: ISecret): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_20_X,
    };
    const lambdaFunction = new NodejsFunction(this, 'signInLambdaFunction', {
      entry: join(__dirname, `/../src/auth/signin.ts`),
      ...nodeJsFunctionProps,
    });
    googleOAuthConfigSecret.grantRead(lambdaFunction);
    return lambdaFunction;
  }
}
