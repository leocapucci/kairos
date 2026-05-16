import type { QueuedEvent } from '../queue';

export function consoleProvider(batch: QueuedEvent[]): Promise<void> {
  batch.forEach(({ event, props, ts, distinctId }) => {
    const time = new Date(ts).toISOString().slice(11, 23);
    console.log(`[analytics] ${event}`, { ...props, _user: distinctId.slice(0, 12), _t: time });
  });
  return Promise.resolve();
}
