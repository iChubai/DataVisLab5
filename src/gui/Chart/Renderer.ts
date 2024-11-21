import * as d3 from "d3";

import { ParameterManager } from "../../core/ParameterManager";
import { GUIController } from "../controller";
import { MouseEventManager } from "../Canvas/Event/Manager";

export class ChartDrawer {
  // 数据存储和曲线更新
  private data: [number, number][];
  private xScale: d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private line: d3.Line<[number, number]>;

  private itemId: string;
  private paramId: string;
  private startTime: number;

  // 绘制路径的选择器
  private path: d3.Selection<SVGPathElement, unknown, any, any>;

  // 坐标轴
  private xAxis: d3.Axis<d3.NumberValue>;
  private yAxis: d3.Axis<d3.NumberValue>;
  private xAxisGroup: d3.Selection<SVGGElement, unknown, any, any>;
  private yAxisGroup: d3.Selection<SVGGElement, unknown, any, any>;

  constructor(
    private parameterManager: ParameterManager,
    private container: d3.Selection<SVGGElement, unknown, any, any>
  ) {
    this.data = [];
    this.xScale = d3.scaleLinear().domain([0, 10]).range([0, 500]); // 时间轴
    this.yScale = d3.scaleLinear().domain([0, 1]).range([400, 0]); // 电压轴
    this.line = d3
      .line()
      .x((d) => this.xScale(d[0]))
      .y((d) => this.yScale(d[1]));

    this.itemId = "";
    this.paramId = "potential"; // TODO: 写一个设置显示哪个参数的方法。
    this.startTime = 0;

    // 初始化路径
    this.path = container
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    // 初始化坐标轴
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisLeft(this.yScale);

    // 创建坐标轴容器
    this.xAxisGroup = container
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, 400)`); // 位置：底部

    this.yAxisGroup = container
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, 0)`); // 位置：左侧
  }

  /**
   * 注册回调函数，包括节点点击、边点击、背景点击等。
   * 还没想好这个模块应该归哪个模块管，所以干脆都写了，参数用哪个都行。
   * @param item
   */
  registerCallbacks(item: GUIController | MouseEventManager): void {
    item.on("NodeClicked", (event, nodeId) => {
      if (nodeId === undefined) throw new Error("this should not happen: nodeId is undefined");
      this.select(nodeId).start(Date.now());
    });
    item.on("EdgeClicked", (event, edgeId) => {
      if (edgeId === undefined) throw new Error("this should not happen: edgeId is undefined");
      this.select(edgeId).start(Date.now());
    });
    item.on("CanvasClicked", () => {
      this.itemId = "";
      this.startTime = 0;
      this.data = [];
      this.path.datum([]).attr("d", this.line);
    });
  }

  select(itemId: string): ChartDrawer {
    this.itemId = itemId;
    this.startTime = 0;
    return this;
  }

  setYParam(param: string): ChartDrawer {
    this.paramId = param;
    this.startTime = 0;
    return this;
  }

  start(startTime: number): void {
    if (this.itemId === "") {
      console.warn("Please select an item first.");
      return;
    }
    if (this.paramId === "") {
      console.warn("Please select a parameter first.");
      return;
    }
    this.startTime = startTime;

    console.log("recent data: ", this.data); // FIXME: remove this line
    this.data = [];
  }

  update(currentTime: number): void {
    if (this.itemId === "") {
      console.warn("Please select an item first.");
      return;
    }
    if (this.paramId === "") {
      console.warn("Please select a parameter first.");
      return;
    }
    if (this.startTime === 0) {
      console.warn("Please start the chart first.");
      return;
    }

    const xExtent = d3.extent(this.data, (d) => d[0]) as [number, number];
    const yExtent = d3.extent(this.data, (d) => d[1]) as [number, number];
    this.xScale.domain(xExtent);
    this.yScale.domain(yExtent);

    const time = currentTime - this.startTime;
    const potential = this.parameterManager.get(this.itemId, this.paramId) as number;
    this.data.push([time, potential]);
    // console.log("data stored: ", time, potential); // DONE: remove this line
    if (this.data.length > 100) this.data.shift(); // 保持固定长度

    // 更新图像
    this.path.datum(this.data).attr("d", this.line);
    this.xAxisGroup.call(this.xAxis);
    this.yAxisGroup.call(this.yAxis);
  }
}
