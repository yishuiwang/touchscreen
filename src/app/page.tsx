'use client'
import React, { useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

const Home = () => {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouches([{
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouches(prev => [...prev, {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }]);
  };

  const handleTouchEnd = async () => {
    if (touches.length > 0) {
      try {
        setSaveStatus('正在保存...');
        const response = await fetch('/api/save-trajectory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ touches }),
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <h3>触摸屏幕并移动以记录轨迹</h3>
      <p>触摸结束后将自动保存数据</p>
      {saveStatus && <p>{saveStatus}</p>}
    </div>
  );
};

export default Home;
