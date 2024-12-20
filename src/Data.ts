// src/Data.ts

import * as d3 from "d3";
import { Graph } from "./Graph/Basic/Graph"; // 确保路径正确
import { NearestNeighbor, Edge, Node } from "./Interfaces";

export type NodeTable = {
  [id: string]: {
    id: string;
    name: string;

    access_info?: number;
    geo_info?: [number, number]; // 经度，纬度 [longitude, latitude]
  };
};

export type AdjacencyTable = {
  [source_name: string]: {
    [target_name: string]: {
      id: string;
      name: string;

      params: [number, number, number];
    };
  };
};

export class Data {
  private _nodes: NodeTable;
  private _adjacencyTable: AdjacencyTable;

  private loaded: boolean = false;

  constructor() {
    this._nodes = {};
    this._adjacencyTable = {};
  }

  async load(
    AccessInfoURL: string = "./data/FilteredAccessInfo.json",
    GeoInfoURL: string = "./data/FilteredStationGeo.json",
    AdjacencyTableURL: string = "./data/FilteredAdjacencyInfo.json"
  ): Promise<void> {
    await Promise.all([
      d3.json(AccessInfoURL).then((data: any) => {
        Object.entries(data).forEach(([id, access_info]: [string, any]) => {
          if (!this._nodes[id]) {
            this._nodes[id] = { id: id, name: id, access_info: access_info, geo_info: [0, 0] };
            this._adjacencyTable[id] = {};
          }
          this._nodes[id]["access_info"] = access_info;
        });
      }),
      d3.json(GeoInfoURL).then((data_1: any) => {
        Object.entries(data_1).forEach(([id, geo]: [string, any]) => {
          if (!this._nodes[id]) {
            this._nodes[id] = { id: id, name: id, access_info: 0, geo_info: geo };
            this._adjacencyTable[id] = {};
          }
          this._nodes[id]["geo_info"] = geo;
        });
      }),

      d3.json(AdjacencyTableURL).then((data_2: any) => {
        Object.entries(data_2).forEach(([source_name, targets]: [string, any]) => {
          if (this._adjacencyTable[source_name]) {
            Object.entries(targets).forEach(
              ([target_name, [duration_minute, distance_km, _]]: [string, any]) => {
                if (
                  source_name !== target_name &&
                  this._adjacencyTable[target_name][source_name] === undefined
                ) {
                  const name = Graph.getEdgeId(source_name, target_name);
                  this._adjacencyTable[source_name][target_name] = {
                    id: name,
                    name: name,

                    params: [duration_minute, distance_km, _],
                  };
                }
              }
            );
          }
        });
      }),
    ]);
    console.log(this._nodes);
    console.log(this._adjacencyTable);
    this.loaded = true;
  }

  nodes(): NodeTable {
    if (!this.loaded) {
      throw new Error("Data not loaded yet.");
    }
    return this._nodes;
  }

  adjacencyTable(): AdjacencyTable {
    if (!this.loaded) {
      throw new Error("Data not loaded yet.");
    }
    return this._adjacencyTable;
  }

  /**
   * 获取通行时间分布数据
   * @returns 通行时间密度分布数组，格式为 [{ time: number, density: number }, ...]
   */
  public getTraversalTimeData(): { time: number; density: number }[] {
    const data: { time: number; density: number }[] = [];
    const nodes = this.nodes();
    const adjacencyTable = this.adjacencyTable();
    const nodeNames = Object.keys(nodes);
    for (let i = 0; i < nodeNames.length; i++) {
      const sourceName = nodeNames[i];
      const sourceNode = nodes[sourceName];
      const sourceAccessInfo = sourceNode.access_info;
      if (sourceAccessInfo === undefined) {
        continue;
      }
      for (let j = i + 1; j < nodeNames.length; j++) {
        const targetName = nodeNames[j];
        const targetNode = nodes[targetName];
        const targetAccessInfo = targetNode.access_info;
        if (targetAccessInfo === undefined) {
          continue;
        }
        const edgeId = Graph.getEdgeId(sourceName, targetName);
        const edge = adjacencyTable[sourceName][targetName];
        if (edge === undefined) {
          continue;
        }
        const durationMinute = edge.params[0];
        const density = sourceAccessInfo / (durationMinute * 60);
        data.push({ time: durationMinute, density });

        // 反方向的边
        const reverseEdgeId = Graph.getEdgeId(targetName, sourceName);
        const reverseEdge = adjacencyTable[targetName][sourceName];
        if (reverseEdge !== undefined) {
          const reverseDurationMinute = reverseEdge.params[0];
          const reverseDensity = targetAccessInfo / (reverseDurationMinute * 60);
          data.push({ time: reverseDurationMinute, density: reverseDensity });
        }
      }
    }
    return data;
  }

  /**
   * 获取节点度分布数据
   * @returns 节点度分布数组，格式为 [{ degree: number, count: number }, ...]
   */
  public getDegreeDistributionData(): { degree: number; count: number }[] {
    const degreeCounts: { [degree: number]: number } = {};
    const nodes = this.nodes();
    const adjacencyTable = this.adjacencyTable();
    const nodeNames = Object.keys(nodes);

    nodeNames.forEach((sourceName) => {
      const degree = Object.keys(adjacencyTable[sourceName]).length;
      if (degreeCounts[degree]) {
        degreeCounts[degree]++;
      } else {
        degreeCounts[degree] = 1;
      }
    });

    const data = Object.keys(degreeCounts).map((degree) => ({
      degree: Number(degree),
      count: degreeCounts[Number(degree)],
    }));

    // 按度数排序
    data.sort((a, b) => a.degree - b.degree);

    return data;
  }

  /**
   * 获取最近邻节点数据
   * @param nodeId 当前节点 ID
   * @param topN 最近邻数量
   * @returns 最近邻节点数组，格式为 [{ id: string, distance: number }, ...]
   */
  public getNearestNeighbors(nodeId: string, topN: number = 5): NearestNeighbor[] {
    const nodes = this.nodes();
    if (!(nodeId in nodes)) {
      throw new Error(`节点 ${nodeId} 不存在。`);
    }
    const node = nodes[nodeId];
    const [x1, y1] = node.geo_info || [0, 0];

    const distances: NearestNeighbor[] = Object.values(nodes)
      .filter((n) => n.id !== nodeId && n.geo_info)
      .map((targetNode) => {
        const [x2, y2] = targetNode.geo_info!;
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); // 欧氏距离
        return { id: targetNode.id, distance };
      });

    // 按距离排序并返回前 topN 个
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, topN);
  }

  /**
   * 获取所有城市列表
   * @returns 城市名称数组
   */
  public getAllCities(): string[] {
    const nodes = this.nodes();
    return Object.values(nodes)
      .filter((node) => node.geo_info !== undefined)
      .map((node) => node.name);
  }
}
