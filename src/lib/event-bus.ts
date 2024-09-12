import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubEventBusProps {
  expireTicketPublisher: IFunction;
  expireTicketQueue: IQueue;
  ticketCompleteQueue: IQueue;
  paymentSuccessPublisher: IFunction;
  paymentSuccessQueue: IQueue;
  pendingPaymentPublisher: IFunction;
  pendingPaymentQueue: IQueue;
  expirePaymentPublisher: IFunction;
  expirePaymentQueue: IQueue;
  pendingVoucherPublisher: IFunction;
  pendingVoucherQueue: IQueue;
}

export class RaffleHubEventBus extends Construct {
  public readonly eventBus: EventBus;

  constructor(scope: Construct, id: string, props: RaffleHubEventBusProps) {
    super(scope, id);
    this.eventBus = this.createEventBus();
    this.createExpireTicketRule(
      this.eventBus,
      props.expireTicketPublisher,
      props.expireTicketQueue,
    );
    this.createPaymentSuccessRule(
      this.eventBus,
      props.paymentSuccessPublisher,
      props.paymentSuccessQueue,
      props.ticketCompleteQueue,
    );
    this.createPendingPaymentRule(
      this.eventBus,
      props.pendingPaymentPublisher,
      props.pendingPaymentQueue,
    );
    this.createExpirePaymentRule(
      this.eventBus,
      props.expirePaymentPublisher,
      props.expirePaymentQueue,
    );
    this.createPendingVoucherRule(
      this.eventBus,
      props.pendingVoucherPublisher,
      props.pendingVoucherQueue,
    );
  }

  private createEventBus() {
    const bus = new EventBus(this, 'RaffleHubEventBus', {
      eventBusName: 'RaffleHubEventBus',
    });
    return bus;
  }

  private createExpireTicketRule(
    eventBus: EventBus,
    expireTicketPublisher: IFunction,
    expireTicketQueue: IQueue,
  ) {
    const expireTicketRule = new Rule(this, 'ExpireTicket', {
      eventBus: eventBus,
      enabled: true,
      description:
        'When pending payment tickets do not successfully process payment before the expiry date',
      eventPattern: {
        source: ['com.rafflehub.ticket.expireTicket'],
        detailType: ['ExpireTicket'],
      },
      ruleName: 'ExpireTicketRule',
    });
    expireTicketRule.addTarget(new SqsQueue(expireTicketQueue));
    eventBus.grantPutEventsTo(expireTicketPublisher);
  }

  private createPaymentSuccessRule(
    eventBus: EventBus,
    paymentSuccessPublisher: IFunction,
    paymentSuccessQueue: IQueue,
    ticketCompleteQueue: IQueue,
  ) {
    const paymentSuccessfulRule = new Rule(this, 'PaymentSuccessful', {
      eventBus: eventBus,
      enabled: true,
      description: 'When a payment is successfully processed before the expiry date',
      eventPattern: {
        source: ['com.rafflehub.payment.success'],
        detailType: ['PaymentSuccess'],
      },
      ruleName: 'PaymentSuccessRule',
    });
    paymentSuccessfulRule.addTarget(new SqsQueue(paymentSuccessQueue));
    paymentSuccessfulRule.addTarget(new SqsQueue(ticketCompleteQueue));
    eventBus.grantPutEventsTo(paymentSuccessPublisher);
  }

  private createPendingPaymentRule(
    eventBus: EventBus,
    pendingPaymentPublisher: IFunction,
    pendingPaymentQueue: IQueue,
  ) {
    const pendingPaymentRule = new Rule(this, 'PendingPayment', {
      eventBus: eventBus,
      enabled: true,
      description: 'When tickets get assigned a payment id',
      eventPattern: {
        source: ['com.rafflehub.payment.pending'],
        detailType: ['PendingPayment'],
      },
      ruleName: 'PendingPaymentRule',
    });
    pendingPaymentRule.addTarget(new SqsQueue(pendingPaymentQueue));
    eventBus.grantPutEventsTo(pendingPaymentPublisher);
  }

  private createExpirePaymentRule(
    eventBus: EventBus,
    expirePaymentPublisher: IFunction,
    expirePaymentQueue: IQueue,
  ) {
    const expirePaymentRule = new Rule(this, 'ExpirePayment', {
      eventBus: eventBus,
      enabled: true,
      description:
        'When a pending payment do not successfully get processed before the expiry date',
      eventPattern: {
        source: ['com.rafflehub.payment.expire'],
        detailType: ['ExpirePayment'],
      },
      ruleName: 'ExpirePaymentRule',
    });
    expirePaymentRule.addTarget(new SqsQueue(expirePaymentQueue));
    eventBus.grantPutEventsTo(expirePaymentPublisher);
  }

  private createPendingVoucherRule(
    eventBus: EventBus,
    pendingVoucherPublisher: IFunction,
    pendingVoucherQueue: IQueue,
  ) {
    const pendingVoucherRule = new Rule(this, 'PendingVoucher', {
      eventBus: eventBus,
      enabled: true,
      description: 'When tickets get assigned a voucher id',
      eventPattern: {
        source: ['com.rafflehub.voucher.pending'],
        detailType: ['PendingVoucher'],
      },
      ruleName: 'PendingVoucherRule',
    });
    pendingVoucherRule.addTarget(new SqsQueue(pendingVoucherQueue));
    eventBus.grantPutEventsTo(pendingVoucherPublisher);
  }
}
