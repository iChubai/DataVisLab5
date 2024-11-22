import { SNNModel } from "../Model";

export type SNNEvent = "Spike" | "Reset";
export const SNNEvents: Set<SNNEvent> = new Set(["Spike", "Reset"]);
export type SNNEventCallback = (itemId: string, metaData?: Record<string, any>) => void;
export class SNNEventManager {
  private _callbacks: Map<SNNEvent, SNNEventCallback[]>;

  constructor() {
    this._callbacks = new Map();
    SNNEvents.forEach((event) => {
      this._callbacks.set(event, []);
    });
  }

  on(event: SNNEvent, callback: SNNEventCallback): void {
    this._callbacks.get(event)!.push(callback);
  }

  off(event: SNNEvent, callback: SNNEventCallback): void {
    const callbacks = this._callbacks.get(event) ?? [];
    this._callbacks.set(
      event,
      callbacks.filter((c) => c !== callback)
    );
  }

  trigger(event: SNNEvent, context: { itemId: string; metaData?: Record<string, any> }): void {
    const { itemId, metaData } = context;
    this._callbacks.get(event)?.forEach((callback) => callback(itemId, metaData));
  }
}
