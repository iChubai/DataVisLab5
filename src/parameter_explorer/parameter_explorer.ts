import { NodeParameter, NodeParameterManager } from "../infrastructure/parameter";

const parameterPanel = document.querySelector("#parameterPanel") as HTMLDivElement;
const parameterForm = document.querySelector("#parameterForm") as HTMLFormElement;

export function showNodeParameters(nodeId: string, parameterManager: NodeParameterManager) {
  console.log("showNodeParameters", nodeId, parameterManager);

  if (!parameterPanel || !parameterForm) {
    throw new Error("Cannot find parameter panel or form");
  }

  const parameters = parameterManager.getParameters(nodeId);
  if (parameters.length === 0) {
    parameterPanel.style.display = "none";
    return;
  }

  // 清空表单
  parameterForm.innerHTML = "";

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
      param.onChange(nodeId, newValue);
    });

    parameterForm.appendChild(label);
    parameterForm.appendChild(input);
  });

  parameterPanel.style.display = "block";
}
