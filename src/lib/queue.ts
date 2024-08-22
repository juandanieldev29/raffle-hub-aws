import { Duration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface RaffleHubQueueProps {
  consumer: IFunction;
}

export class RaffleHubQueue extends Construct {
  public readonly expireTicketQueue: IQueue;

  constructor(scope: Construct, id: string, props: RaffleHubQueueProps) {
    super(scope, id);
    this.expireTicketQueue = this.createExpireTicketQueue(props.consumer);
  }

  private createExpireTicketQueue(consumer: IFunction) {
    const expireTicketQueue = new Queue(this, 'ExpireTicketQueue', {
      queueName: 'ExpireTicketQueue',
      visibilityTimeout: Duration.seconds(30),
      deliveryDelay: Duration.minutes(10),
    });

    consumer.addEventSource(new SqsEventSource(expireTicketQueue));
    return expireTicketQueue;
  }
}
