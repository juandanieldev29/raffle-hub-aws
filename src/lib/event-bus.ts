import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubEventBusProps {
  expireTicketPublisher: IFunction;
  expireTicketQueue: IQueue;
  paymentSuccessPublisher: IFunction;
  paymentSuccessQueue: IQueue;
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
    eventBus.grantPutEventsTo(paymentSuccessPublisher);
  }
}
