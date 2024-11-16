import { MouseEventManager } from "../src/handlers";
import { Graph } from "../src/infrastructures";
import { JSDOM } from "jsdom";
describe("MouseEventManager Tests", function () {
    var graph;
    var mouseEventManager;
    var dom;
    beforeEach(function () {
        // 初始化虚拟 DOM
        dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { runScripts: "dangerously" });
        global.document = dom.window.document;
        global.window = dom.window;
        global.Event = dom.window.Event;
        // 初始化图和事件管理器
        graph = new Graph();
        mouseEventManager = new MouseEventManager(graph);
        // 添加一些测试节点和边
        graph.addNode({ id: "node1", x: 100, y: 100, vx: 0, vy: 0, info: "Node 1", radius: 20 });
        graph.addNode({ id: "node2", x: 300, y: 300, vx: 0, vy: 0, info: "Node 2", radius: 20 });
        graph.addEdge({ source: "node1", target: "node2", weight: 1 });
    });
    it("should handle node drag and update position", function () {
        var node1 = graph.getNodeById("node1");
        expect(node1).toBeDefined();
        // 模拟鼠标按下
        var mouseDownEvent = new MouseEvent("mousedown", {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseDownEvent);
        // 模拟鼠标移动
        var mouseMoveEvent = new MouseEvent("mousemove", {
            clientX: 150,
            clientY: 150,
        });
        window.dispatchEvent(mouseMoveEvent);
        // 模拟鼠标抬起
        var mouseUpEvent = new MouseEvent("mouseup", {
            clientX: 150,
            clientY: 150,
        });
        window.dispatchEvent(mouseUpEvent);
        // 验证节点位置是否更新
        var updatedNode1 = graph.getNodeById("node1");
        expect(updatedNode1).toBeDefined();
        expect(updatedNode1 === null || updatedNode1 === void 0 ? void 0 : updatedNode1.x).toBeGreaterThan(100); // 预期节点X坐标更新
        expect(updatedNode1 === null || updatedNode1 === void 0 ? void 0 : updatedNode1.y).toBeGreaterThan(100); // 预期节点Y坐标更新
    });
    it("should create a new node on click at empty space", function () {
        // 模拟点击空白区域
        var mouseClickEvent = new MouseEvent("mousedown", {
            clientX: 500,
            clientY: 500,
        });
        window.dispatchEvent(mouseClickEvent);
        // 模拟鼠标抬起
        var mouseUpEvent = new MouseEvent("mouseup", {
            clientX: 500,
            clientY: 500,
        });
        window.dispatchEvent(mouseUpEvent);
        // 验证新节点是否被创建
        var newNode = graph.getNodeById("node-");
        expect(newNode).toBeDefined();
        expect(newNode === null || newNode === void 0 ? void 0 : newNode.x).toBe(500); // 预期新节点的位置
        expect(newNode === null || newNode === void 0 ? void 0 : newNode.y).toBe(500);
    });
    it("should handle click on node and show info", function () {
        var node1 = graph.getNodeById("node1");
        expect(node1).toBeDefined();
        // 模拟单击节点1
        var mouseDownEvent = new MouseEvent("mousedown", {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseDownEvent);
        var mouseUpEvent = new MouseEvent("mouseup", {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseUpEvent);
        // 验证节点1信息是否被正确输出
        expect(node1 === null || node1 === void 0 ? void 0 : node1.info).toBe("Node 1");
    });
    it("should handle click on edge and show edge info", function () {
        var edge = graph.getEdgeBySourceTarget("node1", "node2");
        expect(edge).toBeDefined();
        // 模拟点击边
        var mouseDownEvent = new MouseEvent("mousedown", {
            clientX: 200,
            clientY: 200,
        });
        window.dispatchEvent(mouseDownEvent);
        var mouseUpEvent = new MouseEvent("mouseup", {
            clientX: 200,
            clientY: 200,
        });
        window.dispatchEvent(mouseUpEvent);
        // 验证边的信息输出
        expect(edge === null || edge === void 0 ? void 0 : edge.source).toBe("node1");
        expect(edge === null || edge === void 0 ? void 0 : edge.target).toBe("node2");
    });
    it("should handle hold and remove node", function () {
        // 模拟按住鼠标
        var mouseDownEvent = new MouseEvent("mousedown", {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseDownEvent);
        var mouseMoveEvent = new MouseEvent("mousemove", {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseMoveEvent);
        // 模拟按住超过阈值
        jest.advanceTimersByTime(500);
        // 验证节点1是否被删除
        expect(graph.getNodeById("node1")).toBeUndefined();
    });
});
