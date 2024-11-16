import { Graph, Node, Edge } from "./graph";
import * as d3 from "d3";

export class ForceSimulation {
  private simulation: d3.Simulation<Node, Edge>;
  private graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;

    // 初始化力学仿真
    this.simulation = d3
      .forceSimulation<Node>(graph.getNodes())
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)) // 场景中心引力
      .force("charge", d3.forceManyBody().strength(-50)) // 节点之间的斥力
      .force(
        "link",
        d3
          .forceLink<Node, Edge>()
          .id((d: Node) => d.id)
          .strength(0.05)
          .links(graph.getEdges() as Edge[]) // 有向边引力
      )
      .on("tick", () => this.onTick());
  }

  // 更新仿真数据
  update(): void {
    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();

    this.simulation.nodes(nodes);

    const linkForce = this.simulation.force("link") as d3.ForceLink<Node, Edge>;
    linkForce.links(edges);

    this.simulation.alpha(1).restart();
  }

  // 力学仿真每次迭代时调用
  private onTick(): void {
    // 更新节点的位置
    const nodes = this.graph.getNodes();
    nodes.forEach((node) => {
      // 边界限制，防止节点超出画布
      node.x = Math.max(0, Math.min(window.innerWidth, node.x));
      node.y = Math.max(0, Math.min(window.innerHeight, node.y));
    });
  }

  // 暂停仿真
  stop(): void {
    this.simulation.stop();
  }

  // 恢复仿真
  resume(): void {
    this.simulation.alpha(1).restart();
  }
}
