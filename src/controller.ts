import { Graph, Node, Edge } from "./graph";
import { DragHandler, ClickHandler, HoldHandler } from "./event_handlers";
import { ForceSimulation } from "./force";
import { Renderer } from "./render";
import { MouseEventManager } from "./event_manager";

import * as d3 from "d3";

export class GraphController {
  private svg: SVGSVGElement;
  private graph: Graph;
  private renderer: Renderer;
  private forceSimulation: ForceSimulation;
  private eventManager: MouseEventManager;

  constructor(containerId: string) {
    // 初始化
    this.svg = d3
      .select(`#${containerId}`)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("background-color", "#f9f9f9")
      .node() as SVGSVGElement;
    this.graph = new Graph();
    this.renderer = new Renderer(this.graph, this.svg);
    this.forceSimulation = new ForceSimulation(this.graph);
    this.eventManager = new MouseEventManager(this.graph, this.svg);

    d3.select(this.svg).on("mousedown", () => this.update());
    d3.select(this.svg).on("mousemove", () => this.update());
    d3.select(this.svg).on("mouseup", () => this.update());

    this.update();
  }

  bindEvents(containerId: string): void {


  private update(): void {
    this.forceSimulation.update();
    this.renderer.render();
  }

  public getGraph(): Graph {
    return this.graph;
  }

  public getSVG(): SVGSVGElement {
    return this.svg;
  }
}
