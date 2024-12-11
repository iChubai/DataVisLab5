# %%
import pandas as pd

# 读取数据
nodes_df = pd.read_csv("nodes.csv")

# 提取PASSNGR字段不为NaN的行
nodes_data_df = nodes_df.dropna(subset=["PASSNGR"])

# 保存为新的CSV文件
nodes_data_df.to_csv("nodes_data.csv", index=False)

# %%
import math


def haversine(lon1, lat1, lon2, lat2):
    # 将经纬度从度转换为弧度
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # Haversine公式
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # 地球半径（单位：公里）
    R = 6371.0
    distance = R * c
    return distance


# %%
import numpy as np

# 读取节点数据
nodes_data_df = pd.read_csv("nodes_data.csv")

# 计算每个节点的经纬度
nodes_data_df["coordinates"] = list(zip(nodes_data_df["x"], nodes_data_df["y"]))

# 为每个节点计算到其他节点的距离
edges = []
for idx1, row1 in nodes_data_df.iterrows():
    distances = []
    for idx2, row2 in nodes_data_df.iterrows():
        if idx1 != idx2:
            dist = haversine(row1["x"], row1["y"], row2["x"], row2["y"])
            distances.append((idx2, dist))

    # 排序并选择距离最短的10个节点
    distances.sort(key=lambda x: x[1])
    nearest_nodes = distances[:10]

    # 记录边和权重
    for node, dist in nearest_nodes:
        edges.append((row1["FRANODEID"], nodes_data_df.iloc[node]["FRANODEID"], dist))

# 将边保存为DataFrame
edges_df = pd.DataFrame(edges, columns=["SourceNode", "TargetNode", "Distance"])

# 打印或保存边信息
edges_df.to_csv("edges.csv", index=False)
