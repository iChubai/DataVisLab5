import { Context } from "./Context";
import { Names } from "./Names";
import * as d3 from "d3";
import { TimeDistributionChart } from "./TimeDistributionChart";
import { DegreeDistributionChart } from "./DegreeDistributionChart";

export class LeftSidePanel {
  private tabButtons: NodeListOf<Element>;
  private sidePanel: HTMLElement;
  private sidePanelTitle: HTMLElement;
  private sidePanelContent: HTMLElement;

  private splitPaneDragger: HTMLElement;

  contentOnShow: "intro" | "filter" | "params" | undefined;

  constructor() {
    // 获取按钮和第二层侧边栏
    this.tabButtons = document.querySelectorAll(`.${Names.LeftPanel_TabButton}`);
    this.sidePanel =
      document.getElementById(Names.LeftPanel_SidePanel) ??
      (() => {
        throw new Error("侧边栏元素不存在");
      }).call(this);
    this.sidePanelTitle =
      document.getElementById(Names.LeftPanel_SidePanelTitle) ??
      (() => {
        throw new Error("侧边栏标题元素不存在");
      }).call(this);
    this.sidePanelContent =
      document.getElementById(Names.LeftPanel_SidePanelContent) ??
      (() => {
        throw new Error("侧边栏内容元素不存在");
      }).call(this);

    this.splitPaneDragger =
      document.getElementById(Names.LeftPanel_SplitPaneDragger) ??
      (() => {
        throw new Error("拖拽元素不存在");
      }).call(this);
  }

  changeToParamsView() {
    if (this.contentOnShow === "params") {
      return;
    }
    console.log("切换到参数视图");
    this.tabButtons.forEach((button) => {
      button.classList.remove("selected");
    });
    const btnParams =
      document.getElementById("btn-params") ??
      (() => {
        throw new Error("参数按钮元素不存在");
      }).call(this);
    btnParams.classList.add("selected");
    this.contentOnShow = "params";
    this.sidePanelTitle.innerText = "参数";
    this.sidePanelContent.innerHTML = "<p>这是参数内容。</p>";
    this.sidePanel.classList.remove("hidden");
  }

  public init() {
    // 监听按钮点击事件，切换内容或收起侧边栏
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("[LeftSidePanel] button clicked: ", button.id);
        // 如果点击的是当前已选中的按钮，收起侧边栏
        if (button.classList.contains("selected")) {
          this.sidePanel.classList.add("hidden");
          button.classList.remove("selected");
          this.contentOnShow = undefined;
        } else {
          // 先移除所有按钮的选中状态
          this.tabButtons.forEach((btn) => btn.classList.remove("selected"));
          // 设置当前按钮为选中状态
          button.classList.add("selected");

          // 根据按钮不同切换第二层侧边栏的内容
          if (button.id === "btn-intro") {
            this.sidePanelTitle.innerText = "介绍";
            const introContent = `
            <p class="intro-text">本项目旨在提供可交互的铁路信息可视化分析工具，侧重于分析站点间的最短距离和最短通行时间，以及站点和线路的新建或删除对铁路运行的影响。</p>
            <p class="intro-text">使用指南：</p>
            <ul class="intro-text">
              <li>缩放与平移</li>
              <ul class="intro-text">
                <li>鼠标滚轮滚动：放大或缩小视图。</li>
                <li>鼠标左键拖动：平移视图。</li>
                <li>双击鼠标左键：放大视图</li>
                <li>在地图视图下点击省份：聚焦到该省份。再次点击该省份可恢复正常视图。</li>
                <li>在地图视图下点击空白区域：恢复正常视图。</li>
              </ul>
              <li>一般交互（适用于所有视图）</li>
              <ul class="intro-text">
                <li>鼠标左键点击站点或线路：在左侧边栏“参数”中显示该站点或线路的属性信息。</li>
              </ul>
              <li>拓扑视图下的额外交互</li>
              <ul class="intro-text">
                <li>鼠标中键单击空白区域：添加节点。</li>
                <li>鼠标左键拖动节点：拖动节点。如果松开鼠标时光标指向另一个节点，则在两点间添加一条边。</li>
                <li>鼠标中键按住并拖动：删除光标经过的边和节点。一个节点只有在没有边连接时才能被删除。</li>
              </ul>
              <ul class="intro-text">
                <li>点击节点：显示该节点的属性信息。</li>
                <li>顶部按钮：用于切换视图。</li>
                <ul class="intro-text">
                  <li>地图视图：展示站点地理位置以及铁路连接情况。</li>
                  <li>距离拓扑：展示节点间的拓扑连接关系，图中边长与距离成正比。可以在此视图中交互地增删节点和边。</li>
                  <li>时间视图：图中边长与通行时间成正比，其余同距离拓扑视图。</li>
                </ul>
              </ul>
              <li>左侧边栏</li>
              <ul class="intro-text">
                <li>介绍：你正在读的这个东西。</li>
                <li>过滤器：用于筛选站点和线路。</li>
                <li>参数：用于显示并编辑站点或铁路路段信息。</li>
              </ul>
              <li>右侧边栏</li>
              <ul class="intro-text">
                <li>哦不，还没写。</li>
              </ul>
            </ul>
          `;
            this.sidePanelContent.innerHTML = introContent;
            this.contentOnShow = "intro";
          } else if (button.id === "btn-filter") {
            this.sidePanelTitle.innerText = "过滤器";
            this.sidePanelContent.innerHTML = "<p>这是过滤器内容。</p>";
            this.contentOnShow = "filter";
          } else if (button.id === "btn-params") {
            this.sidePanelTitle.innerText = "参数";
            this.sidePanelContent.innerHTML =
              "<p>在任意视图中点击选择点或边，以显示并编辑站点或铁路路段信息。</p>";
            this.contentOnShow = "params";
          }

          // 显示第二层侧边栏
          this.sidePanel.classList.remove("hidden");
        }
      });
    });

    // 监听拖拽事件，调整侧边栏宽度
    this.splitPaneDragger.addEventListener("mousedown", (e) => {
      // 阻止默认事件，防止选中内容
      e.preventDefault();

      // 获取初始鼠标位置和侧边栏的初始宽度
      const initialMouseX = e.clientX;
      const initialWidth = this.sidePanel.offsetWidth;

      // 拖拽过程中更新宽度
      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - initialMouseX - 20; // 计算鼠标的水平移动距离
        const newWidth = initialWidth + deltaX; // 更新宽度

        if (newWidth > 100 && newWidth < 600) {
          // 限制宽度范围
          this.sidePanel.style.width = newWidth + "px";
        }
      };

      // 停止拖拽
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }
}
interface NearestNeighbor {
  id: string;
  distance: number;
}
export class RightSidePanel {
  private sidebar_ids = [
    { button_id: "sidebarButton1", sidebar_id: "sidebar1", dragger_id: "dragger1" },
    { button_id: "sidebarButton2", sidebar_id: "sidebar2", dragger_id: "dragger2" },
    { button_id: "sidebarButton3", sidebar_id: "sidebar3", dragger_id: "dragger3" },
    { button_id: "sidebarButton4", sidebar_id: "sidebar4", dragger_id: "dragger4" },
  ];
  private buttons: { button: HTMLElement; sidebar: HTMLElement }[];
  private timeDistributionChart: TimeDistributionChart;
  private degreeDistributionChart: DegreeDistributionChart;
  constructor(private ctx: Context) {
    this.buttons = [];
    this.sidebar_ids.forEach(({ button_id, sidebar_id, dragger_id }) => {
      const button =
        document.getElementById(button_id) ??
        (() => {
          throw new Error(`按钮${button_id}不存在`);
        }).call(this);
      const sidebar =
        document.getElementById(sidebar_id) ??
        (() => {
          throw new Error(`侧边栏${sidebar_id}不存在`);
        }).call(this);
      this.buttons.push({ button, sidebar });
    });
    this.timeDistributionChart = new TimeDistributionChart();
    this.degreeDistributionChart = new DegreeDistributionChart();
    this.buttons.forEach(({ button, sidebar }) => {
      button.addEventListener("click", () => {
        this.toggleSidebar(sidebar);
        this.initializeChart(sidebar.id);
      });
    });
  }
   /**
   * 切换侧边栏的显示状态
   * @param sidebar 需要切换显示状态的侧边栏元素
   */
   private toggleSidebar(sidebar: HTMLElement) {
    const isVisible = sidebar.style.display === "block";
    // 隐藏所有侧边栏
    this.buttons.forEach(b => b.sidebar.style.display = "none");
    // 如果之前未显示，显示当前侧边栏
    if (!isVisible) {
      sidebar.style.display = "block";
    }
  }
  /**
   * 根据侧边栏 ID 初始化相应的图表
   * @param sidebarId 侧边栏的 ID
   */
  private initializeChart(sidebarId: string) {
    if (sidebarId === "sidebar1") {
      const data = this.ctx.getTraversalTimeData();
      this.timeDistributionChart.render(data);
    } else if (sidebarId === "sidebar3") {
      const data = this.ctx.getDegreeDistributionData();
      this.degreeDistributionChart.render(data);
    }
    // 如果有更多侧边栏和图表，可以在这里添加相应的逻辑
  }
  /**
   * 为侧边栏添加拖拽功能
   * @param draggerId 拖拽控件的 ID
   * @param sidebarId 侧边栏的 ID
   */
  private addDraggable(draggerId: string, sidebarId: string) {
    const dragger = document.getElementById(draggerId);
    const sidebar = document.getElementById(sidebarId);
    if (!dragger || !sidebar) {
      throw new Error(`拖拽元素不存在：${draggerId}, ${sidebarId}`);
    }

    let isDragging = false;
    let startY: number;
    let startTop: number;

    dragger.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startTop = parseInt(window.getComputedStyle(sidebar).top, 10) || 0;
      e.preventDefault();
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const newTop = startTop + deltaY;
      const maxTop = window.innerHeight - sidebar.offsetHeight;
      if (newTop >= 0 && newTop <= maxTop) {
        sidebar.style.top = `${newTop}px`;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

 /**
   * 初始化右侧边栏，包括拖拽功能和最近邻工具
   */
 public init() {
  // 为每个侧边栏添加拖拽事件
  this.sidebar_ids.forEach(({ dragger_id, sidebar_id }) => {
    this.addDraggable(dragger_id, sidebar_id);
  });

  // 初始化最近邻工具
  this.initNearestNeighborTool();
}
 /**
   * 初始化最近邻工具
   */
 private initNearestNeighborTool() {
  const selectNode = document.getElementById("selected-node") as HTMLSelectElement;
  const findButton = document.getElementById("find-nearest-neighbors") as HTMLButtonElement;
  const resultDiv = document.getElementById("nearest-neighbor-result") as HTMLElement;

  if (!selectNode || !findButton || !resultDiv) {
    throw new Error("最近邻工具的元素未正确加载");
  }

  // 填充节点选项
//   const nodes = this.ctx.data.graph.getNodes();会报错类型“Data”上不存在属性“graph”。
    // const nodes = this.ctx.data.graph.getNodes();
  // 添加按钮点击事件
  // findButton.addEventListener("click", () => {
  //   const selectedCity = selectNode.value;
  //   if (!selectedCity) {
  //     alert("请选择一个城市！");
  //     return;
  //   }
  //   try {
  //     // 获取节点 ID 通过城市名称
  //     const node = this.ctx.data.graph.getNodes().find((n) => n.name === selectedCity);
  //     if (!node) {
  //       alert("未找到选定城市的节点信息。");
  //       return;
  //     }

  //     const nearestNeighbors: NearestNeighbor[] = this.ctx.getNearestNeighbors(node._id, 5);
  //     if (nearestNeighbors.length === 0) {
  //       resultDiv.innerHTML = `<p>未找到最近邻城市。</p>`;
  //       return;
  //     }
  //     // const listItems = nearestNeighbors.map(nn => `<li>${this.ctx.data.graph.getNodeById(nn.id)?.name} (距离: ${nn.distance.toFixed(2)})</li>`).join("");
  //     const listItems = nearestNeighbors.map(
  //       (nn) =>
  //         `<li>${this.ctx.data.graph.getNodeById(nn.id)?.name} (距离: ${nn.distance.toFixed(2)})</li>`
  //       ).join("");
  //     resultDiv.innerHTML = `<h4>最近邻城市：</h4><ul>${listItems}</ul>`;
  //   } catch (error) {
  //     console.error(error);
  //     alert("发生错误，无法查找最近邻城市。");
  //   }
  // });
}

/**
 * 提供访问图表实例的方法
 */
public getTimeDistributionChart(): TimeDistributionChart {
  return this.timeDistributionChart;
}

public getDegreeDistributionChart(): DegreeDistributionChart {
  return this.degreeDistributionChart;
}
}

export class TopSidePanel {
  private buttons_ids = ["btn-map-view", "btn-distance-view", "btn-time-view"];

  private buttons: Map<string, HTMLElement>;

  constructor(private ctx: Context) {
    this.buttons = new Map();
    this.buttons_ids.forEach((button_id) => {
      const button =
        document.getElementById(button_id) ??
        (() => {
          throw new Error(`按钮${button_id}不存在`);
        }).call(this);
      this.buttons.set(button_id, button);
    });
  }

  public init() {
    this.buttons.forEach((button, button_id) => {
      if (button_id === "btn-map-view") {
        button.addEventListener("click", () => {
          this.changeToMapView();
        });
      } else if (button_id === "btn-distance-view") {
        button.addEventListener("click", () => {
          this.changeToDistanceView();
        });
      } else if (button_id === "btn-time-view") {
        button.addEventListener("click", () => {
          this.changeToTimeView();
        });
      }
    });
  }

  private changeToMapView() {
    console.log("切换到地图视图");
    this.ctx.renderMap();
  }

  private changeToDistanceView() {
    console.log("切换到距离视图");
    this.ctx.renderGraph("distance");
  }

  private changeToTimeView() {
    console.log("切换到时间视图");
    this.ctx.renderGraph("time");
  }
}
