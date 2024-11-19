import { NodeParameterManager, NodeParameter } from "./parameter";

/**
 * 节点接口，描述节点的属性。
 */
export interface Node {
  id: string; // 节点唯一标识符
  x: number; // 节点的 x 坐标
  y: number; // 节点的 y 坐标
  vx: number; // 节点的 x 方向速度
  vy: number; // 节点的 y 方向速度
}

/**
 * 边接口，描述边的属性。
 */
export interface Edge {
  id: string;
  source: string; // 边的起点节点 ID
  target: string; // 边的终点节点 ID
  info: string; // 边的权重或附加信息
}

export class NodeBasicParamRegistry {
  private graph: Graph;
  private nodeParamManager: NodeParameterManager;
  constructor(graph: Graph, nodeParamManager: NodeParameterManager) {
    this.graph = graph;
    this.nodeParamManager = nodeParamManager;
  }
  /**
   * 注册节点参数。
   * @param {...string} params - 要注册的参数名。
   *
   * 支持的参数：
   * - "info": 节点的附加信息，可以随时修改。
   */
  register(...params: string[]): void {
    params.forEach((param) => {
      console.log(this.nodeParamManager); // FIXME: remove this line
      if (this.nodeParamManager.has(param)) {
        console.warn(`Node parameter ${param} already exists, skip.`);
        return;
      }
      switch (param) {
        case "info": {
          this.nodeParamManager.add({
            name: "info",
            type: "string",
            value: "",
            isChanganble: true,
            onChange: (nodeId, newValue) => {
              // TODO
              console.log(`Node ${nodeId} info changed to ${newValue}`); // NOTE: 回调函数最好写一个log，方便调试
            },
          });
        }
        default:
          console.warn(`Unsupported node parameter "${param}".`);
      }
    });
  }
}

export type GraphEventCallback<T extends Node | Edge> = (data: T) => void;

/**
 * 图类，用于管理图的节点和边数据。
 */
export class Graph {
  private nodes: Map<string, Node>; // 存储节点的映射表
  private edges: Map<string, Edge>; // 存储边的映射表，键格式为 "source-target"
  private adjacencyList: Map<string, { inEdges: Set<string>; outEdges: Set<string> }>; // 邻接表
  private nodeIndex: number; // 节点索引计数器

  private nodeAddedCallbacks: Array<GraphEventCallback<Node>>;
  private nodeRemovedCallbacks: Array<GraphEventCallback<Node>>;
  private edgeAddedCallbacks: Array<GraphEventCallback<Edge>>;
  private edgeRemovedCallbacks: Array<GraphEventCallback<Edge>>;

  private nodeParameterManager: NodeParameterManager;
  /**
   * 构造函数，初始化图的结构。
   */
  constructor() {
    // 基本数据结构，存储基本内容（节点、边、邻接表、索引管理器），应当第一个被初始化
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.nodeIndex = 0;

    // 回调函数数组，有可能被接下来初始化的模块注册，所以要第二个被初始化
    this.nodeAddedCallbacks = new Array();
    this.nodeRemovedCallbacks = new Array();
    this.edgeAddedCallbacks = new Array();
    this.edgeRemovedCallbacks = new Array();

    // 其他附属数据结构，其中可能会注册一些回调，所以要第三个被初始化
    this.nodeParameterManager = new NodeParameterManager(this);
  }

  /**
   * 添加节点到图中。
   * @param {Node} node - 要添加的节点。
   * @returns {string} 返回分配给该节点的唯一 ID。
   */
  addNode(node: Node): string {
    node.id = `${this.nodeIndex}`;
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, { inEdges: new Set(), outEdges: new Set() });
    this.nodeIndex++;

    this.nodeAddedCallbacks.forEach((callback) => callback(node));

    return node.id;
  }

  /**
   * 从图中移除节点。
   * @param {number} nodeId - 要移除的节点 ID。
   */
  removeNode(nodeId: string): void {
    this.nodeRemovedCallbacks.forEach((callback) => callback(this.getNodeById(nodeId)!)); // 先处理回调，再删除数据。

    if (!this.nodes.has(nodeId)) return;

    if (this.hasNeighbor(nodeId)) {
      console.warn(`Node ${nodeId} has related edges, cannot remove it.`);
      return;
    }

    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
  }

  /**
   * 添加边到图中。
   * @param {Edge} edge - 要添加的边。
   */
  addEdge(edge: Edge): void {
    const key = Graph.getEdgeId(edge.source, edge.target);
    if (this.edges.has(key)) return;

    this.edges.set(key, edge);
    this.adjacencyList.get(edge.source)!.outEdges.add(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.add(edge.source);

    this.edgeAddedCallbacks.forEach((callback) => callback(edge));
  }

  /**
   * 从图中移除边。
   * @param {Edge} edge - 要移除的边。
   */
  removeEdge(edge: Edge): void {
    this.edgeRemovedCallbacks.forEach((callback) => callback(edge)); // 先处理回调，再删除数据。

    const key = Graph.getEdgeId(edge.source, edge.target);
    if (!this.edges.has(key)) return;

    this.edges.delete(key);
    this.adjacencyList.get(edge.source)!.outEdges.delete(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.delete(edge.source);
  }

  onNodeAdded(callback: GraphEventCallback<Node>): void {
    this.nodeAddedCallbacks.push(callback);
  }

  onNodeRemoved(callback: GraphEventCallback<Node>): void {
    this.nodeRemovedCallbacks.push(callback);
  }

  onEdgeAdded(callback: GraphEventCallback<Edge>): void {
    this.edgeAddedCallbacks.push(callback);
  }

  onEdgeRemoved(callback: GraphEventCallback<Edge>): void {
    this.edgeRemovedCallbacks.push(callback);
  }

  // 通过sourcId和targetId获取边Id
  static getEdgeId(sourceId: string, targetId: string): string {
    return `${sourceId}->${targetId}`;
  }

  // 通过边Id获取sourceId和targetId
  static getSourceId(edgeId: string): string {
    return edgeId.split("->")[0];
  }

  static getTargetId(edgeId: string): string {
    return edgeId.split("->")[1];
  }

  /**
   * 获取图中的所有节点。
   * @returns {Node[]} 节点数组。
   */
  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取图中的所有边。
   * @returns {Edge[]} 边数组。
   */
  getEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  /**
   * 根据节点 ID 获取节点。
   * @param {number} nodeId - 节点 ID。
   * @returns {Node | undefined} 对应的节点对象。
   */
  getNodeById(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 获取连接到指定节点的源节点数组。
   * @param {string} nodeId - 节点 ID。
   * @returns {Node[]} 源节点数组。
   */
  getSourceNodes(nodeId: string): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.inEdges)
      .map((sourceId) => this.nodes.get(sourceId)!)
      .filter(Boolean);
  }

  /**
   * 获取从指定节点连接的目标节点数组。
   * @param {string} nodeId - 节点 ID。
   * @returns {Node[]} 目标节点数组。
   */
  getTargetNodes(nodeId: string): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.outEdges)
      .map((targetId) => this.nodes.get(targetId)!)
      .filter(Boolean);
  }

  getSourceEdges(nodeId: string): Edge[] {
    return Array.from(this.adjacencyList.get(nodeId)!.inEdges)
      .map((sourceId) => this.edges.get(Graph.getEdgeId(sourceId, nodeId))!)
      .filter(Boolean);
  }

  getTargetEdges(nodeId: string): Edge[] {
    return Array.from(this.adjacencyList.get(nodeId)!.outEdges)
      .map((targetId) => this.edges.get(Graph.getEdgeId(nodeId, targetId))!)
      .filter(Boolean);
  }

  /**
   * 判断节点是否存在。
   * @param {number} nodeId - 节点 ID。
   * @returns {boolean} 节点是否存在。
   */
  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * 判断边是否存在。
   * @param {string} source - 边的起点节点 ID。
   * @param {string} target - 边的终点节点 ID。
   * @returns {boolean} 边是否存在。
   */
  hasEdge(source: string, target: string): boolean {
    return this.edges.has(`${source}-${target}`);
  }

  /**
   * 检查指定节点是否有相邻的源或目标节点。
   * @param {string} nodeId - 节点 ID。
   * @returns {boolean} 是否有相邻节点。
   */
  hasNeighbor(nodeId: string): boolean {
    return (
      this.adjacencyList.get(nodeId)!.inEdges.size > 0 ||
      this.adjacencyList.get(nodeId)!.outEdges.size > 0
    );
  }

  getNodeParameterManager(): NodeParameterManager {
    return this.nodeParameterManager;
  }

  /**
   * 获取图的字符串表示。
   * @returns {string} 图的概要信息。
   */
  toString(): string {
    const nodesInfo = Array.from(this.nodes.values())
      .map((node) => `Node ${node.id}: (${node.x.toFixed(2)}, ${node.y.toFixed(2)}) - Info: "TODO"`)
      .join("\n");
    const edgesInfo = Array.from(this.edges.values())
      .map((edge) => `Edge: ${edge.source} -> ${edge.target} (Weight: ${edge.info})`)
      .join("\n");
    return `Graph Overview:\nNodes:\n${nodesInfo}\n\nEdges:\n${edgesInfo}`;
  }
}

/**
 * 创建一个默认节点。
 * @param {string} info - 节点的描述信息。
 * @returns {Node} 默认节点实例。
 */
export function createDefaultNode(info: string): Node {
  return {
    id: "0",
    x: Math.random() * 500,
    y: Math.random() * 500,
    vx: 0,
    vy: 0,
  };
}

/**
 * 创建一个默认边。
 * @param {number} sourceId - 边的起点节点 ID。
 * @param {number} targetId - 边的终点节点 ID。
 * @param {number} [weight=1] - 边的权重，默认为 1。
 * @returns {Edge} 默认边实例。
 */
export function createDefaultEdge(sourceId: string, targetId: string, weight: string = "1"): Edge {
  return {
    id: Graph.getEdgeId(sourceId, targetId),
    source: sourceId,
    target: targetId,
    info: weight,
  };
}
