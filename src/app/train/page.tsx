import Image from 'next/image'
import styles from './train.module.css'

const modelMetrics = [
  { 
    name: '决策树 (DT)',
    file: 'DT',
    metrics: { precision: 0.91, recall: 0.89, f1: 0.90, auc: 0.89, accuracy: 0.89 }
  },
  { 
    name: '随机森林 (RF)',
    file: 'RF',
    metrics: { precision: 0.94, recall: 0.93, f1: 0.93, auc: 0.98, accuracy: 0.94 }
  },
  { 
    name: 'K近邻 (KNN)',
    file: 'KNN',
    metrics: { precision: 0.95, recall: 0.95, f1: 0.95, auc: 0.99, accuracy: 0.94 }
  },
  { 
    name: '多层感知器 (MLP)',
    file: 'MLP',
    metrics: { precision: 0.92, recall: 0.95, f1: 0.93, auc: 0.99, accuracy: 0.93 }
  },
  { 
    name: '支持向量机 (SVM)',
    file: 'SVM',
    metrics: { precision: 0.96, recall: 0.89, f1: 0.92, auc: 0.99, accuracy: 0.92 }
  }
]

export default function TrainPage() {
  return (
    <div className={styles.container}>
      <h1>模型训练结果</h1>
      
      <div className={styles.metricsTable}>
        <h2>模型性能指标汇总</h2>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>模型</th>
                <th>准确率</th>
                <th>召回率</th>
                <th>F1分数</th>
                <th>AUC</th>
                <th>精确度</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((model) => (
                <tr key={model.file}>
                  <td>{model.name}</td>
                  <td>{model.metrics.precision.toFixed(2)}</td>
                  <td>{model.metrics.recall.toFixed(2)}</td>
                  <td>{model.metrics.f1.toFixed(2)}</td>
                  <td>{model.metrics.auc.toFixed(2)}</td>
                  <td>{model.metrics.accuracy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.modelResults}>
        {modelMetrics.map((model) => (
          <div key={model.file} className={styles.modelCard}>
            <h2>{model.name}</h2>
            <div className={styles.imageContainer}>
              <Image 
                src={`/pic/${model.file}.png`}
                alt={`${model.name}训练结果`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
