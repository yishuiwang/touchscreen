import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function GET() {
  try {
    const zip = new JSZip();
    const dataDir = path.join(process.cwd(), 'data');

    // 检查数据目录是否存在
    if (!fs.existsSync(dataDir)) {
      return new NextResponse('No data available', { status: 404 });
    }

    // 遍历所有模式目录
    const modes = ['mode1', 'mode2', 'mode3', 'mode4', 'mode5'];
    modes.forEach(mode => {
      const modeDir = path.join(dataDir, mode);
      if (fs.existsSync(modeDir)) {
        // 为每个模式创建一个文件夹
        const modeFolder = zip.folder(mode);
        if (modeFolder) {
          // 读取该模式下的所有文件
          const files = fs.readdirSync(modeDir);
          files.forEach(file => {
            const filePath = path.join(modeDir, file);
            const content = fs.readFileSync(filePath);
            modeFolder.file(file, content);
          });
        }
      }
    });

    // 生成 ZIP 文件
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // 生成当前时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="trajectory_dataset_${timestamp}.zip"`,
      },
    });
  } catch (error) {
    console.error('创建数据集压缩包失败:', error);
    return new NextResponse('Failed to create dataset archive', { status: 500 });
  }
} 