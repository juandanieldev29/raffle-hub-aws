import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubQueueProps {
  ticketExpireConsumer: IFunction;
  ticketCompleteConsumer: IFunction;
  processPaymentConsumer: IFunction;
  pendingPaymentConsumer: IFunction;
  expirePaymentConsumer: IFunction;
  pendingVoucherConsumer: IFunction;
}

export class RaffleHubQueue extends Construct {
  public readonly expireTicketQueue: IQueue;
  public readonly ticketCompleteQueue: IQueue;
  public readonly paymentSuccessQueue: IQueue;
  public readonly pendingPaymentQueue: IQueue;
  public readonly expirePaymentQueue: IQueue;
  public readonly pendingVoucherQueue: IQueue;

  constructor(scope: Construct, id: string, props: RaffleHubQueueProps) {
    super(scope, id);
    this.expireTicketQueue = this.createExpireTicketQueue(props.ticketExpireConsumer);
    this.ticketCompleteQueue = this.createTicketCompleteQueue(props.ticketCompleteConsumer);
    this.paymentSuccessQueue = this.createPaymentSucessQueue(props.processPaymentConsumer);
    this.pendingPaymentQueue = this.createPendingPaymentQueue(props.pendingPaymentConsumer);
    this.expirePaymentQueue = this.createExpirePaymentQueue(props.expirePaymentConsumer);
    this.pendingVoucherQueue = this.createPendingVoucherQueue(props.pendingVoucherConsumer);
  }

  private createExpireTicketQueue(ticketExpireConsumer: IFunction) {
    const expireTicketQueue = new Queue(this, 'ExpireTicketQueue', {
      queueName: 'ExpireTicketQueue',
      visibilityTimeout: Duration.seconds(30),
      deliveryDelay: Duration.minutes(10),
    });

    ticketExpireConsumer.addEventSource(new SqsEventSource(expireTicketQueue));
    return expireTicketQueue;
  }

  private createTicketCompleteQueue(ticketCompleteConsumer: IFunction) {
    const ticketCompleteQueue = new Queue(this, 'TicketCompleteQueue', {
      queueName: 'TicketCompleteQueue',
      visibilityTimeout: Duration.seconds(30),
    });

    ticketCompleteConsumer.addEventSource(new SqsEventSource(ticketCompleteQueue));
    return ticketCompleteQueue;
  }

  private createPaymentSucessQueue(paymentSuccessConsumer: IFunction) {
    const paymentSuccessQueue = new Queue(this, 'PaymentSuccessQueue', {
      queueName: 'PaymentSuccessQueue',
      visibilityTimeout: Duration.seconds(30),
    });

    paymentSuccessConsumer.addEventSource(new SqsEventSource(paymentSuccessQueue));
    return paymentSuccessQueue;
  }

  private createPendingPaymentQueue(pendingPaymentConsumer: IFunction) {
    const pendingPaymentQueue = new Queue(this, 'PendingPaymentQueue', {
      queueName: 'PendingPaymentQueue',
      visibilityTimeout: Duration.seconds(30),
    });

    pendingPaymentConsumer.addEventSource(new SqsEventSource(pendingPaymentQueue));
    return pendingPaymentQueue;
  }

  private createExpirePaymentQueue(paymentExpireConsumer: IFunction) {
    const expirePaymentQueue = new Queue(this, 'ExpirePaymentQueue', {
      queueName: 'ExpirePaymentQueue',
      visibilityTimeout: Duration.seconds(30),
      deliveryDelay: Duration.minutes(10),
    });

    paymentExpireConsumer.addEventSource(new SqsEventSource(expirePaymentQueue));
    return expirePaymentQueue;
  }

  private createPendingVoucherQueue(pendingVoucherConsumer: IFunction) {
    const pendingVoucherQueue = new Queue(this, 'PendingVoucherQueue', {
      queueName: 'PendingVoucherQueue',
      visibilityTimeout: Duration.seconds(30),
    });

    pendingVoucherConsumer.addEventSource(new SqsEventSource(pendingVoucherQueue));
    return pendingVoucherQueue;
  }
}
