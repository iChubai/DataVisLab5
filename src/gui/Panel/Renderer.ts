// ./src/parameter_explorer/parameter_explorer.ts

import { ParameterManager } from "../../core/ParameterManager";
import { GUIController } from "../controller";
import { Graph } from "../../core/Graph";
import { CanvasEventManager } from "../Canvas/Event/Manager";
import { PanelEventManager } from "./Event/Manager";

const parameterPanel = document.querySelector("#parameterPanel") as HTMLDivElement;
const parameterForm = document.querySelector("#parameterForm") as HTMLFormElement;

/**
 * 绘制参数面板，用以交互式显示item的各个参数。
 *
 * @param itemId 要显示参数的元素（节点/边）的 ID
 * @param parameterManager 参数管理器
 */
export class PanelRender {
  private inputsMap: Map<string, HTMLElement>; // 用于存储表单控件的映射

  private currentItemId: string | undefined;

  constructor(private params: ParameterManager) {
    this.inputsMap = new Map();
    this.currentItemId = undefined;
  }

  registerCallbacks(
    canvasEventManager: CanvasEventManager,
    panelEventManager: PanelEventManager
  ): void {
    canvasEventManager.on("NodeClicked", (event, nodeId) => {
      if (!nodeId) throw new Error("this should not happen: nodeId is undefined");
      this.showParameters(nodeId);
      console.log("showParameters for node", nodeId);
    });
    canvasEventManager.on("EdgeClicked", (event, edgeId) => {
      if (!edgeId) throw new Error("this should not happen: edgeId is undefined");
      this.showParameters(edgeId);
      console.log("showParameters for edge", edgeId);
    });

    panelEventManager.on("UpdateParameter", (paramName, itemId, metaData) => {
      // if (this.currentItemId === undefined && itemId !== undefined) {
      //   this.showParameters(itemId);
      //   console.log("[PanelRender] Automatically show parameters for", itemId);
      // } else if (this.currentItemId !== itemId && itemId !== undefined) {
      //   this.showParameters(itemId);
      //   console.log("[PanelRender] Automatically Switch to show parameters for", itemId);
      // } else
      if (this.currentItemId === itemId || itemId === undefined) {
        // this line is equivalent to "else".
        this.updateParameter(paramName);
        // console.log("[PanelRender] Update parameter", paramName);
      }
    });
  }

  showParameters(itemId: string) {
    this.currentItemId = itemId;
    console.log("showParameters", itemId, this.params);

    if (!parameterPanel || !parameterForm) {
      throw new Error("Cannot find parameter panel or form");
    }

    const parameters = this.params.getParametersFromTarget(itemId);
    if (parameters.length === 0) {
      parameterPanel.style.display = "none";
      return;
    }

    this.inputsMap.clear(); // 清空表单控件映射
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

      // 保存控件引用到 inputsMap
      this.inputsMap.set(param.name, input);

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
  // 更新单个参数的值
  updateParameter(paramName: string) {
    const input = this.inputsMap.get(paramName);
    const newValue = this.params.get(this.currentItemId!, paramName);

    if (!input) return;

    // 根据控件类型更新值
    if (input instanceof HTMLInputElement) {
      if (input.type === "checkbox") {
        input.checked = Boolean(newValue);
      } else {
        input.value = String(newValue);
      }
    } else if (input instanceof HTMLSelectElement) {
      input.value = String(newValue);
    }

    // 根据 isChangable 动态更新控件的禁用状态
    if (this.currentItemId && this.params.getChangeable(this.currentItemId, paramName)) {
      (input as HTMLInputElement | HTMLSelectElement).disabled = true;
    } else {
      (input as HTMLInputElement | HTMLSelectElement).disabled = false;
    }
  }
}
