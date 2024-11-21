export class CanvasMouseEventAnalyzer {
  private mouseDownTime: number;
  private mouseDownOnItem: string | null;

  constructor() {
    this.mouseDownTime = 0;
    this.mouseDownOnItem = null;
  }

  analyse(type: keyof SVGSVGElementEventMap, event: MouseEvent) {
    // switch (type) {
    //     break;
    // }
  }

  // private findNode(element: SVGElement): string | null {
  //   // const nodes = this.graph.getNodesId();
  //   // const [x, y] = d3.pointer(event, this.container);
  //   // for (let node of nodes) {
  //   //   const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
  //   //   if (distance < NODE_DEFAULT_RADIUS) {
  //   //     return node;
  //   //   }
  //   // }
  //   // return null;
  //   // TODO: 设计CanvasManager类，使用类中的节点.on("mouseover")重写。
  // }
}
