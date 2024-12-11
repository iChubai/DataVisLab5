图交互模块设计目标：

1. 有很多节点和很多边。
2. 节点与场景中心有力作用：节点受到指向场景中心的力，力与距离场景中心的距离正相关。
3. 节点可拖拽。光标在节点上时按住鼠标视为拖拽。拖拽时，节点受到指向鼠标光标的力，正相关于距离；同时，与鼠标光标之间连接一个边。如果松开时鼠标光标落在另一个节点上，则新建一个连接这两个节点的有向边。
4. 节点之间有力作用。所有节点之间均有负相关于距离的斥力作用，除此之外，由有向边相连的一对节点之间有负相关于距离的引力作用。
5. 单击节点时，使用随节点移动的框显示节点信息；单击边时，使用随边的中点移动的框显示边的信息；
6. 单击空白区域时，创建新节点。
7. 按住鼠标时，如果鼠标不是在拖拽节点，那么破坏鼠标经过的边和节点。

同时，你需要设计合理的数据结构或者类，用来保存全局的节点和边，以便后续扩展该代码，利用图的拓扑结构在节点之间沿有向边传递信息并更新。

在进行下一步工作前，我们有必要审视整个项目目前的耦合度是否过高，是否存在解耦的可能性。

1. graph 是整个项目的核心。接下来，SNN 或者 GNN 的构建都基于 graph 进行，或者依赖于 graph 中的节点间的连接情况进行，并且动态更新。
2. 接下来需要构建节点和边的可视化图表，例如 SNN 中的电位-时间图、发放率等。

因此，现在的 render 和 force 都是 controller 的附属内容，用于可交互地动态更改 graph，因此这三者应当与 graph 存在低耦合（是这样吗？）。我们应该首先检查是否是这样，随后才能进行下一步。

# 鼠标事件索引：

- GUI 空白区域：（见 event_handler.py）
  - 鼠标点击：创建新节点。
  - 鼠标拖拽：移除鼠标经过的边和节点。
- 节点：（见 force.py）
  - 鼠标点击：显示节点信息。
  - 鼠标拖拽：受力作用，创建或更新边。
  - 鼠标拖拽结束：如果鼠标落在另一个节点上，则新建一个连接这两个节点的有向边。
- 边：
  - 鼠标点击：显示边信息。

你可以看到这个设计非常混乱。后面会重构 event 模块让它通过回调函数添加事件并统一管理，现在懒得搞了。

# TIPS:

## 参数设置

我重新设计了项目与参数相关的结构。现在的项目的参数通过 ParameterManager 管理，通过 showParameters 展示并提供直接交互界面，由 NodeParameterRegistry 和 EdgeParameterRegistry 注册。

模拟程序（包括物理模拟、SNN 模拟等）通过 ParameterManager 的 get 和 set 方法来获取或设置参数（例如 params.get("info")）；参数面板的展示逻辑由函数 showParameters 给出，用户在更改参数面板中的参数时会更改参数值并触发参数的回调函数，通知模拟程序进行更新；在初始化时由 NodeParameterRegistry 和 EdgeParameterRegistry 统一注册到 ParameterManager 中。

所有需要增加额外参数的类都需要写一个 ParameterRegistry，并在 NodeParameterRegistry 和 EdgeParameterRegistry 中注册它。

Q: parameter.onChange 报错了，怎么办？如何查找 onChange 的具体定义？
A: 先定位是哪个参数报错了，然后去查找该参数的注册类。注册类见`parameter.py`的 NodeParameterRegistry 的`registerAll`方法，其中有诸多注册类以及被注册的变量名。

## 回调函数：

现在有以下几个类接受回调函数的注册：

- ./src/infrastructure/graph.ts: Graph (GraphEventCallback)
  - onNodeAdded
  - onNodeRemoved
  - onEdgeAdded
  - onEdgeRemoved
- ./src/gui/event_manager.ts: MouseEventManager (MouseEventCallback)
  - onNodeClicked
  - onEdgeClicked
  - ononCanvasClicked
- ./src/snn/snn_model.ts: SNNModel (SNNModelCallback)

使用`npx vite`运行项目测试。
