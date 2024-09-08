import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Billing, ITable, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class RaffleHubDatabase extends Construct {
  public readonly raffleTable: ITable;
  public readonly ticketTable: ITable;
  public readonly paymentTable: ITable;
  public readonly voucherTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.raffleTable = this.createRaffleTable();
    this.ticketTable = this.createTicketTable();
    this.paymentTable = this.createPaymentTable();
    this.voucherTable = this.createVoucherTable();
  }

  private createRaffleTable(): ITable {
    const raffleTable = new TableV2(this, 'RaffleDatabaseTable', {
      partitionKey: {
        name: 'ownerId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'raffle',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand(),
    });
    return raffleTable;
  }

  private createTicketTable(): ITable {
    const ticketTable = new TableV2(this, 'TicketDatabaseTable', {
      partitionKey: {
        name: 'raffleId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'ticket',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand(),
    });
    return ticketTable;
  }

  private createPaymentTable(): ITable {
    const paymentTable = new TableV2(this, 'PaymentDatabaseTable', {
      partitionKey: {
        name: 'raffleId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'payment',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand(),
    });
    return paymentTable;
  }

  private createVoucherTable(): ITable {
    const voucherTable = new TableV2(this, 'VoucherDatabaseTable', {
      partitionKey: {
        name: 'raffleId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'voucher',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand(),
    });
    return voucherTable;
  }
}
