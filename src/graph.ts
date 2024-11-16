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
  private edges: Set<Edge>;
  private nodeIndex: number;

  constructor() {
    this.nodes = new Map();
    this.edges = new Set();
    this.nodeIndex = 0;
  }

  // 添加节点
  addNode(node: Node): number {
    node.id = this.nodeIndex;
    this.nodes.set(this.nodeIndex, node);
    this.nodeIndex++;
    return node.id;
  }

  // 移除节点
  removeNode(nodeId: number): void {
    this.nodes.delete(nodeId);
    // 也需要移除与该节点相关的边
    this.edges.forEach((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.edges.delete(edge);
      }
    });
  }

  // 添加边
  addEdge(edge: Edge): void {
    this.edges.add(edge);
  }

  // 移除边
  removeEdge(edge: Edge): void {
    this.edges.delete(edge);
  }

  // 获取所有节点
  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  // 获取所有边
  getEdges(): Edge[] {
    return Array.from(this.edges);
  }

  // 根据ID获取节点
  getNodeById(id: number): Node | undefined {
    return this.nodes.get(id);
  }

  getEdgeBySourceIdTarget(sourceId: number, targetId: number): Edge | undefined {
    for (let edge of this.edges) {
      if (edge.source === sourceId && edge.target === targetId) {
        return edge;
      }
    }
    return undefined;
  }

  // 获取相连的节点
  getNeighbors(nodeId: number): Node[] {
    const neighbors: Node[] = [];
    this.edges.forEach((edge) => {
      if (edge.source === nodeId) {
        const targetNode = this.nodes.get(edge.target);
        if (targetNode) neighbors.push(targetNode);
      }
      if (edge.target === nodeId) {
        const sourceIdNode = this.nodes.get(edge.source);
        if (sourceIdNode) neighbors.push(sourceIdNode);
      }
    });
    return neighbors;
  }

  // 更新节点的位置
  updateNodePosition(nodeId: number, x: number, y: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
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
