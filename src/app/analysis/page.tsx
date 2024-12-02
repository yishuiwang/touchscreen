'use client'
import { useState } from 'react'

export default function Analysis() {
  const [selectedFile, setSelectedFile] = useState<string>('')
  
  return (
    <div style={{ padding: '80px 20px 20px 20px' }}>
      <h1>数据分析</h1>
      <div>
        <select 
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          style={{ margin: '1rem 0', padding: '0.5rem' }}
        >
          <option value="">选择文件...</option>
          {/* 这里需要添加文件列表 */}
        </select>
      </div>
      {selectedFile && (
        <div>
          {/* 这里可以添加数据可视化组件 */}
          <p>选中文件的分析结果将显示在这里</p>
        </div>
      )}
    </div>
  )
} 