'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './evaluate.module.css'

interface Point {
  x: number
  y: number
  timestamp: number  // 添加时间戳
}

export default function EvaluatePage() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Point[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const startTimeRef = useRef<number>(0)

  // 清除画布
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // 绘制轨迹
  const drawPath = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    clearCanvas()
    
    ctx.beginPath()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()
  }

  // 处理触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true)
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    startTimeRef.current = Date.now()
    setPoints([{
      x,
      y,
      timestamp: 0  // 相对时间从0开始
    }])
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    setPoints(prev => [...prev, {
      x,
      y,
      timestamp: Date.now() - startTimeRef.current
    }])
  }

  const handleTouchEnd = async () => {
    setIsDrawing(false)
    
    // 准备轨迹数据
    const gestureData = {
      points: points.map(point => ({
        x: point.x / window.innerWidth,    // 归一化坐标
        y: point.y / window.innerHeight,
        timestamp: point.timestamp
      })),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }

    try {
      // 发送到后端API
      const response = await fetch('http://localhost:8000/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gestureData)
      })

      if (!response.ok) {
        throw new Error('评估请求失败')
      }

      const result = await response.json()
      setPrediction(result.prediction)
      
    } catch (error) {
      console.error('评估出错:', error)
      setPrediction('评估失败，请重试')
    }
  }

  // 当点集更新时重绘轨迹
  useEffect(() => {
    drawPath()
  }, [points])


  // 添加一个调整画布大小的函数
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  // 在组件挂载和窗口大小改变时调整画布大小
  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <div className={styles.container}>
      <h1>模型评估</h1>
      
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {prediction && (
        <div className={styles.predictionOverlay}>
          预测结果: {prediction}
        </div>
      )}
    </div>
  )
}