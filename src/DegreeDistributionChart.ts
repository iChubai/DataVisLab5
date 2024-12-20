// src/DegreeDistributionChart.ts
import * as d3 from "d3";

export class DegreeDistributionChart {
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("degree-distribution-chart")!;
  }

  public render(data: { degree: number; count: number }[]) {
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

    // 设置X轴（度）
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.degree.toString()))
      .range([0, width])
      .padding(0.1);

    // 设置Y轴（数量）
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)!])
      .nice()
      .range([height, 0]);

    // 添加X轴
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    // 添加Y轴
    svg.append("g").call(d3.axisLeft(y));

    // 添加柱状图
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.degree.toString())!)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "orange");

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

   svg
  .selectAll("rect")
  .on("mouseover", (event: MouseEvent, d: any) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`<strong>度:</strong> ${d.degree}<br/><strong>数量:</strong> ${d.count}`)
      .style("left", `${event.pageX + 5}px`)
      .style("top", `${event.pageY - 28}px`);
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}
