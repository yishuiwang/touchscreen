'use client'
import { useState } from 'react'

export default function Settings() {
  const [lineColor, setLineColor] = useState('#007bff')
  const [lineWidth, setLineWidth] = useState(3)
  
  return (
    <div style={{ padding: '80px 20px 20px 20px' }}>
      <h1>设置</h1>
      <div style={{ maxWidth: '400px' }}>
        <div style={{ margin: '1rem 0' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            线条颜色
          </label>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
          />
        </div>
        
        <div style={{ margin: '1rem 0' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            线条宽度
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
          <span style={{ marginLeft: '1rem' }}>{lineWidth}px</span>
        </div>
      </div>
    </div>
  )
} 