import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { touches, mode } = await request.json();
    
    // 创建主数据目录
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // 创建模式子目录
    const modeDir = path.join(dataDir, mode);
    if (!fs.existsSync(modeDir)) {
      fs.mkdirSync(modeDir);
    }
    
    // 生成文件名
    const fileName = `${mode}_trajectory_${Date.now()}.csv`;
    const filePath = path.join(modeDir, fileName);
    
    // 创建CSV内容
    const headers = 'timestamp,x,y\n';
    const csvContent = touches.map((point: any) => 
      `${point.timestamp},${point.x},${point.y}`
    ).join('\n');
    
    // 写入文件
    fs.writeFileSync(filePath, headers + csvContent);
    
    return NextResponse.json({ 
      success: true, 
      fileName: `${mode}/${fileName}` 
    });
  } catch (error) {
    console.error('保存轨迹数据失败:', error);
    return NextResponse.json(
      { success: false, error: '保存失败' }, 
      { status: 500 }
    );
  }
} 