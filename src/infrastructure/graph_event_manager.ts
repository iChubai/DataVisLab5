import { Graph } from "./graph";

export type GraphEvent = "NodeAdded" | "NodeRemoved" | "EdgeAdded" | "EdgeRemoved";
export const GraphEvents: Set<GraphEvent> = new Set([
  "NodeAdded",
  "NodeRemoved",
  "EdgeAdded",
  "EdgeRemoved",
]);
export type GraphEventCallback = (id: string) => void;

export class GraphEventManager {
  private _callbacks: Map<GraphEvent, GraphEventCallback[]> = new Map();

  constructor(private _graph: Graph) {
    this._callbacks = new Map();
    GraphEvents.forEach((event) => {
      this._callbacks.set(event, []);
    });
  }

  on(event: GraphEvent, callback: GraphEventCallback): void {
    this._callbacks.get(event)!.push(callback);
  }

  off(event: GraphEvent, callback: GraphEventCallback): void {
    const callbacks = this._callbacks.get(event) ?? [];
    this._callbacks.set(
      event,
      callbacks.filter((callback) => callback !== callback)
    );
  }

  trigger(event: GraphEvent, id: string): void {
    this._callbacks.get(event)?.forEach((callback) => callback(id));
  }
}
