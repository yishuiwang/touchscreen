import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import numpy as np
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
from scipy import interpolate
import joblib
from pathlib import Path
import json
# 设置参数
min_data_points = 5

def process_data_directory(data_dir, label):
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    filtered_data = []
    labels = []
    
    for file in csv_files:
        file_path = os.path.join(data_dir, file)
        data = pd.read_csv(file_path)
        
        if len(data) >= min_data_points:
            # 基础特征
            distances = np.sqrt(np.diff(data['x'])**2 + np.diff(data['y'])**2)
            length = np.sum(distances)  # 总长度
            
            # 位移特征
            x_displacement = data['x'].iloc[-1] - data['x'].iloc[0]  # X方向位移
            y_displacement = data['y'].iloc[-1] - data['y'].iloc[0]  # Y方向位移
            total_displacement = np.sqrt(x_displacement**2 + y_displacement**2)  # 总位移
            max_x = np.max(data['x']) - np.min(data['x'])  # X方向最大位移
            max_y = np.max(data['y']) - np.min(data['y'])  # Y方向最大位移
            
            # 方向和曲率特征
            angles = np.arctan2(np.diff(data['y']), np.diff(data['x']))
            mean_angle = np.mean(angles)
            curvatures = np.abs(np.diff(angles))
            max_curvature = np.max(curvatures) if len(curvatures) > 0 else 0
            mean_curvature = np.mean(curvatures) if len(curvatures) > 0 else 0
            
            # 形状特征
            # CCO (Curve Complexity Offset) - 实际路径长度与直线位移的比值
            cco = length / (total_displacement + 1e-6)  # 添加小值避免除零
            
            # RMSE - 点到直线的均方根误差
            if len(data) >= 2:
                # 计算起点到终点的直线方程
                x1, y1 = data['x'].iloc[0], data['y'].iloc[0]
                x2, y2 = data['x'].iloc[-1], data['y'].iloc[-1]
                # 计算点到直线的距离
                if x2 - x1 != 0:
                    k = (y2 - y1) / (x2 - x1)
                    b = y1 - k * x1
                    distances_to_line = np.abs(k * data['x'] - data['y'] + b) / np.sqrt(k**2 + 1)
                else:
                    distances_to_line = np.abs(data['x'] - x1)
                rmse = np.sqrt(np.mean(distances_to_line**2))
            else:
                rmse = 0

            # 计算速度
            velocities = np.sqrt(np.diff(data['x'])**2 + np.diff(data['y'])**2)
            mean_velocity = np.mean(velocities)
            max_velocity = np.max(velocities)

            # 计算加速度
            accelerations = np.diff(velocities)
            mean_acceleration = np.mean(accelerations)
            max_acceleration = np.max(accelerations)

            filtered_data.append([
                length,          # 总长度
                total_displacement,  # 总位移
                x_displacement,  # X方向位移
                y_displacement,  # Y方向位移
                max_x,          # X方向最大位移
                max_y,          # Y方向最大位移
                mean_angle,     # 平均方向
                max_curvature,  # 最大曲率
                mean_curvature, # 平均曲率
                cco,           # 曲线复杂度偏移
                rmse,           # 均方根误差
                mean_velocity,  # 平均速度
                max_velocity,   # 最大速度
                mean_acceleration, # 平均加速度
                max_acceleration,  # 最大加速度
            ])
            labels.append(label)
        # else:
            # print(f"File {file} has only {len(data)} data points and will be ignored.")
    
    return filtered_data, labels

# 处理数据
mode1_data, mode1_labels = process_data_directory('data/mode1', 1)
mode2_data, mode2_labels = process_data_directory('data/mode2', 0)
mode4_data, mode4_labels = process_data_directory('data/mode4', 1)
mode5_data, mode5_labels = process_data_directory('data/mode5', 0)

# 合并数据
all_data = np.array(mode1_data + mode2_data + mode4_data + mode5_data)
all_labels = np.array(mode1_labels + mode2_labels + mode4_labels + mode5_labels)

# 打乱数据
shuffle_idx = np.random.permutation(len(all_data))
all_data = all_data[shuffle_idx]
all_labels = all_labels[shuffle_idx]

# 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(all_data, all_labels, test_size=0.2, random_state=42)


from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, roc_curve
import matplotlib.pyplot as plt

# 定义函数来计算和打印指标
def evaluate_model(y_true, y_pred, y_proba, model_name):
    precision = precision_score(y_true, y_pred)
    recall = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    auc = roc_auc_score(y_true, y_proba)
    fpr_value = fpr[np.where(tpr >= 0.5)[0][0]]  # FPR at threshold where TPR is at least 0.5
    
    print(f"{model_name} Precision: {precision:.2f}")
    print(f"{model_name} Recall: {recall:.2f}")
    print(f"{model_name} F1 Score: {f1:.2f}")
    print(f"{model_name} FPR: {fpr_value:.2f}")
    print(f"{model_name} AUC: {auc:.2f}")
    
    # 绘制ROC曲线
    plt.figure()
    plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc:.2f})')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {model_name}')
    plt.legend(loc='lower right')
    plt.show()

def visualize_evaluation(y_true, y_pred, y_proba, model_name):
    """可视化模型评估结果"""
    # 创建一个包含多个子图的图形
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle(f'Model Evaluation - {model_name}', fontsize=16)
    
    # 1. ROC曲线
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    auc = roc_auc_score(y_true, y_proba)
    axes[0, 0].plot(fpr, tpr, label=f'AUC = {auc:.2f}')
    axes[0, 0].plot([0, 1], [0, 1], 'k--')  # 对角线
    axes[0, 0].set_xlabel('False Positive Rate')
    axes[0, 0].set_ylabel('True Positive Rate')
    axes[0, 0].set_title('ROC Curve')
    axes[0, 0].legend(loc='lower right')
    
    # 2. 混淆矩阵
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0, 1])
    axes[0, 1].set_xlabel('Predicted')
    axes[0, 1].set_ylabel('True')
    axes[0, 1].set_title('Confusion Matrix')
    
    # 3. 性能指标条形图
    metrics = {
        'Precision': precision_score(y_true, y_pred),
        'Recall': recall_score(y_true, y_pred),
        'F1': f1_score(y_true, y_pred),
        'AUC': auc
    }
    colors = sns.color_palette('husl', n_colors=len(metrics))
    bars = axes[1, 0].bar(metrics.keys(), metrics.values(), color=colors)
    axes[1, 0].set_ylim([0, 1])
    axes[1, 0].set_title('Performance Metrics')
    # 在柱状图上添加数值标签
    for bar in bars:
        height = bar.get_height()
        axes[1, 0].text(bar.get_x() + bar.get_width()/2., height,
                       f'{height:.2f}',
                       ha='center', va='bottom')
    
    # 4. 预测概率分布
    sns.kdeplot(data=y_proba[y_true == 0], ax=axes[1, 1], label='Class 0', fill=True)
    sns.kdeplot(data=y_proba[y_true == 1], ax=axes[1, 1], label='Class 1', fill=True)
    axes[1, 1].set_xlabel('Predicted Probability')
    axes[1, 1].set_ylabel('Density')
    axes[1, 1].set_title('Prediction Probability Distribution')
    
    plt.tight_layout()
    plt.show()
    
    # 打印分类报告
    print(f"\n{model_name} Classification Report:")
    print(classification_report(y_true, y_pred))

# 定义模型
models = {
    'DT': DecisionTreeClassifier(),
    'RF': RandomForestClassifier(),
    'KNN': KNeighborsClassifier(),
    'NB': GaussianNB(),
    'MLP': MLPClassifier(),
    'SVM': SVC(probability=True)
}

# 创建模型保存目录
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

# 训练和评估模型
for name, model in models.items():
    print(f"\nEvaluating {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    # 调用原有的评估函数
    evaluate_model(y_test, y_pred, y_proba, name)
    # 调用新的可视化函数
    visualize_evaluation(y_test, y_pred, y_proba, name)
    
    # 保存模型
    model_path = MODEL_DIR / f"{name.lower().replace(' ', '_')}.joblib"
    joblib.dump(model, model_path)
    print(f"模型已保存到: {model_path}")


