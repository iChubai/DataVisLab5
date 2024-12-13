class LeftSidePanel {
  private tabButtons: NodeListOf<Element>;
  private sidePanel: HTMLElement;
  private sidePanelTitle: HTMLElement;
  private sidePanelContent: HTMLElement;

  private splitPaneDragger: HTMLElement;

  constructor() {
    // 获取按钮和第二层侧边栏
    this.tabButtons = document.querySelectorAll(".tabButton");
    this.sidePanel =
      document.getElementById("sidePanel") ??
      (() => {
        throw new Error("侧边栏元素不存在");
      }).call(this);
    this.sidePanelTitle =
      document.getElementById("sidePanelTitle") ??
      (() => {
        throw new Error("侧边栏标题元素不存在");
      }).call(this);
    this.sidePanelContent =
      document.getElementById("sidePanelContent") ??
      (() => {
        throw new Error("侧边栏内容元素不存在");
      }).call(this);

    this.splitPaneDragger =
      document.getElementById("splitPaneDragger") ??
      (() => {
        throw new Error("拖拽元素不存在");
      }).call(this);
  }
  public init() {
    // 监听按钮点击事件，切换内容或收起侧边栏
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // 如果点击的是当前已选中的按钮，收起侧边栏
        if (button.classList.contains("selected")) {
          this.sidePanel.classList.add("hidden");
          button.classList.remove("selected");
        } else {
          // 先移除所有按钮的选中状态
          this.tabButtons.forEach((btn) => btn.classList.remove("selected"));
          // 设置当前按钮为选中状态
          button.classList.add("selected");

          // 根据按钮不同切换第二层侧边栏的内容
          if (button.id === "btn-intro") {
            this.sidePanelTitle.innerText = "介绍";
            this.sidePanelContent.innerHTML = "<p>这是介绍内容。</p>";
          } else if (button.id === "btn-params") {
            this.sidePanelTitle.innerText = "参数";
            this.sidePanelContent.innerHTML = "<p>这是参数内容。</p>";
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

const leftSidePanel = new LeftSidePanel();
leftSidePanel.init();
