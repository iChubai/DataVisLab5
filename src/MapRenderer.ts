import * as d3 from "d3";
import * as topojson from "topojson-client";
import { FeatureCollection, Geometry } from "geojson";

console.log("MapRenderer loading");

d3.json("./counties-albers-10m.json").then((us: any) => {
  const width: number = 975;
  const height: number = 610;

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8]) // 设置缩放比例范围
    .on("zoom", zoomed); // 在缩放时调用 zoomed 函数

  const svg = d3
    .select("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;")
    .on("click", reset); // 点击时重置视图

  const path = d3.geoPath();
  const g = svg.append("g");

  // 绘制县界
  g.append("g")
    .attr("fill", "none")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 0.5)
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("d", path);

  // 绘制州界
  const states = g
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("cursor", "pointer")
    .selectAll<SVGPathElement, any>("path")
    .data((topojson.feature(us, us.objects.states) as FeatureCollection<Geometry>).features)
    .join("path")
    .on("click", clicked) // 点击州时触发缩放
    .attr("d", path)
    .attr("fill", "rgba(0, 0, 0, 0.2)") // 设置州的默认填充色为半透明红色
    .each((d: any) => {
      d.clicked = false; // 给每个州添加一个 'clicked' 属性，初始值为 false
    });

  states.append("title").text((d: any) => d.properties.name); // 显示州名

  // 绘制州与州之间的边界
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, us.objects.states, (a: any, b: any) => a !== b)));

  // 初始化缩放
  svg.call(zoom);

  // 重置视图
  function reset(): void {
    states.transition().style("fill", "rgba(0, 0, 0, 0.2)"); // 清除点击时的填充色
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity, // 恢复到初始缩放状态
        d3.zoomTransform(svg.node() as SVGSVGElement).invert([width / 2, height / 2])
      );

    // 重置点击状态
    states.each(function (d: any) {
      d.clicked = false;
    });
  }

  // 点击州时的缩放
  function clicked(event: MouseEvent, d: any): void {
    if (d.clicked) return reset(); // 若当前州已被点击，则重置视图
    states.each(function (d: any) {
      d.clicked = false; // 清除其他州的点击状态
    });
    d.clicked = true;

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation(); // 阻止事件传播
    states.transition().style("fill", "rgba(0, 0, 0, 0.8)"); // 清除其他州的填充色
    d3.select(this).transition().style("fill", "rgba(0, 0, 0, 0.2)"); // 给当前点击的州填充色
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))) // 缩放到适合区域
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node() as SVGSVGElement) // 获取点击位置
      );
  }

  // 缩放时更新视图
  function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    const { transform } = event;
    g.attr("transform", transform.toString()); // 调整坐标系
    g.attr("stroke-width", 1 / transform.k); // 调整边界线的粗细
  }
});

console.log("MapRenderer loaded");
