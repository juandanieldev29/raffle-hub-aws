import { Duration } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { join } from 'path';

interface RaffleHubMicroservicesProps {
  readonly raffleTable: ITable;
  readonly ticketTable: ITable;
  readonly paymentTable: ITable;
  readonly voucherTable: ITable;
  readonly stripeKeySecret: ISecret;
  readonly stripeWebookKeySecret: ISecret;
  readonly userPoolId: string;
  readonly userPoolClientId: string;
}

export class RaffleHubMicroservices extends Construct {
  public readonly raffleIndexMicroservice: NodejsFunction;
  public readonly raffleNewMicroservice: NodejsFunction;
  public readonly raffleShowMicroservice: NodejsFunction;
  public readonly raffleOwnedMicroservice: NodejsFunction;
  public readonly raffleAvailableNumbersMicroservice: NodejsFunction;
  public readonly ticketNewMicroservice: NodejsFunction;
  public readonly ticketCompleteMicroservice: NodejsFunction;
  public readonly paymentNewMicroservice: NodejsFunction;
  public readonly processPaymentMicroservice: NodejsFunction;
  public readonly paymentSuccessMicroservice: NodejsFunction;
  public readonly pendingPaymentMicroservice: NodejsFunction;
  public readonly ticketExpireMicroservice: NodejsFunction;
  public readonly voucherNewMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: RaffleHubMicroservicesProps) {
    super(scope, id);
    this.raffleIndexMicroservice = this.createRaffleIndexFunction(props.raffleTable);
    this.raffleNewMicroservice = this.createRaffleNewFunction(props.raffleTable);
    this.raffleShowMicroservice = this.createRaffleShowFunction(props.raffleTable);
    this.raffleOwnedMicroservice = this.createRaffleOwnedFunction(props.raffleTable);
    this.raffleAvailableNumbersMicroservice = this.createRaffleAvailableNumbersFunction(
      props.raffleTable,
      props.ticketTable,
    );
    this.ticketNewMicroservice = this.createNewTicketFunction(props.raffleTable, props.ticketTable);
    this.ticketCompleteMicroservice = this.createTicketCompleteFunction(props.ticketTable);
    this.paymentNewMicroservice = this.createNewPaymentFunction(
      props.paymentTable,
      props.stripeKeySecret,
      props.userPoolId,
      props.userPoolClientId,
    );
    this.processPaymentMicroservice = this.createProcessPaymentFunction(
      props.stripeKeySecret,
      props.stripeWebookKeySecret,
    );
    this.paymentSuccessMicroservice = this.createPaymentSuccessFunction(props.paymentTable);
    this.pendingPaymentMicroservice = this.createPendingPaymentFunction(props.paymentTable);
    this.ticketExpireMicroservice = this.createExpireTicketFunction(props.ticketTable);
    this.voucherNewMicroservice = this.createNewVoucherFunction(
      props.voucherTable,
      props.userPoolId,
      props.userPoolClientId,
    );
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
      timeout: Duration.seconds(3),
      memorySize: 128,
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
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'RaffleShowLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/show.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createRaffleOwnedFunction(raffleTable: ITable): NodejsFunction {
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
    const lambdaFunction = new NodejsFunction(this, 'RaffleOwnedLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/owned.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createRaffleAvailableNumbersFunction(
    raffleTable: ITable,
    ticketTable: ITable,
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        RAFFLE_DYNAMODB_TABLE_NAME: raffleTable.tableName,
        TICKET_DYNAMODB_TABLE_NAME: ticketTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'RaffleAvailableNumbersLambdaFunction', {
      entry: join(__dirname, `/../back/raffle/available-numbers.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);
    ticketTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createNewTicketFunction(raffleTable: ITable, ticketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        RAFFLE_DYNAMODB_TABLE_NAME: raffleTable.tableName,
        TICKET_DYNAMODB_TABLE_NAME: ticketTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'TicketNewLambdaFunction', {
      entry: join(__dirname, `/../back/ticket/new.ts`),
      ...nodeJsFunctionProps,
    });

    raffleTable.grantReadWriteData(lambdaFunction);
    ticketTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createTicketCompleteFunction(ticketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: ticketTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'TicketCompleteLambdaFunction', {
      entry: join(__dirname, `/../back/ticket/complete.ts`),
      ...nodeJsFunctionProps,
    });

    ticketTable.grantReadWriteData(lambdaFunction);

    return lambdaFunction;
  }

  private createProcessPaymentFunction(
    stripeKeySecret: ISecret,
    stripeWebookKeySecret: ISecret,
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'ProcessPaymentLambdaFunction', {
      entry: join(__dirname, `/../back/payment/process.ts`),
      ...nodeJsFunctionProps,
    });
    stripeKeySecret.grantRead(lambdaFunction);
    stripeWebookKeySecret.grantRead(lambdaFunction);

    return lambdaFunction;
  }

  private createPaymentSuccessFunction(paymentTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: paymentTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'PaymentSuccessLambdaFunction', {
      entry: join(__dirname, `/../back/payment/success.ts`),
      ...nodeJsFunctionProps,
    });
    paymentTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private createPendingPaymentFunction(paymentTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: paymentTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'PendingPaymentLambdaFunction', {
      entry: join(__dirname, `/../back/payment/pending.ts`),
      ...nodeJsFunctionProps,
    });
    paymentTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private createNewPaymentFunction(
    paymentTable: ITable,
    stripeKeySecret: ISecret,
    userPoolId: string,
    userPoolClientId: string,
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: paymentTable.tableName,
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'PaymentNewLambdaFunction', {
      entry: join(__dirname, `/../back/payment/new.ts`),
      ...nodeJsFunctionProps,
    });
    paymentTable.grantReadWriteData(lambdaFunction);
    stripeKeySecret.grantRead(lambdaFunction);

    return lambdaFunction;
  }

  private createExpireTicketFunction(ticketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        TICKET_DYNAMODB_TABLE_NAME: ticketTable.tableName,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'TicketExpireLambdaFunction', {
      entry: join(__dirname, `/../back/ticket/expire.ts`),
      ...nodeJsFunctionProps,
    });
    ticketTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }

  private createNewVoucherFunction(
    voucherTable: ITable,
    userPoolId: string,
    userPoolClientId: string,
  ): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        DYNAMODB_TABLE_NAME: voucherTable.tableName,
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'NewVoucherLambdaFunction', {
      entry: join(__dirname, `/../back/voucher/new.ts`),
      ...nodeJsFunctionProps,
    });
    voucherTable.grantReadWriteData(lambdaFunction);
    return lambdaFunction;
  }
}
