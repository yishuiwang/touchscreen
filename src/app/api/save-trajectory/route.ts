import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 确保数据目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // 生成文件名
    const fileName = `touch_trajectory_${Date.now()}.csv`;
    const filePath = path.join(dataDir, fileName);
    
    // 创建CSV内容
    const headers = 'timestamp,x,y\n';
    const csvContent = data.touches.map((point: any) => 
      `${point.timestamp},${point.x},${point.y}`
    ).join('\n');
    
    // 写入文件
    fs.writeFileSync(filePath, headers + csvContent);
    
    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error('保存轨迹数据失败:', error);
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
  }
} 