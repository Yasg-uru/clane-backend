import type { Channel, ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import { logger } from "../utils/logger";

export abstract class BaseWorker {
  protected channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(protected readonly rabbitMQ: RabbitMQConnection) {}

  protected abstract readonly queueName: string;
  protected abstract readonly exchangeName: string;
  protected abstract readonly routingKey: string | string[];
  protected abstract readonly prefetch: number;

  protected abstract handleMessage(msg: ConsumeMessage): Promise<void>;

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(this.exchangeName, "topic", { durable: true });
    await this.channel.assertQueue(this.queueName, { durable: true });

    const keys = Array.isArray(this.routingKey) ? this.routingKey : [this.routingKey];
    for (const key of keys) {
      await this.channel.bindQueue(this.queueName, this.exchangeName, key);
    }

    this.channel.prefetch(this.prefetch);

    const { consumerTag } = await this.channel.consume(
      this.queueName,
      (msg) => {
        if (!msg) return;
        void this.handleMessage(msg);
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info(`${this.constructor.name} started`);
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info(`${this.constructor.name} stopped`);
  }
}
