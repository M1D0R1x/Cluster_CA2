# Project 4x: MOOC Course Completion Prediction

## Overview
Predict whether an online learner will complete a MOOC (Massive Open Online Course) using clickstream interaction logs (100K records). Built with **Apache Spark (PySpark)** and **Spark MLlib**.

## Pipeline Steps
1. **Load** MOOC clickstream data (100K rows) into Spark DataFrame
2. **Clean** nulls, fill medians, filter invalid session entries
3. **Feature Engineering** — 21 features via VectorAssembler + StandardScaler
4. **Logistic Regression** classifier to predict course completion
5. **Evaluate** model using Accuracy, F1-Score, AUC-ROC, Precision, Recall
6. **Visualize** completion vs. dropout ratio + feature importance

## Tech Stack
- Python 3.10 / 3.11
- Apache Spark (PySpark 3.5.x)
- Spark MLlib (Logistic Regression, VectorAssembler, StandardScaler)
- Matplotlib & Seaborn (Visualization)
- Pandas (Data handling for plots)

## Project Structure
```
project4x/
├── mooc_completion_prediction.py    # Main Spark ML pipeline
├── Course_Completion_Prediction.csv # Input dataset (100K rows)
├── requirements.txt                 # Python dependencies
├── completion_vs_dropout.png        # Output: class distribution chart
├── model_feature_importance.png     # Output: feature importance chart
└── README.md                        # This file
```

## How to Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Spark pipeline
```bash
# Option A: spark-submit (recommended)
spark-submit mooc_completion_prediction.py

# Option B: Direct python
python mooc_completion_prediction.py
```

## Dataset Description (39 Columns)

### Demographics
| Column | Description |
|--------|-------------|
| Student_ID | Unique learner ID (STU100000...) |
| Name | Student name |
| Gender | Male / Female |
| Age | Student age |
| Education_Level | Diploma / Bachelor / Master |
| Employment_Status | Student / Employed / Self-Employed |
| City | Indian city |

### Course Information
| Column | Description |
|--------|-------------|
| Course_ID | Course identifier (C101-C108) |
| Course_Name | Full course name |
| Category | Programming / Marketing / Design / Math / Business |
| Course_Level | Beginner / Intermediate / Advanced |
| Course_Duration_Days | Total course length |
| Instructor_Rating | Instructor rating (1-5) |

### Engagement Metrics (Used as Features)
| Column | Description |
|--------|-------------|
| Login_Frequency | How often the student logs in |
| Average_Session_Duration_Min | Avg session length (minutes) |
| Video_Completion_Rate | % of videos watched |
| Discussion_Participation | Forum engagement score |
| Time_Spent_Hours | Total hours on platform |
| Days_Since_Last_Login | Recency indicator |
| Quiz_Attempts | Number of quiz tries |
| Quiz_Score_Avg | Average quiz score |
| Assignments_Submitted / Missed | Assignment tracking |
| Progress_Percentage | Overall course progress |
| **Completed** | **Target: "Completed" / "Not Completed"** |

## Model Results
| Metric | Score |
|--------|-------|
| Accuracy | ~XX% |
| F1-Score | ~X.XX |
| AUC-ROC | ~X.XX |

*(Update with your actual results after running)*

## Author
[Your Name] — [Your University]

## License
Academic use only.