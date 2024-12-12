import * as d3 from "d3";
import * as topojson from "topojson-client";
import { FeatureCollection, Geometry } from "geojson";

export class MapRenderer {
  private width: number = 975;
  private height: number = 610;

  private svg: d3.Selection<any, any, any, any>;
  private g: d3.Selection<any, any, any, any>;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private projection: d3.GeoProjection;

  constructor() {
    this.svg = d3
      .select("svg")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("style", "max-width: 100%; height: auto;")
      .on("click", () => this.reset()); // 点击时重置视图

    this.g = this.svg.append("g");

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // 设置缩放比例范围
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => this.zoomed(event)); // 在缩放时调用 zoomed 函数

    // 定义地理投影，用于地图的绘制
    this.projection = d3
      .geoAlbersUsa()
      .translate([this.width / 2, this.height / 2]) // 将地图投影的中心放到SVG的中心
      .scale(this.width * 1.325);
  }

  // 重置视图
  private reset(): void {
    console.log("reset");
    const states = this.g.selectAll(".state");
    states.transition().style("fill", "rgba(0, 0, 0, 0.2)"); // 清除点击时的填充色
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform as any,
        d3.zoomIdentity, // 恢复到初始缩放状态
        d3.zoomTransform(this.svg.node() as SVGSVGElement).invert([this.width / 2, this.height / 2])
      );

    // 重置点击状态
    states.each((d: any) => {
      d.clicked = false;
    });
  }

  // 点击州时的缩放
  private clicked(event: MouseEvent, d: any, path: d3.GeoPath<any>): void {
    const states = this.g.selectAll(".state");
    console.log("clicked");
    if (d.clicked) return this.reset(); // 若当前州已被点击，则重置视图
    states.each(function (d: any) {
      d.clicked = false; // 清除其他州的点击状态
    });
    d.clicked = true;

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation(); // 阻止事件传播
    states.transition().style("fill", "rgba(0, 0, 0, 0.8)"); // 清除其他州的填充色
    if (event.currentTarget) {
      d3.select(event.currentTarget as HTMLElement)
        .transition()
        .style("fill", "rgba(0, 0, 0, 0.2)"); // 给当前点击的州填充色
    }
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform as any,
        d3.zoomIdentity
          .translate(this.width / 2, this.height / 2)
          .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / this.width, (y1 - y0) / this.height))) // 缩放到适合区域
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, this.svg.node() as SVGSVGElement) // 获取点击位置
      );
  }

  // 缩放时更新视图
  private zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    console.log("zoomed");
    const { transform } = event;
    this.g.attr("transform", transform.toString()); // 调整坐标系
    this.g.attr("stroke-width", 1 / transform.k); // 调整边界线的粗细
  }

  public render(): void {
    d3.json("./counties-albers-10m.json").then((us: any) => {
      const path = d3.geoPath();

      // 绘制县界
      this.g
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.5)
        .selectAll("path")
        .data((topojson.feature(us, us.objects.counties) as any).features)
        .join("path")
        .attr("d", path as any);

      // 绘制州界
      const states = this.g
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "#444")
        .attr("cursor", "pointer")
        .selectAll<SVGPathElement, any>("path")
        .data((topojson.feature(us, us.objects.states) as any).features)
        .join("path")
        .on("click", (event: MouseEvent, d: any) => this.clicked(event, d, path)) // 点击州时触发缩放
        .attr("d", path as any)
        .attr("fill", "rgba(0, 0, 0, 0.2)") // 设置州的默认填充色为半透明红色
        .attr("class", "state")
        .each((d: any) => {
          d.clicked = false; // 给每个州添加一个 'clicked' 属性，初始值为 false
        });

      states.append("title").text((d: any) => d.properties.name); // 显示州名

      // 绘制州与州之间的边界
      this.g
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-linejoin", "round")
        .attr("d", path(topojson.mesh(us, us.objects.states, (a: any, b: any) => a !== b)));
    });

    // 加载 GeoJSON 数据并绘制节点
    d3.json("./nodes_data.geojson").then((nodesData) => {
      // 将 GeoJSON 数据绘制到地图上
      this.g
        .append("g")
        .selectAll("circle")
        .data((nodesData as FeatureCollection).features)
        .join("circle")
        .attr("cx", (d: any) => {
          // 对GeoJSON点坐标应用投影，转换成SVG坐标
          const [x, y] = this.projection(d.geometry.coordinates)!;
          return x;
        })
        .attr("cy", (d: any) => {
          // 对GeoJSON点坐标应用投影，转换成SVG坐标
          const [x, y] = this.projection(d.geometry.coordinates)!;
          return y;
        })
        .attr("r", 5) // 设置节点大小
        .attr("fill", "red") // 设置节点颜色
        .attr("stroke", "black") // 设置节点边框颜色
        .attr("stroke-width", 1);
    });

    // 初始化缩放
    this.svg.call(this.zoom as any);
  }
}

const mapRenderer = new MapRenderer();
mapRenderer.render();
