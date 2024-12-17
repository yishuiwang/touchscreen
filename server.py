from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
from pathlib import Path
import numpy as np

app = FastAPI()

# 添加 CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # 允许所有源
        "*",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# 加载最佳模型
MODEL_DIR = Path("models")
try:
    with open(MODEL_DIR / "rf.joblib", "rb") as f:
        model = joblib.load(f)
        print("模型加载成功")
        print("模型类型:", type(model))
        # 如果是 sklearn 模型，打印其类名
        print("模型类名:", model.__class__.__name__)
except Exception as e:
    print(f"模型加载错误: {str(e)}")
    raise HTTPException(status_code=500, detail=f"模型加载失败: {str(e)}")

class GestureData(BaseModel):
    points: list[dict]
    screenWidth: int
    screenHeight: int

def preprocess_gesture(gesture_data: GestureData):
    """将手势数据转换为模���所需的特征格式"""
    points = gesture_data.points
    
    # 转换点数据为numpy数组格式
    data_x = np.array([p['x'] for p in points])
    data_y = np.array([p['y'] for p in points])
    
    if len(points) < 5:  # 与训练时的 min_data_points 保持一致
        raise HTTPException(status_code=400, detail="手势点数太少，至少需要5个点")
    
    # 基础特征
    distances = np.sqrt(np.diff(data_x)**2 + np.diff(data_y)**2)
    length = np.sum(distances)  # 总长度
    
    # 位移特征
    x_displacement = data_x[-1] - data_x[0]  # X方向位移
    y_displacement = data_y[-1] - data_y[0]  # Y方向位移
    total_displacement = np.sqrt(x_displacement**2 + y_displacement**2)  # 总位移
    max_x = np.max(data_x) - np.min(data_x)  # X方向最大位移
    max_y = np.max(data_y) - np.min(data_y)  # Y方向最大位移
    
    # 方向和曲率特征
    angles = np.arctan2(np.diff(data_y), np.diff(data_x))
    mean_angle = np.mean(angles)
    curvatures = np.abs(np.diff(angles))
    max_curvature = np.max(curvatures) if len(curvatures) > 0 else 0
    mean_curvature = np.mean(curvatures) if len(curvatures) > 0 else 0
    
    # 形状特征
    # CCO (Curve Complexity Offset) - 实际路径长度与直线位移的比值
    cco = length / (total_displacement + 1e-6)  # 添加小值避免除零
    
    # RMSE - 点到直线的均方根误差
    if len(points) >= 2:
        # 计算起点到终点的直线方程
        x1, y1 = data_x[0], data_y[0]
        x2, y2 = data_x[-1], data_y[-1]
        # 计算点到直线的距离
        if x2 - x1 != 0:
            k = (y2 - y1) / (x2 - x1)
            b = y1 - k * x1
            distances_to_line = np.abs(k * data_x - data_y + b) / np.sqrt(k**2 + 1)
        else:
            distances_to_line = np.abs(data_x - x1)
        rmse = np.sqrt(np.mean(distances_to_line**2))
    else:
        rmse = 0

    # 计算速度
    timestamps = np.array([p['timestamp'] for p in points])
    time_diffs = np.diff(timestamps)
    velocities = distances / (time_diffs + 1e-6)  # 避免除零
    mean_velocity = np.mean(velocities)
    max_velocity = np.max(velocities)

    # 计算加速度
    accelerations = np.diff(velocities)
    mean_acceleration = np.mean(accelerations) if len(accelerations) > 0 else 0
    max_acceleration = np.max(accelerations) if len(accelerations) > 0 else 0

    # 按照训练时的特征顺序组织数据
    features = [
        length,              # 总长度
        total_displacement,  # 总位移
        x_displacement,      # X方向位移
        y_displacement,      # Y方向位移
        max_x,              # X方向最大位���
        max_y,              # Y方向最大位移
        mean_angle,         # 平均方向
        max_curvature,      # 最大曲率
        mean_curvature,     # 平均曲率
        cco,                # 曲线复杂度偏移
        rmse,               # 均方根误差
        mean_velocity,      # 平均速度
        max_velocity,       # 最大速度
        mean_acceleration,  # 平均加速度
        max_acceleration,   # 最大加速度
    ]
    
    return np.array(features).reshape(1, -1)

@app.post("/api/evaluate")
async def evaluate_gesture(gesture_data: GestureData):
    print("接收到的手势数据:", gesture_data)
    try:
        # 预处理手势数据
        X = preprocess_gesture(gesture_data)
        print("预处理后的特征:", X)
        print("特征形状:", X.shape)
        
        # 进行预测
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0].max()
        
        print("预测结果:", prediction)
        print("预测概率:", probability)
        print("预测概率分布:", model.predict_proba(X)[0])
        
        return {
            "prediction": str(prediction),
            "probability": float(probability),
            "model_name": "svm"
        }
    except Exception as e:
        print(f"预测过程出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
