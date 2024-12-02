import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'data', ...params.path);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath);
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${params.path.join('/')}"`,
      },
    });
  } catch (error) {
    console.error('下载文件失败:', error);
    return new NextResponse('Download failed', { status: 500 });
  }
} 