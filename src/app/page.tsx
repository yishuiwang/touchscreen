'use client'
import React, { useState, useRef, useEffect } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

const MODES = ['mode1', 'mode2', 'mode3', 'mode4', 'mode5'];

const Home = () => {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 修改绘制轨迹函数
  const drawTrajectory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置线条样式
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 绘制轨迹
    if (touches.length > 1) {
      ctx.beginPath();
      ctx.moveTo(touches[0].x, touches[0].y);
      for (let i = 1; i < touches.length; i++) {
        ctx.lineTo(touches[i].x, touches[i].y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawTrajectory();
  }, [touches]);

  // 修改 Canvas 尺寸设置
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStart = () => {
    if (!selectedMode) {
      setShowModeSelector(true);
      setSaveStatus('请先选择模式！');
      return;
    }
    setIsStarted(true);
    setIsPaused(false);
    setShowModeSelector(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRecording(false);
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    setIsStarted(true);
    setIsPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedMode) {
      setSaveStatus('请先选择模式！');
      return;
    }
    if (!isStarted || isPaused) {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setTouches([{
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      timestamp: Date.now()
    }]);
    setIsRecording(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setTouches(prev => [...prev, {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      timestamp: Date.now()
    }]);
  };

  const handleTouchEnd = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    
    if (touches.length > 0) {
      try {
        setSaveStatus('正在保存...');
        const response = await fetch('/api/save-trajectory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            touches,
            mode: selectedMode 
          }),
        });

        const result = await response.json();
        if (result.success) {
          setSaveStatus(`数据已保存到: ${result.fileName}`);
        } else {
          setSaveStatus('保存失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        setSaveStatus('保存失败');
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'lightgray',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        paddingTop: '60px'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          touchAction: 'none'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '10px',
        zIndex: 3,
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={handleStart}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isStarted && !isPaused ? '#28a745' : '#fff',
            color: isStarted && !isPaused ? '#fff' : '#000',
            border: '1px solid #28a745',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isStarted || isPaused}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isPaused ? '#dc3545' : '#fff',
            color: isPaused ? '#fff' : '#000',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            cursor: !isStarted || isPaused ? 'not-allowed' : 'pointer',
            opacity: !isStarted ? 0.5 : 1
          }}
        >
          Pause
        </button>
      </div>
      <div style={{ 
        position: 'absolute',
        top: '70px',
        left: '0',
        right: '0',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0.5rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '50px',
        display: showModeSelector || !selectedMode ? 'block' : 'none'
      }}>
        <div style={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '0.5rem',
            padding: '0 0.5rem',
            minWidth: 'min-content'
          }}>
            {MODES.map(mode => (
              <div 
                key={mode}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  width: '80px',
                  flexShrink: 0
                }}
              >
                <button
                  onClick={() => handleModeSelect(mode)}
                  style={{
                    padding: '0.25rem',
                    backgroundColor: selectedMode === mode ? '#007bff' : '#fff',
                    color: selectedMode === mode ? '#fff' : '#000',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {mode}
                </button>
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  border: selectedMode === mode ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  <img
                    src={`/pic/${mode}.png`}
                    alt={mode}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div style={{ 
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '400px',
      }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>触摸屏幕并移动以记录轨迹</h3>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>触摸结束后将自动保存数据</p>
        {saveStatus && <p style={{ margin: 0, fontSize: '0.9rem' }}>{saveStatus}</p>}
      </div>
    </div>
  );
};

export default Home;
