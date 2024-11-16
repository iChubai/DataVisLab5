import { Graph, Node, Edge } from "./graph";
import { ForceSimulation } from "./force";
import { MouseEventManager } from "./event_manager";

import * as d3 from "d3";

export class GraphController {
  private svg: SVGSVGElement;
  private graph: Graph;

  private forceSimulation: ForceSimulation;
  private eventManager: MouseEventManager;

  constructor(svg: SVGSVGElement) {
    // 初始化
    this.svg = d3.select(svg).style("background-color", "#f9f9f9").node() as SVGSVGElement;
    this.graph = new Graph();

    this.forceSimulation = new ForceSimulation(this);
    this.forceSimulation.applyDragBehavior(d3.select(this.svg).selectAll("circle"));

    this.eventManager = new MouseEventManager(this);
  }

  public getGraph(): Graph {
    return this.graph;
  }

  public getSVG(): SVGSVGElement {
    return this.svg;
  }

  public EventManager(): MouseEventManager {
    return this.eventManager;
  }

  public addNode(node: Node): number {
    const id = this.graph.addNode(node);
    this.forceSimulation.addNode(node);
    return id;
  }

  public addEdge(edge: Edge): void {
    this.graph.addEdge(edge);
    this.forceSimulation.addEdge(edge);
  }

  public removeNode(node: Node): void {
    this.graph.removeNode(node.id);
    this.forceSimulation.removeNode(node.id);
  }

  public removeEdge(edge: Edge): void {
    this.graph.removeEdge(edge);
    this.forceSimulation.removeEdge(edge);
  }
}
