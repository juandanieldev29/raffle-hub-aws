import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubEventBusProps {
  publisherFuntion: IFunction;
  targetQueue: IQueue;
}

export class RaffleHubEventBus extends Construct {
  public readonly eventBus: EventBus;

  constructor(scope: Construct, id: string, props: RaffleHubEventBusProps) {
    super(scope, id);
    this.eventBus = this.createEventBus();
    this.createExpireTicketRule(this.eventBus, props.publisherFuntion, props.targetQueue);
  }

  private createEventBus() {
    const bus = new EventBus(this, 'RaffleHubEventBus', {
      eventBusName: 'RaffleHubEventBus',
    });
    return bus;
  }

  private createExpireTicketRule(
    eventBus: EventBus,
    publisherFuntion: IFunction,
    targetQueue: IQueue,
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
    expireTicketRule.addTarget(new SqsQueue(targetQueue));
    eventBus.grantPutEventsTo(publisherFuntion);
  }
}
