import * as d3 from "d3";
import * as topojson from "topojson-client";
import { FeatureCollection, Geometry } from "geojson";

export class MapRenderer {
  private width: number = 975;
  private height: number = 610;

  private svg: d3.Selection<any, any, any, any>;
  private g: d3.Selection<any, any, any, any>;
  private gMap: d3.Selection<any, any, any, any>;
  private gMapProvinces: d3.Selection<any, any, any, any>;
  private gMapCounties: d3.Selection<any, any, any, any>;
  private gNodes: d3.Selection<any, any, any, any>;
  private gLines: d3.Selection<any, any, any, any>;

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
    this.gMap = this.g.append("g");
    this.gMapProvinces = this.gMap.append("g");
    this.gMapCounties = this.gMap.append("g");
    this.gLines = this.g.append("g");
    this.gNodes = this.g.append("g");

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 8]) // 设置缩放比例范围
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => this.zoomed(event)); // 在缩放时调用 zoomed 函数

    // 设置投影参数
    this.projection = d3
      .geoMercator()
      .center([100, 38]) // 设置地图的中心（可以根据数据调整）
      .scale(800) // 缩放级别（根据数据调整）
      .translate([this.width / 2, this.height / 2]); // 平移到屏幕中心
  }
  // 重置视图
  private reset(): void {
    console.log("reset");
    const provinces = this.gMap.selectAll(".province");
    provinces.transition().style("fill", "rgba(0, 0, 0, 0.2)"); // 清除点击时的填充色
    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform as any,
        d3.zoomIdentity, // 恢复到初始缩放状态
        d3.zoomTransform(this.svg.node() as SVGSVGElement).invert([this.width / 2, this.height / 2])
      );

    // 重置点击状态
    provinces.each((d: any) => {
      d.clicked = false;
    });
  }

  // 点击州时的缩放
  private clicked(event: MouseEvent, d: any, path: d3.GeoPath<any>): void {
    const provinces = this.gMap.selectAll(".province");
    console.log("clicked");
    if (d.clicked) return this.reset(); // 若当前州已被点击，则重置视图
    provinces.each(function (d: any) {
      d.clicked = false; // 清除其他州的点击状态
    });
    d.clicked = true;

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation(); // 阻止事件传播
    provinces.transition().style("fill", "rgba(0, 0, 0, 0.8)"); // 清除其他州的填充色
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

    // 应用缩放变换
    this.g.attr("transform", transform.toString());

    // 调整边界线的粗细
    this.gMap.attr("stroke-width", 1 / transform.k);

    // 调整节点大小，使其始终保持相同的视觉大小
    this.gNodes
      .selectAll("circle")
      .attr("r", 5 / transform.k)
      .attr("stroke-width", 1 / transform.k); // 这里的 5 是节点的默认半径

    // 调整线的粗细
    this.gLines.attr("stroke-width", 1 / transform.k);
  }

  public renderMap(): void {
    for (let i = 11; i <= 90; i++) {
      d3.json("./data/geometryProvince/" + i + ".json")
        .then((geoData: any) => {
          const path = d3.geoPath().projection(this.projection);

          const counties = this.gMapCounties
            .append("g")
            .attr("fill", "none")
            .attr("stroke", "#444")
            .attr("cursor", "pointer")
            .selectAll<SVGPathElement, any>("path")
            .data(
              geoData.features.filter(
                (d: any) => d.properties.name !== "昆玉市" && d.properties.name !== "静安区"
              )
            )
            .join("path")
            .attr("d", path as any)
            .attr("fill", "rgba(0, 0, 0, 0.2)")
            .attr("class", "state");

          counties.append("title").text((d: any) => d.properties.name);
        })
        .catch((error: any) => {});
    }

    d3.json("./data/geometryProvince/china.json").then((chinaGeoData: any) => {
      const path = d3.geoPath().projection(this.projection);

      this.gMapProvinces
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.5)
        .selectAll("path")
        .data(chinaGeoData.features)
        .join("path")
        .attr("d", path as any)
        .attr("fill", "none");

      const provinces = this.gMap
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "#444")
        .attr("cursor", "pointer")
        .selectAll<SVGPathElement, any>("path")
        .data(chinaGeoData.features)
        .join("path")
        .on("click", (event: MouseEvent, d: any) => this.clicked(event, d, path))
        .attr("d", path as any)
        .attr("fill", "rgba(0, 0, 0, 0.2)")
        .attr("class", "province")
        .each((d: any) => {
          d.clicked = false;
        });

      provinces.append("title").text((d: any) => d.properties.name);
    });

    // d3.json("./edges_data.geojson").then((edgesData) => {
    //   // 将 GeoJSON 数据绘制到地图上
    //   this.g
    //     .append("g")
    //     .selectAll("path")
    //     .data((edgesData as FeatureCollection).features)
    //     .join("path")
    //     .attr("d", (d: any) => {
    //       // 对GeoJSON线坐标应用投影，转换成SVG坐标
    //       const path = d3.geoPath().projection(this.projection);
    //       return path(d.geometry as Geometry);
    //     })
    //     .attr("fill", "none") // 设置线的填充色
    //     .attr("stroke", "gray") // 设置线的颜色
    //     .attr("stroke-width", 1); // 设置线的宽度
    // });
  }

  public renderNodes(): void {
    d3.json("./data/FilteredStationGeo.json").then((positionData: any) => {
      this.gNodes
        .selectAll("circle")
        .data(Object.entries(positionData))
        .join("circle")
        .attr("cx", (d: any) => this.projection(d[1])![0]) // x 坐标
        .attr("cy", (d: any) => this.projection(d[1])![1]) // y 坐标
        .attr("r", 5) // 设置圆的半径
        .attr("fill", "red") // 设置圆的填充颜色
        .attr("stroke", "white") // 设置圆的边框颜色
        .attr("stroke-width", 1);
    });
  }

  public renderLines(): void {
    d3.json("./data/FilteredAccessInfo.json").then((stationsData: any) => {
      const selectedStations = Object.keys(stationsData); // 获取站点的键（例如：长春、南昌等）

      // 载入FilteredTrainInfo.json，并筛选相关数据
      d3.json("./data/FilteredTrainInfo.json").then((trainData: any) => {
        const filteredTrainData = trainData.filter((train: any) =>
          train.stations.some((station: string) => selectedStations.includes(station))
        );

        // 载入站点地理信息
        d3.json("./data/FilteredStationGeo.json").then((stationGeo: any) => {
          const trainLines = filteredTrainData
            .map((train: any) => {
              const trainStations = train.stations
                .map((station: string) => stationGeo[station]) // 将站点转换为地理坐标
                .filter((geo: any) => geo != undefined);

              // 确保有两个以上的坐标点才能绘制
              return trainStations.length > 1 ? { coords: trainStations } : null;
            })
            .filter((line: any) => line !== null);

          // 绘制线路：

          // 绘制每条火车线路
          const lineGenerator = d3
            .line()
            .x(
              (d: any) =>
                (this.projection(d) ??
                  (() => {
                    throw new Error("Invalid coordinate");
                  }).call(null))[0]
            )
            .y(
              (d: any) =>
                (this.projection(d) ??
                  (() => {
                    throw new Error("Invalid coordinate");
                  }).call(null))[1]
            );

          // 使用不同的颜色区分不同的线路
          const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

          this.gLines
            .selectAll(".train-line")
            .data(trainLines)
            .enter()
            .append("path")
            .attr("class", "train-line")
            .attr("d", (d: any) => lineGenerator(d.coords))
            .attr("stroke", (d: any, i: any) => colorScale(i)) // 线路颜色
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("opacity", 0.7);
        });
      });
    });
  }

  public render(): void {
    this.renderMap();
    this.renderLines();
    this.renderNodes();

    // 初始化缩放
    this.svg.call(this.zoom as any);
  }
}

const mapRenderer = new MapRenderer();
mapRenderer.render();
