import type { Response } from "express";

const subscribers = new Map<string, Set<Response>>();

export function subscribe(channel: string, res: Response) {
  if (!subscribers.has(channel)) {
    subscribers.set(channel, new Set());
  }

  subscribers.get(channel)!.add(res);
}

export function unsubscribe(channel: string, res: Response) {
  const clients = subscribers.get(channel);

  if (!clients) {
    return;
  }

  clients.delete(res);

  if (clients.size === 0) {
    subscribers.delete(channel);
  }
}

export function emit(channel: string, { event, data }: { event: string; data: unknown }) {
  const clients = subscribers.get(channel);

  if (!clients) {
    return;
  }

  for (const res of clients) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}
