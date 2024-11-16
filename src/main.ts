// main.ts
import { GraphController } from "./controller.js";

const svg: SVGSVGElement | null = document.querySelector("#graphCanvas");
if (!svg) throw new Error("SVG element with id 'graphCanvas' not found.");
const controller: GraphController = new GraphController(svg);
