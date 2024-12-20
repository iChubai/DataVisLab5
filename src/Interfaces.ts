// src/Interfaces.ts

export interface NearestNeighbor {
    id: string;
    distance: number;
  }
  
  export interface Node {
    _id: string; // 节点唯一标识符
    name: string; // 节点的名称
    x: number; // 节点的 x 坐标
    y: number; // 节点的 y 坐标
    vx: number; // 节点的 x 方向速度
    vy: number; // 节点的 y 方向速度
  }
  
  export interface Edge {
    _id: string;
    name: string;
    source: string; // 边的起点节点 ID
    target: string; // 边的终点节点 ID
    length: number; // 边的长度
  }
  