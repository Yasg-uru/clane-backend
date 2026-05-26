import type { RabbitMQConnection } from "../../config/RabbitMQConnection";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import { logger } from "../../utils/logger";

export class EventPublisher implements IEventPublisher {
  constructor(private readonly rabbitMQ: RabbitMQConnection) {}

  publish(routingKey: string, payload: Record<string, unknown>, exchange?: string): boolean {
    const channel = this.rabbitMQ.getChannel();

    if (!channel) {
      logger.warn("RabbitMQ channel not ready, skipping event", { routingKey });
      return false;
    }

    return channel.publish(
      exchange ?? this.rabbitMQ.getExchangeName(),
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { contentType: "application/json", persistent: true },
    );
  }
}
