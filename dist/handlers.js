import * as d3 from "d3";
// 常量
const CLICK_THRESHOLD = 200; // 单击阈值（毫秒）
const DRAG_THRESHOLD = 5; // 拖拽阈值（像素）
const FORCE_MULTIPLIER = 0.1; // 力的系数，用于调节拖拽的强度
// 定义拖拽处理器
export class DragHandler {
    constructor(graph, container) {
        this.draggingNodeId = null;
        this.initialPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.graph = graph;
        this.container = container;
    }
    // 开始拖拽
    onDragStart(event, nodeId) {
        this.draggingNodeId = nodeId;
        const node = this.graph.getNodeById(nodeId);
        if (node) {
            this.initialPosition = { x: node.x, y: node.y };
        }
        this.isDragging = true;
    }
    // 拖拽过程中
    onDrag(event) {
        if (this.isDragging && this.draggingNodeId) {
            const node = this.graph.getNodeById(this.draggingNodeId);
            if (node) {
                const [x, y] = d3.pointer(event, this.container);
                const dx = x - this.initialPosition.x;
                const dy = y - this.initialPosition.y;
                const forceX = dx * FORCE_MULTIPLIER;
                const forceY = dy * FORCE_MULTIPLIER;
                node.vx += forceX; // 更新速度
                node.vy += forceY;
                node.x += node.vx; // 更新位置
                node.y += node.vy;
                this.graph.updateNodePosition(this.draggingNodeId, node.x, node.y);
            }
        }
    }
    // 结束拖拽
    onDragEnd(event) {
        if (this.isDragging && this.draggingNodeId) {
            const targetNode = this.findNodeUnderCursor(event);
            if (targetNode && targetNode.id !== this.draggingNodeId) {
                const newEdge = { source: this.draggingNodeId, target: targetNode.id, weight: 1 };
                this.graph.addEdge(newEdge);
            }
        }
        this.isDragging = false;
        this.draggingNodeId = null;
    }
    findNodeUnderCursor(event) {
        const nodes = this.graph.getNodes();
        const [x, y] = d3.pointer(event, this.container);
        for (let node of nodes) {
            const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
            if (distance < node.radius) {
                return node;
            }
        }
        return null;
    }
}
// 定义单击处理器
export class ClickHandler {
    constructor(graph, container) {
        this.clickStartTime = 0;
        this.graph = graph;
        this.container = container;
    }
    onClickStart(event) {
        this.clickStartTime = Date.now();
    }
    onClickEnd(event) {
        const clickDuration = Date.now() - this.clickStartTime;
        if (clickDuration < CLICK_THRESHOLD) {
            this.handleSingleClick(event);
        }
    }
    handleSingleClick(event) {
        const node = this.findNodeUnderCursor(event);
        if (node) {
            console.log(`Node clicked: ${node.info}`);
            // TODO: 显示节点信息框
        }
        else {
            const edge = this.findEdgeUnderCursor(event);
            if (edge) {
                console.log(`Edge clicked: from ${edge.source} to ${edge.target}`);
                // TODO: 显示边信息框
            }
            else {
                const newNode = this.createNode(event);
                this.graph.addNode(newNode);
                console.log(`New node created: ${newNode.id}`);
            }
        }
    }
    findNodeUnderCursor(event) {
        const nodes = this.graph.getNodes();
        const [x, y] = d3.pointer(event, this.container);
        for (let node of nodes) {
            const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
            if (distance < node.radius) {
                return node;
            }
        }
        return null;
    }
    findEdgeUnderCursor(event) {
        const edges = this.graph.getEdges();
        const [x, y] = d3.pointer(event, this.container);
        for (let edge of edges) {
            const sourceNode = this.graph.getNodeById(edge.source);
            const targetNode = this.graph.getNodeById(edge.target);
            if (sourceNode && targetNode) {
                const midpointX = (sourceNode.x + targetNode.x) / 2;
                const midpointY = (sourceNode.y + targetNode.y) / 2;
                const distance = Math.sqrt(Math.pow(midpointX - x, 2) + Math.pow(midpointY - y, 2));
                if (distance < 5) {
                    return edge;
                }
            }
        }
        return null;
    }
    createNode(event) {
        const nodeId = `node-${Date.now()}`;
        const [x, y] = d3.pointer(event, this.container);
        return {
            id: nodeId,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            info: `Node created at ${nodeId}`,
            radius: 20,
        };
    }
}
// 定义按住处理器
export class HoldHandler {
    constructor(graph, container) {
        this.holdStartTime = 0;
        this.isHolding = false;
        this.graph = graph;
        this.container = container;
    }
    onHoldStart(event) {
        this.holdStartTime = Date.now();
    }
    onHoldMove(event) {
        if (Date.now() - this.holdStartTime > CLICK_THRESHOLD && !this.isHolding) {
            this.isHolding = true;
            this.handleHold(event);
        }
    }
    onHoldEnd(event) {
        this.isHolding = false;
    }
    handleHold(event) {
        const node = this.findNodeUnderCursor(event);
        if (node) {
            this.graph.removeNode(node.id);
            console.log(`Node removed: ${node.id}`);
        }
        const edge = this.findEdgeUnderCursor(event);
        if (edge) {
            this.graph.removeEdge(edge);
            console.log(`Edge removed: from ${edge.source} to ${edge.target}`);
        }
    }
    findNodeUnderCursor(event) {
        const nodes = this.graph.getNodes();
        const [x, y] = d3.pointer(event, this.container);
        for (let node of nodes) {
            const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
            if (distance < node.radius) {
                return node;
            }
        }
        return null;
    }
    findEdgeUnderCursor(event) {
        const edges = this.graph.getEdges();
        const [x, y] = d3.pointer(event, this.container);
        for (let edge of edges) {
            const sourceNode = this.graph.getNodeById(edge.source);
            const targetNode = this.graph.getNodeById(edge.target);
            if (sourceNode && targetNode) {
                const midpointX = (sourceNode.x + targetNode.x) / 2;
                const midpointY = (sourceNode.y + targetNode.y) / 2;
                const distance = Math.sqrt(Math.pow(midpointX - x, 2) + Math.pow(midpointY - y, 2));
                if (distance < 5) {
                    return edge;
                }
            }
        }
        return null;
    }
}
// 统一鼠标事件管理器
export class MouseEventManager {
    constructor(graph, container) {
        this.graph = graph;
        this.container = container;
        this.dragHandler = new DragHandler(graph, container);
        this.clickHandler = new ClickHandler(graph, container);
        this.holdHandler = new HoldHandler(graph, container);
        this.initializeEvents();
    }
    initializeEvents() {
        window.addEventListener("mousedown", (e) => this.onMouseDown(e));
        window.addEventListener("mousemove", (e) => this.onMouseMove(e));
        window.addEventListener("mouseup", (e) => this.onMouseUp(e));
        window.addEventListener("mouseout", (e) => this.onMouseOut(e));
    }
    onMouseDown(event) {
        this.clickHandler.onClickStart(event);
        this.dragHandler.onDragStart(event, "someNodeId"); // 假定拖拽的是某个节点
        this.holdHandler.onHoldStart(event);
    }
    onMouseMove(event) {
        this.dragHandler.onDrag(event);
        this.holdHandler.onHoldMove(event);
    }
    onMouseUp(event) {
        this.clickHandler.onClickEnd(event);
        this.dragHandler.onDragEnd(event);
        this.holdHandler.onHoldEnd(event);
    }
    onMouseOut(event) {
        // 处理鼠标离开窗口的情况
        this.dragHandler.onDragEnd(event);
        this.holdHandler.onHoldEnd(event);
    }
}
