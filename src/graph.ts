// 定义常量
const NODE_DEFAULT_RADIUS = 20; // 节点的默认半径

/**
 * 节点接口，描述节点的属性。
 */
export interface Node {
  id: number; // 节点唯一标识符
  x: number; // 节点的 x 坐标
  y: number; // 节点的 y 坐标
  vx: number; // 节点的 x 方向速度
  vy: number; // 节点的 y 方向速度
  info: string; // 节点的信息描述
  radius: number; // 节点的半径
}

/**
 * 边接口，描述边的属性。
 */
export interface Edge {
  source: number; // 边的起点节点 ID
  target: number; // 边的终点节点 ID
  info: number; // 边的权重或附加信息
}

/**
 * 图类，用于管理图的节点和边数据。
 */
export class Graph {
  private nodes: Map<number, Node>; // 存储节点的映射表
  private edges: Map<string, Edge>; // 存储边的映射表，键格式为 "source-target"
  private adjacencyList: Map<number, { inEdges: Set<number>; outEdges: Set<number> }>; // 邻接表
  private nodeIndex: number; // 节点索引计数器

  /**
   * 构造函数，初始化图的结构。
   */
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.nodeIndex = 0;
  }

  /**
   * 添加节点到图中。
   * @param {Node} node - 要添加的节点。
   * @returns {number} 返回分配给该节点的唯一 ID。
   */
  addNode(node: Node): number {
    node.id = this.nodeIndex;
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, { inEdges: new Set(), outEdges: new Set() });
    this.nodeIndex++;
    return node.id;
  }

  /**
   * 从图中移除节点。
   * @param {number} nodeId - 要移除的节点 ID。
   */
  removeNode(nodeId: number): void {
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
    const key = `${edge.source}-${edge.target}`;
    if (this.edges.has(key)) return;

    this.edges.set(key, edge);
    this.adjacencyList.get(edge.source)!.outEdges.add(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.add(edge.source);
  }

  /**
   * 从图中移除边。
   * @param {Edge} edge - 要移除的边。
   */
  removeEdge(edge: Edge): void {
    const key = `${edge.source}-${edge.target}`;
    if (!this.edges.has(key)) return;

    this.edges.delete(key);
    this.adjacencyList.get(edge.source)!.outEdges.delete(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.delete(edge.source);
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
  getNodeById(nodeId: number): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 判断节点是否存在。
   * @param {number} nodeId - 节点 ID。
   * @returns {boolean} 节点是否存在。
   */
  hasNode(nodeId: number): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * 判断边是否存在。
   * @param {number} source - 边的起点节点 ID。
   * @param {number} target - 边的终点节点 ID。
   * @returns {boolean} 边是否存在。
   */
  hasEdge(source: number, target: number): boolean {
    return this.edges.has(`${source}-${target}`);
  }

  /**
   * 获取连接到指定节点的源节点数组。
   * @param {number} nodeId - 节点 ID。
   * @returns {Node[]} 源节点数组。
   */
  getSourceNodes(nodeId: number): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.inEdges)
      .map((sourceId) => this.nodes.get(sourceId)!)
      .filter(Boolean);
  }

  /**
   * 获取从指定节点连接的目标节点数组。
   * @param {number} nodeId - 节点 ID。
   * @returns {Node[]} 目标节点数组。
   */
  getTargetNodes(nodeId: number): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.outEdges)
      .map((targetId) => this.nodes.get(targetId)!)
      .filter(Boolean);
  }

  /**
   * 检查指定节点是否有相邻的源或目标节点。
   * @param {number} nodeId - 节点 ID。
   * @returns {boolean} 是否有相邻节点。
   */
  hasNeighbor(nodeId: number): boolean {
    return (
      this.adjacencyList.get(nodeId)!.inEdges.size > 0 ||
      this.adjacencyList.get(nodeId)!.outEdges.size > 0
    );
  }

  /**
   * 获取图的字符串表示。
   * @returns {string} 图的概要信息。
   */
  toString(): string {
    const nodesInfo = Array.from(this.nodes.values())
      .map(
        (node) =>
          `Node ${node.id}: (${node.x.toFixed(2)}, ${node.y.toFixed(2)}) - Info: "${node.info}"`
      )
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
    id: 0,
    x: Math.random() * 500,
    y: Math.random() * 500,
    vx: 0,
    vy: 0,
    info,
    radius: NODE_DEFAULT_RADIUS,
  };
}

/**
 * 创建一个默认边。
 * @param {number} sourceId - 边的起点节点 ID。
 * @param {number} targetId - 边的终点节点 ID。
 * @param {number} [weight=1] - 边的权重，默认为 1。
 * @returns {Edge} 默认边实例。
 */
export function createDefaultEdge(sourceId: number, targetId: number, weight: number = 1): Edge {
  return { source: sourceId, target: targetId, info: weight };
}
