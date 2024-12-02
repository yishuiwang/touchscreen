'use client'
import { useState, useEffect } from 'react'

interface TrajectoryFile {
  fileName: string;
  timestamp: string;
  mode: string;
}

// 添加一个格式化时间的函数
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

export default function History() {
  const [files, setFiles] = useState<TrajectoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloadingDataset, setDownloadingDataset] = useState(false);

  const loadFiles = () => {
    fetch('/api/list-trajectories')
      .then(res => res.json())
      .then(data => {
        setFiles(data.files);
        setLoading(false);
      })
      .catch(err => {
        console.error('加载失败:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDelete = async (fileName: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    setDeleting(fileName);
    try {
      const response = await fetch('/api/delete-trajectory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (response.ok) {
        // 重新加载文件列表
        loadFiles();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadDataset = async () => {
    setDownloadingDataset(true);
    try {
      const response = await fetch('/api/download-dataset');
      if (!response.ok) throw new Error('下载失败');

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition');
      const fileName = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'dataset.zip';

      // 创建 Blob 并下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载数据集失败:', error);
      alert('下载数据集失败');
    } finally {
      setDownloadingDataset(false);
    }
  };

  return (
    <div style={{ 
      padding: '70px 10px 20px 10px',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0 0.5rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem',
          margin: 0
        }}>
          历史记录
        </h1>
        <button
          onClick={handleDownloadDataset}
          disabled={downloadingDataset || files.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: downloadingDataset || files.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            opacity: downloadingDataset || files.length === 0 ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {downloadingDataset ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
              打包中...
            </>
          ) : (
            '下载数据集'
          )}
        </button>
      </div>
      {loading ? (
        <p style={{ margin: '1rem 0.5rem' }}>加载中...</p>
      ) : files.length === 0 ? (
        <p style={{ margin: '1rem 0.5rem' }}>暂无记录</p>
      ) : (
        <div style={{ width: '100%' }}>
          {files.map(file => (
            <div 
              key={file.fileName} 
              style={{ 
                margin: '0.5rem 0',
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <span style={{ 
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {file.mode}
                </span>
                <span style={{ 
                  color: '#666',
                  fontSize: '0.8rem'
                }}>
                  {formatDate(file.timestamp)}
                </span>
              </div>
              <div style={{ 
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ 
                  flex: 1,
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  minWidth: '150px'
                }}>
                  {file.fileName}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => window.open(`/data/${file.fileName}`, '_blank')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    下载
                  </button>
                  <button
                    onClick={() => handleDelete(file.fileName)}
                    disabled={deleting === file.fileName}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleting === file.fileName ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      opacity: deleting === file.fileName ? 0.7 : 1
                    }}
                  >
                    {deleting === file.fileName ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 