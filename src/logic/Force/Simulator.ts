import * as d3 from "d3";
import { Graph, Node, Edge } from "../../core/Graph";
import { GUIController } from "../../gui/controller";
import { ParameterManager } from "../../core/ParameterManager";

// 定义常量
const NODE_DEFAULT_RADIUS = 20; // 节点的默认半径

export class NodePhysicParamRegistry {
  private graph: Graph;
  private nodeParamManager: ParameterManager;
  constructor(graph: Graph, nodeParamManager: ParameterManager) {
    this.graph = graph;
    this.nodeParamManager = nodeParamManager;
  }
  /**
   * 注册节点参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * - x: number - 节点的 x 坐标。
   * - y: number - 节点的 y 坐标。
   * - vx: number - 节点的 x 方向速度。
   * - vy: number - 节点的 y 方向速度。
   * - radius: number - 节点的半径。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      console.log(this.nodeParamManager); // FIXME: remove this line
      if (this.nodeParamManager.existNodeParam(param)) {
        console.warn(`Node parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "x": {
          this.nodeParamManager.addNodeParam({
            name: "x",
            type: "number",
            value: 0,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} x changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "y": {
          this.nodeParamManager.addNodeParam({
            name: "y",
            type: "number",
            value: 0,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} y changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "vx": {
          this.nodeParamManager.addNodeParam({
            name: "vx",
            type: "number",
            value: 0,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} vx changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "vy": {
          this.nodeParamManager.addNodeParam({
            name: "vy",
            type: "number",
            value: 0,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} vy changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        case "radius": {
          this.nodeParamManager.addNodeParam({
            name: "radius",
            type: "number",
            value: NODE_DEFAULT_RADIUS,
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} radius changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        default:
          console.warn(`Unsupported node parameter "${param}".`);
      }
    });
  }
}

/**
 * 节点渲染参数注册类。
 *
 * 注：由于使用D3图形库绘制图形，因此渲染参数不宜使用CSS，所以此处将渲染参数视为节点参数的一部分。
 */
export class NodeRenderParamRegistry {
  private graph: Graph;
  private nodeParamManager: ParameterManager;
  constructor(graph: Graph, nodeParamManager: ParameterManager) {
    this.graph = graph;
    this.nodeParamManager = nodeParamManager;
  }
  /**
   * 注册节点渲染参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * // TODO
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      if (this.nodeParamManager.existNodeParam(param)) {
        console.warn(`Node parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        // TODO
        default:
          console.warn(`Unsupported node render parameter ${param}, skip.`);
      }
    });
  }
}

/**
 * 力学仿真类，用于处理节点和边的力学模拟与更新。
 * 同时也负责渲染。
 */
export class ForceSimulator {
  private controller: GUIController; // 图形控制器实例
  private simulation: d3.Simulation<Node, Edge>; // D3 力学仿真对象
  private width: number; // SVG 宽度
  private height: number; // SVG 高度
  private draggedNode: Node | null = null; // 当前拖拽的节点
  private dragTarget: { x: number; y: number } | null = null; // 鼠标拖拽目标位置

  /**
   * 构造函数，初始化力学仿真。
   * @param {GUIController} controller - 图形控制器实例。
   */
  constructor(controller: GUIController) {
    this.controller = controller;
    this.width = this.controller.getSVG().clientWidth;
    this.height = this.controller.getSVG().clientHeight;
    const graph = this.controller.getGraph();
    const nodeParameterManager = graph.getParamManager();

    const svg = d3.select(this.controller.getSVG());
    svg.append("g").attr("class", "edges"); // 初始化边容器
    svg.append("g").attr("class", "nodes"); // 初始化节点容器

    const nodes = graph.getNodes().map((node) => ({
      _id: node._id,
      x: nodeParameterManager.get(node._id, "x"),
      y: nodeParameterManager.get(node._id, "y"),
      vx: nodeParameterManager.get(node._id, "vx"),
      vy: nodeParameterManager.get(node._id, "vy"),
    }));

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
          .id((d) => d._id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("x", d3.forceX(this.width / 2).strength(0.1))
      .force("y", d3.forceY(this.height / 2).strength(0.1))
      .force("drag", this.createDragForce(0.02));

    // Tick 更新逻辑
    this.simulation.on("tick", () => {
      this.updateEdges();
      this.updateNodes();
      this.updatePositions();
    });
  }

  /**
   * 向其他模块注册回调函数。
   */
  registerCallbacks(): void {
    this.controller.on("NodeAdded", (nodeId: string) => {
      this.whenNodeAdded(nodeId);
    });
    this.controller.on("EdgeAdded", (edgeId: string) => {
      this.whenEdgeAdded(edgeId);
    });
    this.controller.on("NodeRemoved", (nodeId: string) => {
      this.whenNodeRemoved(nodeId);
    });
    this.controller.on("EdgeRemoved", (edgeId: string) => {
      this.whenEdgeRemoved(edgeId);
    });
  }

  /**
   * 更新节点的显示。
   * 对节点数据进行绑定，并根据仿真结果更新其位置。
   */
  private updateNodes(): void {
    const nodeGroup = d3.select(this.controller.getSVG()).select(".nodes");
    const node = nodeGroup
      .selectAll<SVGCircleElement, Node>("circle")
      .data(this.controller.getGraph().getNodes(), (d: Node) => d._id);

    node
      .enter()
      .append("circle")
      .attr("r", (d) => NODE_DEFAULT_RADIUS)
      .attr("fill", (d) => "steelblue")
      .on("mouseover", (event, node) => {
        d3.select(event.target).attr("fill", "lightblue");
        console.log("Mouseover on node:", node);
      }) // 设置鼠标移入节点时变色
      .on("mouseout", (event, node) => {
        d3.select(event.target).attr("fill", "steelblue");
      }) // 设置鼠标移出节点时恢复
      // .on("dragstart", (event, node) => {
      //   d3.select(event.target).attr("fill", "skyblue");
      // }) // 设置节点开始拖拽时变色
      // .on("dragend", (event, node) => {
      //   d3.select(event.target).attr("fill", "steelblue");
      // }) // 设置节点结束拖拽时恢复
      // NOTE: 此处定义的拖拽事件似乎会被`applyDragBehavior`覆盖。
      .call((enter) => {
        this.applyDragBehavior(enter);
        this.applyClickBehavior(enter);
      });

    node.exit().remove();

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    // 将节点的物理参数实时返回给参数管理器。
    const nodeParamManager = this.controller.getGraph().getParamManager();
    node.each((d) => {
      nodeParamManager.set(d._id, "x", d.x);
      nodeParamManager.set(d._id, "y", d.y);
      nodeParamManager.set(d._id, "vx", d.vx);
      nodeParamManager.set(d._id, "vy", d.vy);
    });
  }

  /**
   * 更新边的显示。
   * 根据仿真结果重新计算边的位置和形状。
   */
  private updateEdges(): void {
    const edgeGroup = d3.select(this.controller.getSVG()).select(".edges");

    // 边检测区域
    const edgePath = edgeGroup
      .selectAll<SVGPathElement, Edge>("path")
      .data(this.controller.getGraph().getEdges(), (d: Edge) => `${d.source}-${d.target}`);

    edgePath
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 10)
      .on("mouseover", (event, edge) => {
        d3.select(event.target).attr("stroke", "lightblue");
        console.log("Mouseover on edge:", edge);
      }) // 设置鼠标移入边时变色
      .on("mouseout", (event, edge) => {
        d3.select(event.target).attr("stroke", "transparent");
      }); // 设置鼠标移出边时恢复

    edgePath.attr("d", (d) => {
      const source = this.controller.getGraph().getNodeById(d.source);
      const target = this.controller.getGraph().getNodeById(d.target);
      if (source && target) {
        return `M ${source.x},${source.y} L ${target.x},${target.y}`;
      }
      return null;
    });

    edgePath.exit().remove();

    const link = edgeGroup
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

  /**
   * 更新图数据位置。
   */
  private updatePositions(): void {
    this.controller
      .getGraph()
      .getNodes()
      .forEach((node) => {
        node.x = node.x ?? 0;
        node.y = node.y ?? 0;
      });
  }

  /**
   * 添加节点时更新仿真。
   * @param {string} nodeId - 要添加的节点。
   */
  public whenNodeAdded(nodeId: string): void {
    this.simulation.nodes(this.controller.getGraph().getNodes());
    this.simulation.alpha(1).restart();
  }

  /**
   * 添加边时更新仿真。
   * @param {string} edgeId - 要添加的边。
   */
  public whenEdgeAdded(edgeId: string): void {
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

  /**
   * 删除节点时更新仿真。
   * @param {string} nodeId - 要删除的节点。
   */
  public whenNodeRemoved(nodeId: string): void {
    this.simulation.nodes(this.controller.getGraph().getNodes());
    this.simulation.alpha(1).restart();
  }

  /**
   * 删除边时更新仿真。
   * @param {string} edgeId - 要删除的边。
   */
  public whenEdgeRemoved(edgeId: string): void {
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

  /**
   * 创建拖拽力。
   * @param {number} strength - 力度系数。
   * @returns {d3.Force<Node, Edge>} 自定义的拖拽力。
   */
  private createDragForce(strength: number = 0.1): d3.Force<Node, Edge> {
    return () => {
      if (this.draggedNode && this.dragTarget) {
        const dx = this.dragTarget.x - this.draggedNode.x;
        const dy = this.dragTarget.y - this.draggedNode.y;
        this.draggedNode.vx += dx * strength;
        this.draggedNode.vy += dy * strength;
      }
    };
  }

  /**
   * 为节点应用拖拽行为。
   * @param {d3.Selection<SVGCircleElement, Node, any, any>} nodeSelection - 节点的 D3 选择器。
   */
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
    this.draggedNode = event.subject;
    this.dragTarget = { x: event.x, y: event.y };
    this.simulation.alphaTarget(0.3).restart();
  }

  private dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>): void {
    if (this.dragTarget) {
      this.dragTarget.x = event.x;
      this.dragTarget.y = event.y;
    }
  }

  private dragEnded(event: d3.D3DragEvent<SVGCircleElement, Node, Node>): void {
    if (this.draggedNode)
      // this.controller.getCanvasEventAnalyst().onDragEnd(event, this.draggedNode);
      this.controller.getCanvasEventManager().trigger("NodeDragEnd", {
        event: new MouseEvent("dragend"),
        id: this.draggedNode._id,
        metaData: { DragEndNode: this.findNodeUnderPlace(event.x, event.y) },
      });
    this.draggedNode = null;
    this.dragTarget = null;
    this.simulation.alphaTarget(0);
  }

  private applyClickBehavior(nodeSelection: d3.Selection<SVGCircleElement, Node, any, any>): void {
    nodeSelection.on("click", (event, node) => {
      this.controller.getCanvasEventManager().trigger("NodeClicked", { event, id: node._id });
    });
  }

  private findNodeUnderPlace(x: number, y: number): Node | null {
    const nodes = this.controller.getGraph().getNodes();
    for (let node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < NODE_DEFAULT_RADIUS) {
        return node;
      }
    }
    return null;
  }
}
