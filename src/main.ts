import { Graph, createDefaultNode, createDefaultEdge } from "./graph.js";
import { MouseEventManager } from "./event_manager.js";

// 初始化图和 SVG 渲染
const graph: Graph = new Graph();
const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");

if (!svg) {
  throw new Error("SVG element with id 'graphCanvas' not found.");
} else {
  // 添加测试节点和边
  graph.addNode(createDefaultNode("node1", "Node 1"));
  graph.addNode(createDefaultNode("node2", "Node 2"));
  graph.addEdge(createDefaultEdge("node1", "node2"));

  // 渲染函数
  function renderGraph(): void {
    // 清空 SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 渲染边
    graph.getEdges().forEach((edge) => {
      const source = graph.getNodeById(edge.source);
      const target = graph.getNodeById(edge.target);
      if (source && target) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", source.x.toString());
        line.setAttribute("y1", source.y.toString());
        line.setAttribute("x2", target.x.toString());
        line.setAttribute("y2", target.y.toString());
        line.classList.add("edge");
        svg.appendChild(line);
      }
    });

    // 渲染节点
    graph.getNodes().forEach((node) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x.toString());
      circle.setAttribute("cy", node.y.toString());
      circle.setAttribute("r", node.radius.toString());
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
  svg.addEventListener("mousedown", (event: MouseEvent) => {
    const target = event.target as SVGElement;
    if (target.tagName === "circle") {
      const nodeId = target.getAttribute("id");
      if (nodeId) {
        mouseEventManager.dragHandler.onDragStart(event, nodeId);
      }
    } else {
      mouseEventManager.clickHandler.onClickStart(event);
    }
  });

  svg.addEventListener("mousemove", (event: MouseEvent) => {
    mouseEventManager.dragHandler.onDragging(event);
    mouseEventManager.holdHandler.onHolding(event);
    renderGraph();
  });

  svg.addEventListener("mouseup", (event: MouseEvent) => {
    mouseEventManager.dragHandler.onDragEnd(event);
    mouseEventManager.clickHandler.onClick(event);
    mouseEventManager.holdHandler.onHoldEnd(event);
    renderGraph();
  });

  // 动态更新图上的元素
  setInterval(renderGraph, 100);
}
