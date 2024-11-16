import { Graph, createDefaultNode, createDefaultEdge } from "../src/infrastructures";

describe("Graph Class Tests", () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph();
  });

  test("should add a node", () => {
    const node = createDefaultNode("node1", "Node 1 Info");
    graph.addNode(node);

    const retrievedNode = graph.getNodeById("node1");
    expect(retrievedNode).toEqual(node);
  });

  test("should remove a node", () => {
    const node = createDefaultNode("node1", "Node 1 Info");
    graph.addNode(node);

    graph.removeNode("node1");
    const retrievedNode = graph.getNodeById("node1");
    expect(retrievedNode).toBeUndefined();
  });

  test("should add an edge", () => {
    const node1 = createDefaultNode("node1", "Node 1 Info");
    const node2 = createDefaultNode("node2", "Node 2 Info");
    graph.addNode(node1);
    graph.addNode(node2);

    const edge = createDefaultEdge("node1", "node2");
    graph.addEdge(edge);

    const retrievedEdges = graph.getEdges();
    expect(retrievedEdges).toContain(edge);
  });

  test("should remove an edge", () => {
    const node1 = createDefaultNode("node1", "Node 1 Info");
    const node2 = createDefaultNode("node2", "Node 2 Info");
    graph.addNode(node1);
    graph.addNode(node2);

    const edge = createDefaultEdge("node1", "node2");
    graph.addEdge(edge);

    graph.removeEdge(edge);
    const retrievedEdges = graph.getEdges();
    expect(retrievedEdges).not.toContain(edge);
  });

  test("should update node position", () => {
    const node = createDefaultNode("node1", "Node 1 Info");
    graph.addNode(node);

    graph.updateNodePosition("node1", 100, 200);
    const updatedNode = graph.getNodeById("node1");
    expect(updatedNode?.x).toBe(100);
    expect(updatedNode?.y).toBe(200);
  });
});
