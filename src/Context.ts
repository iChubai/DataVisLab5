import { Data } from "./Data";
import { GraphContext } from "./Graph/GraphContext";
import { MapContext } from "./MapContext";
import { ParamsExplorer } from "./ParamsExplorer";
import { LeftSidePanel, RightSidePanel, TopSidePanel } from "./SidePanel";

export class Context {
  data: Data;
  private paramsExporer: ParamsExplorer;

  private mapContext: MapContext;
  private graphContext: GraphContext;

  private leftSidePanel: LeftSidePanel;
  private rightSidePanel: RightSidePanel;
  private topSidePanel: TopSidePanel;
   
  constructor() {
    this.data = new Data();
    this.paramsExporer = new ParamsExplorer(this, this.data);

    this.mapContext = new MapContext(this);
    this.graphContext = new GraphContext(this, this.mapContext.zoom, this.mapContext.projection);

    this.leftSidePanel = new LeftSidePanel();
    this.rightSidePanel = new RightSidePanel(this);
    this.topSidePanel = new TopSidePanel(this);

    this.data.load()
      .then(() => {
        this.mapContext.render();
        // 提供数据给左侧边栏的可视化
        // this.leftSidePanel.updateVisualizations(this.data.getBarData(), this.data.getPieData());
        // // 提供数据给右侧边栏的可视化
        // this.rightSidePanel.getTimeDistributionChart().render(this.data.getTraversalTimeData());
        // this.rightSidePanel.getDegreeDistributionChart().render(this.data.getDegreeDistributionData());
      })
      .catch((error) => {
        console.error("Failed to load data:", error);
        alert("数据加载失败，请稍后再试。");
      });

    window.onload = () => {
      this.leftSidePanel.init();
      this.rightSidePanel.init();
      this.topSidePanel.init();
    };
  }

  renderMap(): void {
    this.mapContext.clear();
    this.graphContext.clear();
    this.mapContext.init();
    this.mapContext.render();
  }

  renderGraph(model: "distance" | "time"): void {
    this.mapContext.clear();
    this.graphContext.clear();
    this.graphContext.init(model);
    this.graphContext.render();
  }

  exploreParams(dataCategory: string, id?: string): void {
    if (this.leftSidePanel.contentOnShow !== "params") this.leftSidePanel.changeToParamsView();
    this.paramsExporer.explore(dataCategory, id);
  }

  rerender(dataCategory: string, id: string): void {
    this.mapContext.rerender(dataCategory, id);
  }
  getTraversalTimeData(): { time: number; density: number }[] {
    return this.data.getTraversalTimeData();
  }

  getDegreeDistributionData(): { degree: number; count: number }[] {
    return this.data.getDegreeDistributionData();
  }
  /*
  适配：
  public getNearestNeighborData(nodeId: string, topN: number = 5): NearestNeighbor[] {
    const nodes = this.nodes();
    const adjacencyTable = this.adjacencyTable();
    const nodeNames = Object.keys(nodes);
    const distances: { [id: string]: number } = {};
    for (let i = 0; i < nodeNames.length; i++) {
      const sourceName = nodeNames[i];
      if (sourceName === nodeId) {
        continue;
      }
      const sourceNode = nodes[sourceName];
      const sourceGeoInfo = sourceNode.geo_info;
      if (sourceGeoInfo === undefined) {
        continue;
      }
      const distance = Graph.getDistance(sourceGeoInfo, nodes[nodeId].geo_info);
      distances[sourceName] = distance;
    }
    const nearestNeighbors: NearestNeighbor[] = [];
    const sortedDistances = Object.entries(distances).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < Math.min(topN, sortedDistances.length); i++) {
      const [id, distance] = sortedDistances[i];
      nearestNeighbors.push({ id, distance });
    }
    return nearestNeighbors;
  }
  
  getNearestNeighbors(): { id: string; distance: number }[] {
    return this.data.getNearestNeighborData(id,10);
    }*/
   getNearestNeighbors(id: string, topN: number = 5): { id: string; distance: number }[] {
    return this.data.getNearestNeighbors(id, topN);
    }
}

const ctx = new Context();
