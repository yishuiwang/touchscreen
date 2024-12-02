import pandas as pd
import os
import torch
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import torch.nn as nn
import torch.optim as optim

def process_data_directory(data_dir, label):
    # 获取所有 CSV 文件
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    filtered_data = []
    labels = []
    
    for file in csv_files:
        file_path = os.path.join(data_dir, file)
        data = pd.read_csv(file_path)
        
        # 检查数据点数量
        if len(data) >= min_data_points:
            # 计算特征
            distances = np.sqrt(np.diff(data['x'])**2 + np.diff(data['y'])**2)
            length = np.sum(distances)
            
            begin = data['timestamp'].iloc[0]
            end = data['timestamp'].iloc[-1]
            duration = (end - begin)/1000
            speed = length / duration
            
            displacement = np.sqrt((data['x'].iloc[-1] - data['x'].iloc[0])**2 + 
                                 (data['y'].iloc[-1] - data['y'].iloc[0])**2)
            
            angle = np.arctan2(data['y'].iloc[-1] - data['y'].iloc[0], 
                             data['x'].iloc[-1] - data['x'].iloc[0])
            
            filtered_data.append([length, speed, displacement, angle])
            labels.append(label)
        else:
            print(f"File {file} has only {len(data)} data points and will be ignored.")
    
    return filtered_data, labels

# 设置参数
min_data_points = 5

# 处理右手数据
right_data, right_labels = process_data_directory('right_data', 1)
print(f"右手有效数据数量: {len(right_data)}")

# 处理左手数据
left_data, left_labels = process_data_directory('left_data', 0)
print(f"左手有效数据数量: {len(left_data)}")

# 合并数据
all_data = np.array(right_data + left_data)
all_labels = np.array(right_labels + left_labels)

# 打乱数据
shuffle_idx = np.random.permutation(len(all_data))
all_data = all_data[shuffle_idx]
all_labels = all_labels[shuffle_idx]

# 转换为 PyTorch 张量
features = torch.tensor(all_data, dtype=torch.float32)
labels = torch.tensor(all_labels, dtype=torch.long)
dataset = TensorDataset(features, labels)

# 划分训练集和测试集
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = torch.utils.data.random_split(dataset, [train_size, test_size])

# 创建数据加载器
train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, drop_last=True)
test_loader = DataLoader(test_dataset, batch_size=4, shuffle=False, drop_last=True)

# 模型定义保持不变
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(4, 32)
        self.dropout1 = nn.Dropout(0.2)
        self.fc2 = nn.Linear(32, 16)
        self.dropout2 = nn.Dropout(0.2)
        self.fc3 = nn.Linear(16, 2)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout1(x)
        x = torch.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)
        return x

# 初始化模型、损失函数和优化器
model = SimpleNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 训练模型
num_epochs = 1000  # 增加训练轮数
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for inputs, batch_labels in train_loader:
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, batch_labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += batch_labels.size(0)
        correct += (predicted == batch_labels).sum().item()
    
    if (epoch + 1) % 5 == 0:
        accuracy = 100 * correct / total
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/len(train_loader):.4f}, "
              f"Training Accuracy: {accuracy:.2f}%")

# 测试模型
model.eval()
correct = 0
total = 0
predictions = []
true_labels = []

with torch.no_grad():
    for inputs, labels in test_loader:
        outputs = model(inputs)
        _, predicted = torch.max(outputs.data, 1)
        predictions.extend(predicted.tolist())
        true_labels.extend(labels.tolist())
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

print("\n测试结果:")
print(f"测试集准确率: {100 * correct / total:.2f}%")
print(f"预测结果: {predictions}")
print(f"真实标签: {true_labels}")

# 保存模型
torch.save(model.state_dict(), 'hand_classifier.pth')
print("\n模型已保存为 'hand_classifier.pth'")