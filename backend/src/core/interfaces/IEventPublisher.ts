export interface IEventPublisher {
  publish(routingKey: string, payload: Record<string, unknown>, exchange?: string): boolean;
}
