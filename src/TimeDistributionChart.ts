// src/TimeDistributionChart.ts
import * as d3 from "d3";

export class TimeDistributionChart {
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("time-distribution-chart")!;
  }

  public render(data: { time: number; density: number }[]) {
    // 清空之前的内容
    this.container.innerHTML = "";

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = this.container.clientWidth - margin.left - margin.right;
    const height = this.container.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(this.container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 设置X轴（时间）
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.time) as [number, number])
      .range([0, width]);

    // 设置Y轴（密度）
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.density)!])
      .nice()
      .range([height, 0]);

    // 添加X轴
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    // 添加Y轴
    svg.append("g").call(d3.axisLeft(y));

    // 添加折线
    const line = d3
      .line<{ time: number; density: number }>()
      .x((d) => x(d.time))
      .y((d) => y(d.density));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // 添加工具提示
    const tooltip = d3
      .select(this.container)
      .append("div")
      .style("position", "absolute")
      .style("background", "#f4f4f4")
      .style("padding", "5px 10px")
      .style("border", "1px solid #d4d4d4")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // 添加数据点
    svg
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.time))
      .attr("cy", (d) => y(d.density))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>时间:</strong> ${d.time}<br/><strong>密度:</strong> ${d.density}`)
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  }
}
