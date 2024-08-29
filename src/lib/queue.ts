import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubQueueProps {
  ticketExpireConsumer: IFunction;
  processPaymentConsumer: IFunction;
  pendingPaymentConsumer: IFunction;
}

export class RaffleHubQueue extends Construct {
  public readonly expireTicketQueue: IQueue;
  public readonly paymentSuccessQueue: IQueue;
  public readonly pendingPaymentQueue: IQueue;

  constructor(scope: Construct, id: string, props: RaffleHubQueueProps) {
    super(scope, id);
    this.expireTicketQueue = this.createExpireTicketQueue(props.ticketExpireConsumer);
    this.paymentSuccessQueue = this.createPaymentSucessQueue(props.processPaymentConsumer);
    this.pendingPaymentQueue = this.createPendingPaymentQueue(props.pendingPaymentConsumer);
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
}
