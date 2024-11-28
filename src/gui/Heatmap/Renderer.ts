import * as d3 from "d3";
import { ParameterManager } from "../../core/ParameterManager";
import { GraphEventManager } from "../../core/Graph/EventManager";
import { H } from "vite/dist/node/types.d-aGj9QkWt";

// 设计一个 Heatmap 类
export class HeatmapRender {
  private itemsData: Map<string, [number, number][]>; // 存储 nodeId -> { time -> value }
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleBand<string>;

  private itemIds: string[]; // 需要绘制的节点id列表
  private paramId: string;
  private startTime: number;

  private width: number;
  private height: number;
  private margin = { top: 20, right: 20, bottom: 50, left: 50 };
  MAX_DATA_LENGTH: number = 100;

  constructor(private params: ParameterManager, private svg: SVGSVGElement) {
    this.width =
      parseInt(svg.getAttribute("width") ?? "800") - this.margin.left - this.margin.right;
    this.height =
      parseInt(svg.getAttribute("height") ?? "600") - this.margin.top - this.margin.bottom;

    this.itemsData = new Map();
    this.xScale = d3.scaleLinear().range([0, this.width]);
    this.yScale = d3.scaleBand().range([0, this.height]).padding(0.1);

    this.itemIds = [];
    this.paramId = "";
    this.startTime = 0;
  }

  registerCallbacks(graphEventManager: GraphEventManager): void {
    graphEventManager.on("NodeAdded", (nodeId) => {
      this.itemIds.push(nodeId);
      this.clear();
      this.setParam("potential").start(Date.now()); // TODO: 写一个设置显示哪个参数的方法。
    });

    graphEventManager.on("NodeRemoved", (nodeId) => {
      this.itemIds = this.itemIds.filter((id) => id !== nodeId);
      this.clear();
      this.setParam("potential").start(Date.now()); // TODO: 写一个设置显示哪个参数的方法。
    });
  }

  /**
   * 清空数据，清空画布。
   */
  public clear(): void {
    this.itemsData = new Map();
    this.itemIds.forEach((itemId) => {
      this.itemsData.set(itemId, []);
    });
    this.paramId = "";
    this.startTime = 0;
    d3.select(this.svg).selectAll("*").remove();
  }

  /**
   * 初始化方法，设置需要绘制的节点。
   * @param nodeIds 节点id列表
   * @param param   需要绘制的参数
   */
  public select(nodeIds: string[]): HeatmapRender {
    this.itemIds = nodeIds;
    nodeIds.forEach((nodeId) => {
      this.itemsData.set(nodeId, []);
    });
    return this;
  }

  public setParam(param: string): HeatmapRender {
    this.paramId = param;
    return this;
  }

  start(startTime: number): void {
    if (this.itemIds.length === 0) {
      console.warn("Please select at least an item first.");
      return;
    }
    if (this.paramId === "") {
      console.warn("Please select a parameter first.");
      return;
    }
    this.startTime = startTime;
    this.itemsData = new Map();
    this.itemIds.forEach((itemId) => {
      this.itemsData.set(itemId, []);
    });
  }

  // 更新热力图，获取当前的参数值，并更新数据
  public update(currentTime: number): void {
    if (this.itemIds.length === 0 || this.paramId === "" || this.startTime === 0) return; // 没有节点数据时不更新

    const time = currentTime - this.startTime;
    this.itemIds.forEach((itemId) => {
      const value = this.params.get(itemId, this.paramId) as number;
      const data = this.itemsData.get(itemId)
        ? this.itemsData.get(itemId)!
        : (() => {
            console.error("[HeatmapRender] Data not found", this.itemIds, this.itemsData);
            return [];
          }).call(this);
      data.push([time, value]);
      if (data.length > this.MAX_DATA_LENGTH) data.shift(); // 保持固定长度
    });

    this.draw();
  }

  private draw(): void {
    const tempData = this.itemsData.get(this.itemIds[0]);
    if (tempData === undefined) {
      console.error("[HeatmapRender] Data not found", this.itemIds, this.itemsData);
      return;
    }
    const xExtent = [tempData[0][0], tempData[0][0]];

    this.xScale.domain(d3.extent(tempData, (d) => d[0]) as [number, number]);
    this.yScale.domain(this.itemIds);

    // 颜色映射
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

    // 清除之前的内容
    d3.select(this.svg).selectAll("*").remove();
    const heatmap = d3
      .select(this.svg)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`); // 添加偏移量，预留边距

    this.itemIds.forEach((itemId) => {
      const itemData = this.itemsData.get(itemId) || [];

      // 绘制矩形
      const validItemId = `item-${itemId}`; // 给类名前加上一个前缀
      heatmap
        .selectAll(`rect.${validItemId}`)
        .data(itemData)
        .enter()
        .append("rect")
        .attr("x", (d) => this.xScale(d[0])) // 时间轴
        .attr("y", this.yScale(itemId)!) // 节点 ID
        .attr("width", (d, i) => {
          // 这里修改宽度，确保每个矩形之间有合适的间隔
          const nextD = itemData[i + 1];
          return nextD ? this.xScale(nextD[0]) - this.xScale(d[0]) : 1; // 使用相邻时间点间隔计算宽度
        }) // 每个时间点的宽度
        .attr("height", this.yScale.bandwidth()) // 高度为节点条带高度
        .attr("fill", (d) => colorScale(d[1])); // 根据值绘制颜色
    });

    // 添加X轴
    const xAxis = d3.axisBottom(this.xScale).ticks(5);
    d3.select(this.svg)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.height + this.margin.top})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(this.yScale);
    d3.select(this.svg)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`)
      .call(yAxis);
  }
}
