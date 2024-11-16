// 定义常量
const NODE_DEFAULT_RADIUS = 20;

// 定义节点接口
export interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  info: string;
  radius: number; // 节点半径
}

// 定义边接口
export interface Edge {
  source: number;
  target: number;
  info: number;
}

// Graph类用于管理图数据
export class Graph {
  private nodes: Map<number, Node>;
  private edges: Map<string, Edge>; // key: "source-target"
  private adjacencyList: Map<number, { inEdges: Set<number>; outEdges: Set<number> }>;
  private nodeIndex: number;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.nodeIndex = 0;
  }

  // 添加节点
  addNode(node: Node): number {
    node.id = this.nodeIndex;
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, { inEdges: new Set(), outEdges: new Set() });
    this.nodeIndex++;
    return node.id;
  }

  // 移除节点
  removeNode(nodeId: number): void {
    if (!this.nodes.has(nodeId)) return;

    // // 移除所有相关边
    // const adj = this.adjacencyList.get(nodeId)!;
    // [...adj.inEdges, ...adj.outEdges].forEach((neighborId) => {
    //   this.removeEdge({ source: neighborId, target: nodeId, info: 0 });
    // });

    // 如果存在相关边，则不移除节点，并产生warning
    if (this.hasNeighbor(nodeId)) {
      console.warn(`Node ${nodeId} has related edges, cannot remove it.`); // FIXME： 不一定要console.warn
      return;
    }

    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
  }

  // 添加边
  addEdge(edge: Edge): void {
    const key = `${edge.source}-${edge.target}`;
    if (this.edges.has(key)) return;

    this.edges.set(key, edge);

    this.adjacencyList.get(edge.source)!.outEdges.add(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.add(edge.source);
  }

  // 移除边
  removeEdge(edge: Edge): void {
    const key = `${edge.source}-${edge.target}`;
    if (!this.edges.has(key)) return;

    this.edges.delete(key);
    this.adjacencyList.get(edge.source)!.outEdges.delete(edge.target);
    this.adjacencyList.get(edge.target)!.inEdges.delete(edge.source);
  }

  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  getNodeById(nodeId: number): Node | undefined {
    return this.nodes.get(nodeId);
  }

  // 判断节点是否存在
  hasNode(nodeId: number): boolean {
    return this.nodes.has(nodeId);
  }

  // 判断边是否存在
  hasEdge(source: number, target: number): boolean {
    return this.edges.has(`${source}-${target}`);
  }

  // 获取所有相连的source/target节点
  getSourceNodes(nodeId: number): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.inEdges)
      .map((sourceId) => this.nodes.get(sourceId)!)
      .filter(Boolean);
  }

  getTargetNodes(nodeId: number): Node[] {
    return Array.from(this.adjacencyList.get(nodeId)!.outEdges)
      .map((targetId) => this.nodes.get(targetId)!)
      .filter(Boolean);
  }

  // 获取所有相连的source/target边
  getSourceEdges(nodeId: number): Edge[] {
    return Array.from(this.adjacencyList.get(nodeId)!.inEdges)
      .map((sourceId) => this.edges.get(`${sourceId}-${nodeId}`)!)
      .filter(Boolean);
  }

  getTargetEdges(nodeId: number): Edge[] {
    return Array.from(this.adjacencyList.get(nodeId)!.outEdges)
      .map((targetId) => this.edges.get(`${nodeId}-${targetId}`)!)
      .filter(Boolean);
  }

  hasSourceNode(nodeId: number): boolean {
    return this.adjacencyList.get(nodeId)!.inEdges.size > 0;
  }

  hasTargetNode(nodeId: number): boolean {
    return this.adjacencyList.get(nodeId)!.outEdges.size > 0;
  }

  hasNeighbor(nodeId: number): boolean {
    return (
      this.adjacencyList.get(nodeId)!.inEdges.size > 0 ||
      this.adjacencyList.get(nodeId)!.outEdges.size > 0
    );
  }

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

// 创建一个默认节点实例
export function createDefaultNode(info: string): Node {
  return {
    id: 0,
    x: Math.random() * 500, // 随机位置
    y: Math.random() * 500,
    vx: 0,
    vy: 0,
    info,
    radius: NODE_DEFAULT_RADIUS,
  };
}

// 创建一个默认边实例
export function createDefaultEdge(sourceId: number, targetId: number, weight: number = 1): Edge {
  return { source: sourceId, target: targetId, info: weight };
}
