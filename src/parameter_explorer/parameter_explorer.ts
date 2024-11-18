import { NodeParameter, NodeParameterManager } from "../infrastructure/parameter";

const parameterPanel = document.querySelector("#parameterPanel") as HTMLDivElement;
const parameterForm = document.querySelector("#parameterForm") as HTMLFormElement;

export function showNodeParameters(nodeId: string, parameterManager: NodeParameterManager) {
  console.log("show node parameters called"); // FIXME: remove this line

  if (!parameterPanel || !parameterForm) {
    throw new Error("Cannot find parameter panel or form");
  }

  const parameters = parameterManager.getParameters(nodeId);
  if (parameters.length === 0) {
    parameterPanel.style.display = "none";
    console.log("no parameters found"); // FIXME: remove this line
    return;
  }

  parameterForm.innerHTML = ""; // 清空表单
  parameters.forEach((param) => {
    const label = document.createElement("label");
    label.textContent = param.name;
    label.style.display = "block";

    console.log("param.type", param.type); // FIXME: remove this line

    let input: HTMLElement;
    if (param.type === "boolean") {
      input = document.createElement("input");
      (input as HTMLInputElement).type = "checkbox";
      (input as HTMLInputElement).checked = param.value;
      input.addEventListener("change", (e) => {
        param.onChange(nodeId, (e.target as HTMLInputElement).checked);
      });
    } else if (param.type === "number" || param.type === "string") {
      input = document.createElement("input");
      (input as HTMLInputElement).type = param.type;
      (input as HTMLInputElement).value = param.value;
      input.addEventListener("change", (e) => {
        param.onChange(nodeId, (e.target as HTMLInputElement).value);
      });
    } else if (param.type === "select") {
      input = document.createElement("select");
      param.options!.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === param.value) {
          optionElement.selected = true;
        }
        (input as HTMLSelectElement).appendChild(optionElement);
      });
      input.addEventListener("change", (e) => {
        param.onChange(nodeId, (e.target as HTMLSelectElement).value);
      });
    } else {
      throw new Error(`Unsupported parameter type: ${param.type}`);
    }

    parameterForm.appendChild(label);
    parameterForm.appendChild(input);
  });

  parameterPanel.style.display = "block";
}
