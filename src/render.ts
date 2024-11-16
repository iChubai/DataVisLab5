import { Graph, Node, Edge } from "./graph";
import * as d3 from "d3";

export class Renderer {
  private graph: Graph;
  private svg: SVGSVGElement;

  constructor(graph: Graph, svg: SVGSVGElement) {
    this.graph = graph;
    this.svg = svg;
  }

  // 渲染图
  render(): void {
    this.renderEdges();
    this.renderNodes();
  }

  // 渲染边
  private renderEdges(): void {
    const edges = this.graph.getEdges();

    const edgeSelection = d3
      .select(this.svg)
      .selectAll<SVGLineElement, Edge>("line")
      .data(edges, (d: Edge) => `${d.source}-${d.target}`);

    edgeSelection
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .merge(edgeSelection as any)
      .attr("x1", (d: Edge) => this.graph.getNodeById(d.source)?.x || 0)
      .attr("y1", (d: Edge) => this.graph.getNodeById(d.source)?.y || 0)
      .attr("x2", (d: Edge) => this.graph.getNodeById(d.target)?.x || 0)
      .attr("y2", (d: Edge) => this.graph.getNodeById(d.target)?.y || 0);

    edgeSelection.exit().remove();
  }

  // 渲染节点
  private renderNodes(): void {
    const nodes = this.graph.getNodes();

    const nodeSelection = d3
      .select(this.svg)
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodes, (d: Node) => d.id);

    nodeSelection
      .enter()
      .append("circle")
      .attr("r", (d: Node) => d.radius)
      .attr("fill", "#69b3a2")
      .merge(nodeSelection as any)
      .attr("cx", (d: Node) => d.x)
      .attr("cy", (d: Node) => d.y);

    nodeSelection.exit().remove();
  }
}
