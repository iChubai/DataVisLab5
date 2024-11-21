// ./src/parameter_explorer/parameter_explorer.ts

import { Parameter, ParameterManager } from "../infrastructure/parameter";
import { GUIController } from "./controller";
import { Graph } from "../infrastructure/graph";

const parameterPanel = document.querySelector("#parameterPanel") as HTMLDivElement;
const parameterForm = document.querySelector("#parameterForm") as HTMLFormElement;

/**
 * 显示参数面板。
 *
 * @param itemId 要显示参数的元素（节点/边）的 ID
 * @param parameterManager 参数管理器
 */
export class ParameterExplorer {
  constructor(private params: ParameterManager, private guiController: GUIController) {}

  registerCallbacks(): void {
    this.guiController.on("NodeClicked", (event, nodeId) => {
      if (!nodeId) throw new Error("this should not happen: nodeId is undefined");
      this.showParameters(nodeId);
      console.log("showParameters for node", nodeId);
    });
    this.guiController.on("EdgeClicked", (event, edgeId) => {
      if (!edgeId) throw new Error("this should not happen: edgeId is undefined");
      this.showParameters(edgeId);
      console.log("showParameters for edge", edgeId);
    });
  }

  showParameters(itemId: string) {
    console.log("showParameters", itemId, this.params);

    if (!parameterPanel || !parameterForm) {
      throw new Error("Cannot find parameter panel or form");
    }

    const parameters = this.params.getParametersFromTarget(itemId);
    if (parameters.length === 0) {
      parameterPanel.style.display = "none";
      return;
    }

    // 清空表单
    parameterForm.innerHTML = "";

    // 展示元素类型及其标签值
    const typeLabel = document.createElement("label");
    typeLabel.textContent = (Graph.isEdgeId(itemId) ? "Edge" : "Node") + " " + itemId;
    typeLabel.style.display = "block";
    parameterForm.appendChild(typeLabel);

    parameters.forEach((param) => {
      const label = document.createElement("label");
      label.textContent = param.name;
      label.style.display = "block";

      let input: HTMLElement;

      // 根据类型生成表单控件
      switch (param.type) {
        case "boolean":
          input = document.createElement("input");
          (input as HTMLInputElement).type = "checkbox";
          (input as HTMLInputElement).checked = Boolean(param.value); // 填入当前值
          break;

        case "number":
        case "string":
          input = document.createElement("input");
          (input as HTMLInputElement).type = param.type;
          (input as HTMLInputElement).value = String(param.value ?? ""); // 填入当前值
          break;

        case "select":
          input = document.createElement("select");
          (param.options ?? []).forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            optionElement.selected = option === param.value; // 根据当前值设置选中
            (input as HTMLSelectElement).appendChild(optionElement);
          });
          break;

        default:
          throw new Error(`Unsupported parameter type: ${param.type}`);
      }

      // 根据 isChanganble 设置是否禁用
      if (!param.isChanganble) {
        (input as HTMLInputElement | HTMLSelectElement).disabled = true;
      }

      // 监听变化事件
      input.addEventListener("change", (e) => {
        let newValue: any;

        if (param.type === "boolean") {
          newValue = (e.target as HTMLInputElement).checked;
        } else if (param.type === "number") {
          newValue = parseFloat((e.target as HTMLInputElement).value);
        } else {
          newValue = (e.target as HTMLInputElement | HTMLSelectElement).value;
        }

        param.value = newValue;
        param.onChange(itemId, newValue);
      });

      parameterForm.appendChild(label);
      parameterForm.appendChild(input);
    });

    parameterPanel.style.display = "block";
  }
}
