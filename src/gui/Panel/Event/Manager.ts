import { PanelRender as PanelRenderer } from "../Renderer";

export type PanelEvent = "UpdateParameter";
export const PanelEvents: Set<PanelEvent> = new Set(["UpdateParameter"]);
export type PanelEventCallback = (
  paramName: string,
  itemId?: string,
  metaData?: Record<string, any>
) => void;

export class PanelEventManager {
  private _callbacks: Map<PanelEvent, PanelEventCallback[]>;

  constructor(private panelRenderer: PanelRenderer) {
    this._callbacks = new Map();
    PanelEvents.forEach((event) => {
      this._callbacks.set(event, []);
    });
  }

  on(event: PanelEvent, callback: PanelEventCallback): void {
    this._callbacks.get(event)!.push(callback);
  }

  off(event: PanelEvent, callback: PanelEventCallback): void {
    const callbacks = this._callbacks.get(event) ?? [];
    this._callbacks.set(
      event,
      callbacks.filter((c) => c !== callback)
    );
  }

  trigger(
    PanelMouseEvent: PanelEvent,
    context: { paramName: string; id?: string; metaData?: Record<string, any> }
  ): void {
    const { paramName, id, metaData } = context;
    this._callbacks.get(PanelMouseEvent)?.forEach((callback) => callback(paramName, id, metaData));
  }
}
