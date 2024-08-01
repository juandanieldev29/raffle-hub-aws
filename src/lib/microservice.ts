import { Duration } from 'aws-cdk-lib';
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
  public readonly raffleShowMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: RaffleHubMicroservicesProps) {
    super(scope, id);
    this.raffleIndexMicroservice = this.createRaffleIndexFunction(props.raffleTable);
    this.raffleNewMicroservice = this.createRaffleNewFunction(props.raffleTable);
    this.raffleShowMicroservice = this.createRaffleShowFunction(props.raffleTable);
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
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'RaffleIndexLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/index.ts`),
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
    const lambdaFunction = new NodejsFunction(this, 'RaffleNewLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/new.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createRaffleShowFunction(raffleTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: raffleTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
    };
    const lambdaFunction = new NodejsFunction(this, 'RaffleShowLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/show.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }
}
