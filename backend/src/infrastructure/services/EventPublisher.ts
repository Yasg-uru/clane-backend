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

    try {
      return channel.publish(
        exchange ?? this.rabbitMQ.getExchangeName(),
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { contentType: "application/json", persistent: true },
      );
    } catch (error) {
      logger.warn("RabbitMQ publish failed, skipping event", { routingKey, error });
      return false;
    }
  }
}
