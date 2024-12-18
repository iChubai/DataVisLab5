import * as d3 from "d3";
import { Context } from "../Context";
import { GraphEventManager } from "./Basic/EventManager";
import { Graph } from "./Basic/Graph";
import { CanvasEventManager } from "./Renderer/EventManager";
import { CanvasEventAnalyst } from "./Renderer/EventAnalyst";
import { ForceSimulator } from "./Renderer/Simulator";

export class GraphContext {
  private svg: d3.Selection<any, any, any, any>;
  private g: d3.Selection<any, any, any, any>;

  private graph: Graph;

  private graphEventManager: GraphEventManager;
  private canvasEventManager: CanvasEventManager;
  private canvasEventAnalyst: CanvasEventAnalyst;

  private simulator: ForceSimulator | null;

  constructor(
    private ctx: Context,
    private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    private projection: d3.GeoProjection
  ) {
    this.svg = d3.select("svg");
    this.g = this.svg.select("g");

    this.graphEventManager = new GraphEventManager();
    this.canvasEventManager = new CanvasEventManager(this.svg.node());

    this.graph = new Graph(this.graphEventManager, this.g.node());

    this.canvasEventAnalyst = new CanvasEventAnalyst(
      this.canvasEventManager,
      this.graph,
      this.g.node()
    );

    this.simulator = null;
  }

  private loadNodes(): void {
    const positionData = this.ctx.data.nodes();
    Object.entries(positionData).forEach(([name, coordinates]: [string, any]) => {
      // 将原始坐标应用投影和缩放：
      coordinates = coordinates["geo_info"];
      const [x, y] = this.projection([coordinates[0], coordinates[1]])!;
      const node = {
        _id: name,
        name,
        x,
        y,
        vx: 0,
        vy: 0,
      };
      this.graph.addNode(node);
    });
  }

  private loadEdges(model: "distance" | "time"): void {
    Promise.resolve(this.ctx.data.adjacencyTable()).then((data) => {
      // 哦草了，不要问我为什么要把这里写成异步的。不这样写会有很奇怪的bug，天哪。不信你可以试试用下面注释里的内容跑一下。
      // const data = this.ctx.data.adjacencyTable();
      Object.entries(data).forEach(([sourceId, value]: [string, any]) => {
        Object.entries(value).forEach(([targetId, target]: [string, any]) => {
          let length;
          if (model === "distance") {
            length = target[0];
          } else {
            length = target[1];
          }
          const edgeId = Graph.getEdgeId(sourceId, targetId);
          const edge = {
            _id: edgeId,
            name: edgeId,
            source: sourceId,
            target: targetId,
            length: length,
          };
          this.graph.addEdge(edge);
        });
      });
    });
    console.log(this.graph.getEdges());
  }

  public clear(): void {
    this.canvasEventAnalyst.deactivate();

    this.graphEventManager.clear();
    this.canvasEventManager.clear();

    this.simulator = null;
    this.graph.clear();

    this.g.selectAll("*").remove();
  }

  public init(model: "distance" | "time"): void {
    this.svg.on("click", () => {});

    this.loadNodes();
    this.loadEdges(model);
    this.simulator = new ForceSimulator(this.graph, this.g, this.canvasEventManager);

    this.graph.registerCallbacks(this.canvasEventManager);
    this.simulator.registerCallbacks(this.graphEventManager);

    this.canvasEventAnalyst.activate();
  }

  public render(): void {
    this.svg.call(this.zoom as any);
    this.svg.call(this.zoom.transform, d3.zoomTransform(this.svg.node()));
  }
}
