import { Context } from "./Context";
import { Data, NodeTable } from "./Data";
import { Names } from "./Names";

export class ParamsExplorer {
  private sidePanelContent: HTMLElement;

  constructor(private ctx: Context, private data: Data) {
    this.sidePanelContent = document.getElementById(
      Names.LeftPanel_SidePanelContent
    ) as HTMLElement;
  }

  explore(dataCategory: string, id?: string) {
    if (dataCategory === Names.DataCategory_Station && id) {
      this.exploreNodeParams(id);
    }
  }

  exploreNodeParams(id: string) {
    const nodeParams: {
      id: string;
      name: string;
      access_info?: number;
      geo_info?: [number, number]; // 经度，纬度 [longitude, latitude]
    } = this.data.nodes()[id];

    // 创建一个表单元素来展示参数
    const parameterForm = document.createElement("form");
    parameterForm.style.display = "block";

    // 添加节点类型和 ID 标签
    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Node " + id;
    typeLabel.style.display = "block";
    parameterForm.appendChild(typeLabel);

    // 遍历参数并动态创建对应的表单控件
    Object.entries(nodeParams).forEach(([key, value]) => {
      const label = document.createElement("label");
      label.textContent = key; // 参数名称
      label.style.display = "block";

      let input: HTMLElement;

      // 根据参数类型生成不同的控件
      switch (key) {
        case "access_info":
          input = document.createElement("input");
          (input as HTMLInputElement).type = "number";
          (input as HTMLInputElement).value = String(value ?? ""); // 填入当前值
          break;

        case "geo_info":
          input = document.createElement("div");
          const [longitude, latitude] = value as [number, number];

          const longitudeInput = document.createElement("input");
          longitudeInput.type = "number";
          longitudeInput.value = String(longitude);

          const latitudeInput = document.createElement("input");
          latitudeInput.type = "number";
          latitudeInput.value = String(latitude);

          input.appendChild(longitudeInput);
          input.appendChild(latitudeInput);
          break;

        case "id":
        case "name":
          input = document.createElement("input");
          (input as HTMLInputElement).type = "text";
          (input as HTMLInputElement).value = String(value ?? ""); // 填入当前值
          break;

        default:
          throw new Error(`Unsupported parameter key: ${key}`);
      }

      // 创建表格行，显示标签和输入控件
      const formRow = document.createElement("div");
      formRow.style.display = "flex";
      formRow.style.marginBottom = "10px";

      const labelContainer = document.createElement("div");
      labelContainer.style.flex = "1";
      labelContainer.appendChild(label);

      const inputContainer = document.createElement("div");
      inputContainer.style.flex = "2";
      inputContainer.appendChild(input);

      formRow.appendChild(labelContainer);
      formRow.appendChild(inputContainer);
      parameterForm.appendChild(formRow);
    });

    // 清空侧边栏并将表单添加到侧边栏内容中
    this.sidePanelContent.innerHTML = ""; // 清空当前内容（如果需要重新渲染）
    this.sidePanelContent.appendChild(parameterForm);
  }
}
