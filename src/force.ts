import * as d3 from "d3";
import { Graph, Node, Edge } from "./graph";
import { GraphController } from "./controller";

export class ForceSimulation {
  private simulation: d3.Simulation<Node, Edge>;
  private controller: GraphController;
  private width: number;
  private height: number;
  private draggedNode: Node | null = null;
  private dragTarget: { x: number; y: number } | null = null;

  constructor(controller: GraphController) {
    this.controller = controller;
    this.width = this.controller.getSVG().clientWidth;
    this.height = this.controller.getSVG().clientHeight;

    const nodes = this.controller.getGraph().getNodes();
    const edges = this.controller
      .getGraph()
      .getEdges()
      .map((edge) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      }));

    // 创建 D3 力学仿真
    this.simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Edge>(edges)
          .id((d) => d.id)
          .distance(100) // 默认边长
      )
      .force("charge", d3.forceManyBody().strength(-500)) // 节点间斥力
      .force(
        "center",
        d3.forceCenter(this.width / 2, this.height / 2) // 指向中心的力
      )
      .force("x", d3.forceX(this.width / 2).strength(0.1)) // X轴方向力
      .force("y", d3.forceY(this.height / 2).strength(0.1))
      .force("drag", this.createDragForce(0.02)); // Y轴方向力

    // Tick 更新逻辑
    this.simulation.on("tick", () => {
      this.updatePositions();
      this.updateEdges();
      this.updateNodes();
    });
  }

  private updateNodes(): void {
    const node = d3
      .select(this.controller.getSVG())
      .selectAll<SVGCircleElement, Node>("circle")
      .data(this.controller.getGraph().getNodes(), (d: Node) => d.id);

    node
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => "steelblue")
      .call((enter) => {
        this.applyDragBehavior(enter);
      });

    node.exit().remove();

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  private updateEdges(): void {
    const link = d3
      .select(this.controller.getSVG())
      .selectAll<SVGLineElement, Edge>("line")
      .data(this.controller.getGraph().getEdges(), (d: Edge) => `${d.source}-${d.target}`);

    link.enter().append("line").attr("stroke", "gray").attr("stroke-width", 2);

    link.exit().remove();

    link
      .attr("x1", (d) => this.controller.getGraph().getNodeById(d.source)?.x ?? 0)
      .attr("y1", (d) => this.controller.getGraph().getNodeById(d.source)?.y ?? 0)
      .attr("x2", (d) => this.controller.getGraph().getNodeById(d.target)?.x ?? 0)
      .attr("y2", (d) => this.controller.getGraph().getNodeById(d.target)?.y ?? 0);
  }

  // 更新图数据位置
  private updatePositions(): void {
    this.controller
      .getGraph()
      .getNodes()
      .forEach((node) => {
        node.x = node.x ?? 0;
        node.y = node.y ?? 0;
      });
  }

  // 添加节点时更新仿真
  public addNode(node: Node): void {
    this.simulation.nodes(this.controller.getGraph().getNodes());
    this.simulation.alpha(1).restart();
  }

  // 添加边时更新仿真
  public addEdge(edge: Edge): void {
    const links = this.controller
      .getGraph()
      .getEdges()
      .map((edge) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      }));
    (this.simulation.force("link") as d3.ForceLink<Node, Edge>).links(links);
    this.simulation.alpha(1).restart();
  }

  // 删除节点时更新仿真
  public removeNode(nodeId: number): void {
    this.simulation.nodes(this.controller.getGraph().getNodes());
    this.simulation.alpha(1).restart();
  }

  // 删除边时更新仿真
  public removeEdge(edge: Edge): void {
    const links = this.controller
      .getGraph()
      .getEdges()
      .map((edge) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      }));
    (this.simulation.force("link") as d3.ForceLink<Node, Edge>).links(links);
    this.simulation.alpha(1).restart();
  }
  // 创建拖拽力. strengh 表示力度系数
  private createDragForce(strength: number = 0.1): d3.Force<Node, Edge> {
    return () => {
      if (this.draggedNode && this.dragTarget) {
        // 计算鼠标与节点之间的距离和方向
        const dx = this.dragTarget.x - this.draggedNode.x;
        const dy = this.dragTarget.y - this.draggedNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 施加拖拽力，大小正比于距离
        this.draggedNode.vx += (dx / distance) * distance * strength;
        this.draggedNode.vy += (dy / distance) * distance * strength;
      }
    };
  }

  // 处理拖拽行为
  public applyDragBehavior(nodeSelection: d3.Selection<SVGCircleElement, Node, any, any>): void {
    nodeSelection.call(
      d3
        .drag<SVGCircleElement, Node>()
        .on("start", this.dragStarted.bind(this))
        .on("drag", this.dragged.bind(this))
        .on("end", this.dragEnded.bind(this))
    );
  }

  private dragStarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>): void {
    this.draggedNode = event.subject; // 设置当前拖拽的节点
    this.dragTarget = { x: event.x, y: event.y }; // 初始化鼠标位置
    this.simulation.alphaTarget(0.3).restart();
  }

  private dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>): void {
    if (this.dragTarget) {
      // 更新鼠标位置
      this.dragTarget.x = event.x;
      this.dragTarget.y = event.y;
    }
  }

  private dragEnded(event: d3.D3DragEvent<SVGCircleElement, Node, Node>): void {
    if (this.draggedNode) this.controller.EventManager().onDragEnd(event, this.draggedNode);

    this.draggedNode = null; // 清除拖拽的节点
    this.dragTarget = null; // 清除鼠标位置
    this.simulation.alphaTarget(0);
  }
}
