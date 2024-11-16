import { Graph, createDefaultNode, createDefaultEdge } from "../../dist/infrastructures.js";
import { MouseEventManager } from "../../dist/handlers.js";

// 初始化图和 SVG 渲染
const graph = new Graph();
const svg = document.querySelector("#graphCanvas");

// 添加测试节点和边
graph.addNode(createDefaultNode("node1", "Node 1"));
graph.addNode(createDefaultNode("node2", "Node 2"));
graph.addEdge(createDefaultEdge("node1", "node2"));

// 渲染函数
function renderGraph() {
  // 清空 SVG
  svg.innerHTML = "";

  // 渲染边
  graph.getEdges().forEach((edge) => {
    const source = graph.getNodeById(edge.source);
    const target = graph.getNodeById(edge.target);
    if (source && target) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", source.x);
      line.setAttribute("y1", source.y);
      line.setAttribute("x2", target.x);
      line.setAttribute("y2", target.y);
      line.classList.add("edge");
      svg.appendChild(line);
    }
  });

  // 渲染节点
  graph.getNodes().forEach((node) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", node.radius);
    circle.setAttribute("id", node.id);
    circle.classList.add("node");
    svg.appendChild(circle);
  });
}

// 初次渲染
renderGraph();

// 添加事件管理器
const mouseEventManager = new MouseEventManager(graph, svg);

// 给 SVG 添加事件监听
svg.addEventListener("mousedown", (e) => {
  const target = e.target;
  if (target.tagName === "circle") {
    mouseEventManager.dragHandler.onDragStart(e, target.getAttribute("id"));
  } else {
    mouseEventManager.clickHandler.onClickStart(e);
  }
});

svg.addEventListener("mousemove", (e) => {
  mouseEventManager.dragHandler.onDrag(e);
  mouseEventManager.holdHandler.onHoldMove(e);
  renderGraph();
});

svg.addEventListener("mouseup", (e) => {
  mouseEventManager.dragHandler.onDragEnd(e);
  mouseEventManager.clickHandler.onClickEnd(e);
  mouseEventManager.holdHandler.onHoldEnd(e);
  renderGraph();
});

// 动态更新图上的元素
setInterval(renderGraph, 100);
