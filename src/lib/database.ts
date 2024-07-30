import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class RaffleHubDatabase extends Construct {
  public readonly raffleTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.raffleTable = this.createRaffleTable();
  }

  private createRaffleTable(): ITable {
    const raffleTable = new Table(this, 'RaffleDatabaseTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'raffle',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    return raffleTable;
  }
}
