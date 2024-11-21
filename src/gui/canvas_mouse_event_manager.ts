export type CanvasMouseEvent = "NodeClicked" | "EdgeClicked" | "CanvasClicked";
export const CanvasMouseEvents: Set<CanvasMouseEvent> = new Set([
  "NodeClicked",
  "EdgeClicked",
  "CanvasClicked",
]);
export type CanvasMouseEventCallback = (event: MouseEvent, itemId?: string) => void;

export class CanvasMouseEventManager {
  private _callbacks: Map<CanvasMouseEvent, CanvasMouseEventCallback[]>;

  constructor(private canvas: SVGSVGElement) {
    this._callbacks = new Map();
    CanvasMouseEvents.forEach((event) => {
      this._callbacks.set(event, []);
    });
  }

  on(event: CanvasMouseEvent, callback: CanvasMouseEventCallback): void {
    this._callbacks.get(event)!.push(callback);
  }

  off(event: CanvasMouseEvent, callback: CanvasMouseEventCallback): void {
    const callbacks = this._callbacks.get(event) ?? [];
    this._callbacks.set(
      event,
      callbacks.filter((callback) => callback !== callback)
    );
  }

  trigger(canvasMouseEvent: CanvasMouseEvent, context: { event: MouseEvent; id?: string }): void {
    const { event, id } = context;
    this._callbacks.get(canvasMouseEvent)?.forEach((callback) => callback(event, id));
  }
}
