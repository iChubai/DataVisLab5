import * as d3 from "d3";
import { GraphEventManager } from "../../core/Graph/EventManager";
import { ParameterManager } from "../../core/ParameterManager";

export class SpikeChartRenderer {
  private params: ParameterManager;
  private spikeData: { timestamp: number; count: number }[] = [];
  private nodeIds: string[] = []; // 用来存储所有节点的ID
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private margin: { top: number; right: number; bottom: number; left: number };
  private width: number;
  private height: number;
  private xScale: d3.ScaleTime<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private lines: d3.Line<{ timestamp: number; count: number }>[];
  private paths: d3.Selection<SVGPathElement, unknown, any, any>[];
  private xAxisGroup: d3.Selection<SVGGElement, unknown, any, any>;
  private yAxisGroup: d3.Selection<SVGGElement, unknown, any, any>;

  private MAX_DATA_LENGTH: number = 100;
  private TIME_WINDOWS: number[] = [200, 2000]; // 设置不同的时间窗口
  private spikeCountRollingWindows: { [window: number]: { timestamp: number; count: number }[] } =
    {};

  constructor(params: ParameterManager, svgElement: SVGSVGElement) {
    this.params = params;
    this.svg = d3.select(svgElement);

    this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
    // 获取SVG容器的宽高
    this.width =
      (this.svg.node()?.getBoundingClientRect().width ?? 600) -
      this.margin.left -
      this.margin.right;
    this.height =
      (this.svg.node()?.getBoundingClientRect().height ?? 400) -
      this.margin.top -
      this.margin.bottom;

    // 初始化比例尺
    this.xScale = d3.scaleTime().range([0, this.width]);
    this.yScale = d3.scaleLinear().range([this.height, 0]);

    // 定义平滑曲线数组
    this.lines = this.TIME_WINDOWS.map(() =>
      d3
        .line<{ timestamp: number; count: number }>()
        .x((d) => this.xScale(d.timestamp))
        .y((d) => this.yScale(d.count))
        .curve(d3.curveBasis)
    );

    // 初始化路径数组
    this.paths = this.TIME_WINDOWS.map((_, index) =>
      this.svg
        .append("path")
        .attr("class", `spike-line-${this.TIME_WINDOWS[index]}`)
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[index % 10]) // 使用不同的颜色
        .attr("stroke-width", 2)
    );

    // 初始化坐标轴容器
    this.xAxisGroup = this.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${this.height})`); // 使用 margin.bottom

    this.yAxisGroup = this.svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${this.margin.left}, 0)`); // 使用 margin.left

    // 初始坐标轴
    this.setupAxes();
  }

  private setupAxes() {
    this.xScale.domain([Date.now() - Math.max(...this.TIME_WINDOWS), Date.now()]);
    this.yScale.domain([0, 1]); // 假设最大 spike 数为 1，实际可以根据需求调整

    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    this.xAxisGroup.call(xAxis);
    this.yAxisGroup.call(yAxis);
  }

  registerCallbacks(graphEventManager: GraphEventManager) {
    // 监听节点添加事件
    graphEventManager.on("NodeAdded", (nodeId) => {
      this.nodeIds.push(nodeId); // 将新节点添加到节点ID数组中
      this.clear(); // 清空图表
      this.start(Date.now()); // 重新开始记录
    });

    // 监听节点删除事件
    graphEventManager.on("NodeRemoved", (nodeId) => {
      this.nodeIds = this.nodeIds.filter((id) => id !== nodeId); // 从节点ID数组中移除已删除的节点
      this.clear(); // 清空图表
      this.start(Date.now()); // 重新开始记录
    });
  }

  public update(currentTime: number) {
    if (this.nodeIds.length === 0) return; // 如果没有节点，不更新

    let spikeCount = 0;

    // 遍历当前的节点ID并统计 spike 状态
    this.nodeIds.forEach((nodeId) => {
      if (this.params.get(nodeId, "isSpiking") && !this.params.get(nodeId, "isInput")) {
        spikeCount++;
      }
    });

    // 将数据存入 spikeData
    this.spikeData.push({ timestamp: currentTime, count: spikeCount });
    if (this.spikeData.length > this.MAX_DATA_LENGTH) {
      this.spikeData.shift(); // 删除最旧的数据
    }

    // 更新 rolling window 数据
    this.updateRollingWindows(currentTime);

    // 更新图表
    this.updateChart();
  }

  private updateRollingWindows(currentTime: number) {
    this.TIME_WINDOWS.forEach((windowSize) => {
      let totalSpikes = 0;
      const windowStart = currentTime - windowSize;

      // 过滤出在当前时间窗口内的数据
      this.spikeData.forEach((dataPoint) => {
        if (dataPoint.timestamp >= windowStart && dataPoint.timestamp <= currentTime) {
          totalSpikes += dataPoint.count;
        }
      });

      // 将当前时刻的 spike 总数转换为每秒的平均发放数
      const spikeRatePerSecond = totalSpikes / (windowSize / 1000); // 每秒发放数

      // 将该时刻的每秒平均发放数存入rolling window数据
      if (!this.spikeCountRollingWindows[windowSize]) {
        this.spikeCountRollingWindows[windowSize] = [];
      }
      this.spikeCountRollingWindows[windowSize].push({
        timestamp: currentTime,
        count: spikeRatePerSecond,
      });

      // 如果数组长度超出最大数据长度，移除最旧的
      if (this.spikeCountRollingWindows[windowSize].length > this.MAX_DATA_LENGTH) {
        this.spikeCountRollingWindows[windowSize].shift();
      }
    });
  }

  private updateChart() {
    // 设置新的坐标轴范围
    const allData = Object.values(this.spikeCountRollingWindows).flat();
    this.xScale.domain(d3.extent(allData, (d) => d.timestamp) as [number, number]);
    this.yScale.domain([0, d3.max(allData, (d) => d.count) || 0]);

    // 更新坐标轴
    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    this.xAxisGroup.call(xAxis);
    this.yAxisGroup.call(yAxis);

    // 使用 rolling window 数据绘制图表
    this.TIME_WINDOWS.forEach((windowSize, index) => {
      this.paths[index]
        .datum(this.spikeCountRollingWindows[windowSize])
        .attr("d", this.lines[index]);
    });

    // 绘制图例
    this.drawLegend();
  }

  private drawLegend() {
    const legendGroup = this.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20,20)");

    // 为每个时间窗口绘制一个图例
    this.TIME_WINDOWS.forEach((windowSize, index) => {
      legendGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", index * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d3.schemeCategory10[index % 10]);

      legendGroup
        .append("text")
        .attr("x", 15)
        .attr("y", index * 20 + 10)
        .attr("dy", ".35em")
        .text(`${windowSize}ms`)
        .style("font-size", "12px")
        .style("fill", "#000");
    });
  }

  public start(startTime: number): void {
    this.spikeData = [];
    this.spikeCountRollingWindows = {}; // 清空rolling windows
  }

  public clear(): void {
    this.spikeData = [];
    this.spikeCountRollingWindows = {}; // 清空rolling windows
  }
}
