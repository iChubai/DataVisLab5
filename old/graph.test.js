import { Graph, createDefaultNode, createDefaultEdge } from "../src/infrastructures";
describe("Graph Class Tests", function () {
    var graph;
    beforeEach(function () {
        graph = new Graph();
    });
    test("should add a node", function () {
        var node = createDefaultNode("node1", "Node 1 Info");
        graph.addNode(node);
        var retrievedNode = graph.getNodeById("node1");
        expect(retrievedNode).toEqual(node);
    });
    test("should remove a node", function () {
        var node = createDefaultNode("node1", "Node 1 Info");
        graph.addNode(node);
        graph.removeNode("node1");
        var retrievedNode = graph.getNodeById("node1");
        expect(retrievedNode).toBeUndefined();
    });
    test("should add an edge", function () {
        var node1 = createDefaultNode("node1", "Node 1 Info");
        var node2 = createDefaultNode("node2", "Node 2 Info");
        graph.addNode(node1);
        graph.addNode(node2);
        var edge = createDefaultEdge("node1", "node2");
        graph.addEdge(edge);
        var retrievedEdges = graph.getEdges();
        expect(retrievedEdges).toContain(edge);
    });
    test("should remove an edge", function () {
        var node1 = createDefaultNode("node1", "Node 1 Info");
        var node2 = createDefaultNode("node2", "Node 2 Info");
        graph.addNode(node1);
        graph.addNode(node2);
        var edge = createDefaultEdge("node1", "node2");
        graph.addEdge(edge);
        graph.removeEdge(edge);
        var retrievedEdges = graph.getEdges();
        expect(retrievedEdges).not.toContain(edge);
    });
    test("should update node position", function () {
        var node = createDefaultNode("node1", "Node 1 Info");
        graph.addNode(node);
        graph.updateNodePosition("node1", 100, 200);
        var updatedNode = graph.getNodeById("node1");
        expect(updatedNode === null || updatedNode === void 0 ? void 0 : updatedNode.x).toBe(100);
        expect(updatedNode === null || updatedNode === void 0 ? void 0 : updatedNode.y).toBe(200);
    });
});
