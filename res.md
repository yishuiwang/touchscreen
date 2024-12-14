# Model Evaluation Metrics

## Summarizes

| Model        | Precision | Recall | F1 Score | AUC | Accuracy |
|---------------|-----------|--------|----------|-----|----------|
| **Decision Tree (DT)** | 0.91      | 0.89   | 0.90     | 0.89| 0.89     |
| **Random Forest (RF)**   | 0.94      | 0.93   | 0.93     | 0.98| 0.94     |
| **k-Nearest Neighbors (KNN)** | 0.95      | 0.95   | 0.95     | 0.99| 0.94     |
| **Multi-layer Perceptron (MLP)** | 0.92      | 0.95   | 0.93     | 0.99| 0.93     |
| **Support Vector Machine (SVM)** | 0.96      | 0.89   | 0.92     | 0.99| 0.92     |

## Evaluating DT
- **Precision**: 0.91  
- **Recall**: 0.89  
- **F1 Score**: 0.90  
- **FPR**: 0.10  
- **AUC**: 0.89  

### DT Classification Report
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| 0     | 0.88      | 0.90   | 0.89     | 67      |
| 1     | 0.91      | 0.89   | 0.90     | 75      |

**Accuracy**: 0.89  
**Macro Avg**: Precision 0.89, Recall 0.89, F1-Score 0.89  
**Weighted Avg**: Precision 0.89, Recall 0.89, F1-Score 0.89  

---

## Evaluating RF
- **Precision**: 0.94  
- **Recall**: 0.93  
- **F1 Score**: 0.93  
- **FPR**: 0.00  
- **AUC**: 0.98  

### RF Classification Report
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| 0     | 0.93      | 0.95   | 0.94     | 74      |
| 1     | 0.94      | 0.93   | 0.93     | 68      |

**Accuracy**: 0.94  
**Macro Avg**: Precision 0.94, Recall 0.94, F1-Score 0.94  
**Weighted Avg**: Precision 0.94, Recall 0.94, F1-Score 0.94  

---

## Evaluating KNN
- **Precision**: 0.95  
- **Recall**: 0.95  
- **F1 Score**: 0.95  
- **FPR**: 0.00  
- **AUC**: 0.99  

### KNN Classification Report
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| 0     | 0.94      | 0.94   | 0.94     | 67      |
| 1     | 0.95      | 0.95   | 0.95     | 75      |

**Accuracy**: 0.94  
**Macro Avg**: Precision 0.94, Recall 0.94, F1-Score 0.94  
**Weighted Avg**: Precision 0.94, Recall 0.94, F1-Score 0.94  

---

## Evaluating MLP
- **Precision**: 0.92  
- **Recall**: 0.95  
- **F1 Score**: 0.93  
- **FPR**: 0.00  
- **AUC**: 0.99  

### MLP Classification Report
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| 0     | 0.94      | 0.91   | 0.92     | 67      |
| 1     | 0.92      | 0.95   | 0.93     | 75      |

**Accuracy**: 0.93  
**Macro Avg**: Precision 0.93, Recall 0.93, F1-Score 0.93  
**Weighted Avg**: Precision 0.93, Recall 0.93, F1-Score 0.93  

---

## Evaluating SVM
- **Precision**: 0.96  
- **Recall**: 0.89  
- **F1 Score**: 0.92  
- **FPR**: 0.00  
- **AUC**: 0.99  

### SVM Classification Report
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| 0     | 0.89      | 0.96   | 0.92     | 67      |
| 1     | 0.96      | 0.89   | 0.92     | 75      |

**Accuracy**: 0.92  
**Macro Avg**: Precision 0.92, Recall 0.92, F1-Score 0.92  
**Weighted Avg**: Precision 0.92, Recall 0.92, F1-Score 0.92  
