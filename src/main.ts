import { Graph, createDefaultNode, createDefaultEdge } from "./graph.js";
import { GraphController } from "./controller.js";
import { c } from "vite/dist/node/types.d-aGj9QkWt.js";

// 初始化图和 SVG 渲染

const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");
if (!svg) throw new Error("SVG element with id 'graphCanvas' not found.");
const controller: GraphController = new GraphController(svg);

// 添加测试节点和边
const nodeId1 = controller.addNode(createDefaultNode("Node 1"));
const nodeId2 = controller.addNode(createDefaultNode("Node 2"));
controller.addEdge(createDefaultEdge(nodeId1, nodeId2));
