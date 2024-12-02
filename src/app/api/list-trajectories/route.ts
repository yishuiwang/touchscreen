import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface TrajectoryFile {
  fileName: string;
  timestamp: string;
  mode: string;
}

const MODES = ['mode1', 'mode2', 'mode3', 'mode4', 'mode5'];

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ files: [] });
    }

    const allFiles: TrajectoryFile[] = [];

    // 只遍历指定的五个模式目录
    MODES.forEach(mode => {
      const modeDir = path.join(dataDir, mode);
      if (fs.existsSync(modeDir) && fs.statSync(modeDir).isDirectory()) {
        const files = fs.readdirSync(modeDir)
          .filter(file => file.endsWith('.csv'))
          .map(file => {
            const filePath = path.join(modeDir, file);
            const stats = fs.statSync(filePath);
            return {
              fileName: `${mode}/${file}`,
              timestamp: stats.mtime.toISOString(),
              mode: mode
            };
          });
        allFiles.push(...files);
      }
    });

    // 按时间戳降序排序
    allFiles.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ files: allFiles });
  } catch (error) {
    console.error('获取轨迹文件列表失败:', error);
    return NextResponse.json(
      { error: '获取文件列表失败' }, 
      { status: 500 }
    );
  }
} 