"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
exports.createDefaultNode = createDefaultNode;
exports.createDefaultEdge = createDefaultEdge;
// 定义常量
const NODE_DEFAULT_RADIUS = 20;
// Graph类用于管理图数据
class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Set();
    }
    // 添加节点
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    // 移除节点
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        // 也需要移除与该节点相关的边
        this.edges.forEach((edge) => {
            if (edge.source === nodeId || edge.target === nodeId) {
                this.edges.delete(edge);
            }
        });
    }
    // 添加边
    addEdge(edge) {
        this.edges.add(edge);
    }
    // 移除边
    removeEdge(edge) {
        this.edges.delete(edge);
    }
    // 获取所有节点
    getNodes() {
        return Array.from(this.nodes.values());
    }
    // 获取所有边
    getEdges() {
        return Array.from(this.edges);
    }
    // 根据ID获取节点
    getNodeById(id) {
        return this.nodes.get(id);
    }
    getEdgeBySourceTarget(source, target) {
        for (let edge of this.edges) {
            if (edge.source === source && edge.target === target) {
                return edge;
            }
        }
        return undefined;
    }
    // 获取相连的节点
    getNeighbors(nodeId) {
        const neighbors = [];
        this.edges.forEach((edge) => {
            if (edge.source === nodeId) {
                const targetNode = this.nodes.get(edge.target);
                if (targetNode)
                    neighbors.push(targetNode);
            }
            if (edge.target === nodeId) {
                const sourceNode = this.nodes.get(edge.source);
                if (sourceNode)
                    neighbors.push(sourceNode);
            }
        });
        return neighbors;
    }
    // 更新节点的位置
    updateNodePosition(nodeId, x, y) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.x = x;
            node.y = y;
        }
    }
}
exports.Graph = Graph;
// 创建一个默认节点实例
function createDefaultNode(id, info) {
    return {
        id,
        x: Math.random() * 500, // 随机位置
        y: Math.random() * 500,
        vx: 0,
        vy: 0,
        info,
        radius: NODE_DEFAULT_RADIUS,
    };
}
// 创建一个默认边实例
function createDefaultEdge(source, target, weight = 1) {
    return { source, target, weight };
}
