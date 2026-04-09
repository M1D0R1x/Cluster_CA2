"""
=============================================================================
 mooc_completion_prediction.py
 ─────────────────────────────
 PROJECT  : 4x — MOOC Course Completion Prediction
 PURPOSE  : Predict whether an online learner will complete a course
            using their clickstream / interaction log data (100K records).

 PIPELINE OVERVIEW:
     1. Load MOOC clickstream CSV into Spark DataFrame
     2. Clean nulls & filter invalid session entries
     3. Engineer features from video, quiz & session activity (Spark MLlib)
     4. Build a Logistic Regression classifier
     5. Evaluate with Accuracy and F1-Score
     6. Visualize completion vs. dropout ratio (saved as PNG)

 HOW TO RUN (Terminal / PyCharm):
     spark-submit mooc_completion_prediction.py
     OR:
     python mooc_completion_prediction.py

 INPUT  : Course_Completion_Prediction.csv  (place in project root)
 OUTPUT : Console metrics + completion_vs_dropout.png
                          + model_feature_importance.png

 PYTHON : 3.10 or 3.11 recommended
 DEPS   : pyspark, matplotlib, seaborn, pandas, numpy
=============================================================================
"""

# ═══════════════════════════════════════════════════════════════════════════
# SECTION 0 : IMPORTS
# ═══════════════════════════════════════════════════════════════════════════

# --- Spark Core ---
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType, DoubleType, FloatType
)

# --- Spark MLlib (Machine Learning) ---
from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.evaluation import (
    BinaryClassificationEvaluator,
    MulticlassClassificationEvaluator
)
from pyspark.ml import Pipeline

# --- Visualization & Utilities ---
import matplotlib
matplotlib.use("Agg")            # Non-interactive backend (works in terminal)
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import os
import sys


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 1 : SPARK SESSION INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════════
# SparkSession is the single entry point for all Spark operations.
# We configure it for local mode with reduced logging.

print("=" * 70)
print("  MOOC Course Completion Prediction — PySpark Pipeline")
print("=" * 70)

spark = (
    SparkSession.builder
    .appName("MOOC_Course_Completion_Prediction")   # App name in Spark UI
    .master("local[*]")                             # Use all local CPU cores
    .config("spark.driver.memory", "4g")            # 4 GB for 100K rows
    .config("spark.sql.shuffle.partitions", "8")    # Fewer partitions for local
    .config("spark.ui.showConsoleProgress", "false") # Kill progress bar spam
    .getOrCreate()
)

# ── CRITICAL: Reduce Spark log noise to only WARN and ERROR ──────────────
# Without this your terminal gets flooded with hundreds of INFO lines
spark.sparkContext.setLogLevel("WARN")

# Also suppress the py4j gateway logger (another source of noise)
import logging
logging.getLogger("py4j").setLevel(logging.ERROR)

print("\n[✓] Spark session created successfully.")
print(f"    Spark version : {spark.version}")
print(f"    App name      : {spark.sparkContext.appName}")


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 2 : LOAD THE MOOC CLICKSTREAM DATA
# ═══════════════════════════════════════════════════════════════════════════
# The CSV has 100K student records with columns covering:
#   - Demographics (Age, Gender, City, Education, Employment)
#   - Course info (Course_ID, Name, Level, Duration)
#   - Engagement metrics (Videos, Quizzes, Sessions, Forum, Assignments)
#   - Payment info
#   - TARGET: "Completed" column → "Completed" or "Not Completed"

CSV_PATH = "Course_Completion_Prediction.csv"

# ── Safety check: does the file exist? ────────────────────────────────────
if not os.path.isfile(CSV_PATH):
    print(f"\n[ERROR] File not found: {CSV_PATH}")
    print("  → Place 'Course_Completion_Prediction.csv' in the project root.")
    spark.stop()
    sys.exit(1)

# ── Load with header and automatic type inference ─────────────────────────
# For 100K rows, inferSchema is acceptable and saves us from manually
# listing all 39 columns. Spark reads the file twice (once to infer, once
# to load) but 100K rows is small enough that this is instant.
raw_df = (
    spark.read
    .option("header", "true")         # First row = column names
    .option("inferSchema", "true")    # Auto-detect data types
    .option("mode", "DROPMALFORMED")  # Skip broken rows silently
    .csv(CSV_PATH)
)

total_raw = raw_df.count()
num_cols = len(raw_df.columns)
print(f"\n[✓] Data loaded: {total_raw:,} rows, {num_cols} columns")

# ── Quick peek at the data ────────────────────────────────────────────────
print("\n--- First 5 rows ---")
raw_df.show(5, truncate=20)

# ── Print all column names so we can verify ───────────────────────────────
print("--- All Columns ---")
for i, col_name in enumerate(raw_df.columns, 1):
    print(f"  {i:2d}. {col_name}")


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 3 : DATA CLEANING
# ═══════════════════════════════════════════════════════════════════════════
# Real-world data is messy. We need to:
#   (a) Convert target column "Completed" from text to binary (0/1)
#   (b) Handle null values in numeric columns
#   (c) Filter out invalid entries (negative durations, zero sessions, etc.)

print("\n" + "=" * 70)
print("  STEP 3 : DATA CLEANING")
print("=" * 70)

# ── 3a. Convert target: "Completed" → 1, "Not Completed" → 0 ────────────
# The "Completed" column has string values. ML models need numeric labels.
print("\n--- Target column value counts (before conversion) ---")
raw_df.groupBy("Completed").count().show()

cleaned_df = raw_df.withColumn(
    "label",
    F.when(F.col("Completed") == "Completed", 1).otherwise(0)
)

# ── 3b. Count nulls in key numeric columns ───────────────────────────────
# We focus on the columns we'll actually use as features
key_numeric_cols = [
    "Age", "Login_Frequency", "Average_Session_Duration_Min",
    "Video_Completion_Rate", "Discussion_Participation",
    "Time_Spent_Hours", "Days_Since_Last_Login", "Notifications_Checked",
    "Peer_Interaction_Score", "Assignments_Submitted", "Assignments_Missed",
    "Quiz_Attempts", "Quiz_Score_Avg", "Project_Grade",
    "Progress_Percentage", "Rewatch_Count", "App_Usage_Percentage",
    "Reminder_Emails_Clicked", "Support_Tickets_Raised",
    "Satisfaction_Rating", "Course_Duration_Days", "Instructor_Rating"
]

print("\n--- Null counts in key numeric columns ---")
null_expr = [
    F.sum(F.when(F.col(c).isNull(), 1).otherwise(0)).alias(c)
    for c in key_numeric_cols
]
null_counts = cleaned_df.select(null_expr).toPandas()
# Only print columns that actually have nulls
has_nulls = {col: int(null_counts[col].iloc[0]) for col in key_numeric_cols if int(null_counts[col].iloc[0]) > 0}
if has_nulls:
    for col_name, cnt in has_nulls.items():
        print(f"  {col_name}: {cnt} nulls")
else:
    print("  No nulls found in key numeric columns!")

# ── 3c. Fill any remaining nulls in numeric columns with their median ─────
# approxQuantile is efficient for large data (exact median is expensive)
for col_name in key_numeric_cols:
    null_count = cleaned_df.filter(F.col(col_name).isNull()).count()
    if null_count > 0:
        median_val = cleaned_df.approxQuantile(col_name, [0.5], 0.01)[0]
        cleaned_df = cleaned_df.fillna({col_name: median_val})
        print(f"  [FILLED] {col_name}: {null_count} nulls → median {median_val}")

# ── 3d. Filter out INVALID session entries ────────────────────────────────
# These represent bad log data / corrupted records:
#   - Negative session duration → sensor/logging error
#   - Zero login frequency → impossible if they have any activity
before_filter = cleaned_df.count()

cleaned_df = (
    cleaned_df
    .filter(F.col("Average_Session_Duration_Min") > 0)   # No negative durations
    .filter(F.col("Login_Frequency") > 0)                 # Must have logged in
    .filter(F.col("Age") > 0)                              # Valid age
)

after_filter = cleaned_df.count()
removed = before_filter - after_filter

print(f"\n[✓] Rows before filtering : {before_filter:,}")
print(f"[✓] Rows after filtering  : {after_filter:,}")
print(f"[✓] Invalid rows removed  : {removed:,}")


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 4 : FEATURE ENGINEERING (Spark MLlib)
# ═══════════════════════════════════════════════════════════════════════════
# We select meaningful numeric features from the clickstream data, then:
#   4a. Define feature columns (video, quiz, session, engagement metrics)
#   4b. VectorAssembler → combine into a single feature vector
#   4c. StandardScaler → normalize so all features are on the same scale

print("\n" + "=" * 70)
print("  STEP 4 : FEATURE ENGINEERING")
print("=" * 70)

# ── 4a. Select feature columns ───────────────────────────────────────────
# We pick columns that represent LEARNER BEHAVIOR — things the model can
# learn patterns from. We EXCLUDE identifiers (Student_ID, Name) and
# text columns that need special encoding (City, Course_Name, etc.)

feature_columns = [
    # --- Video & Content Activity ---
    "Video_Completion_Rate",       # % of course videos watched (0-100)
    "Rewatch_Count",               # How often they re-watched lectures
    "Progress_Percentage",         # Overall course progress (0-100)

    # --- Quiz & Assessment Activity ---
    "Quiz_Attempts",               # Number of quiz attempts
    "Quiz_Score_Avg",              # Average quiz score (0-100)
    "Project_Grade",               # Grade on project work
    "Assignments_Submitted",       # Assignments turned in
    "Assignments_Missed",          # Assignments NOT turned in

    # --- Session & Login Patterns ---
    "Login_Frequency",             # How often they log in
    "Average_Session_Duration_Min",# Average time per session (minutes)
    "Time_Spent_Hours",            # Total hours spent on the course
    "Days_Since_Last_Login",       # Recency — lower = more recent activity

    # --- Engagement & Interaction ---
    "Discussion_Participation",    # Forum / discussion engagement
    "Peer_Interaction_Score",      # How much they interact with peers
    "Notifications_Checked",       # Do they read platform notifications?
    "App_Usage_Percentage",        # % of activity via app vs. web
    "Reminder_Emails_Clicked",     # Do they engage with reminder emails?
    "Support_Tickets_Raised",      # Support requests (may indicate struggle)
    "Satisfaction_Rating",         # Self-reported satisfaction (1-5)

    # --- Course Metadata ---
    "Course_Duration_Days",        # Length of the course
    "Instructor_Rating",           # Instructor quality rating
]

print(f"\n[INFO] Using {len(feature_columns)} features:")
for i, col_name in enumerate(feature_columns, 1):
    print(f"  {i:2d}. {col_name}")

# ── 4b. VectorAssembler: merge all feature columns → single vector ───────
# Spark MLlib REQUIRES all features as a single Vector column.
# VectorAssembler takes N columns and outputs 1 dense vector column.
assembler = VectorAssembler(
    inputCols=feature_columns,     # Our 21 feature columns
    outputCol="raw_features",      # Intermediate vector column
    handleInvalid="skip"           # Skip rows with null/NaN gracefully
)

# ── 4c. StandardScaler: normalize to mean=0, std=1 ───────────────────────
# WHY? Logistic Regression is sensitive to feature magnitudes.
# "Time_Spent_Hours" could range 0-100+ while "Satisfaction_Rating" is 1-5.
# Without scaling, large-range features dominate the model unfairly.
scaler = StandardScaler(
    inputCol="raw_features",       # Input from assembler
    outputCol="features",          # Final scaled feature vector
    withMean=True,                 # Center features to mean = 0
    withStd=True                   # Scale features to std = 1
)

print("\n[✓] VectorAssembler (21 cols → 1 vector) configured.")
print("[✓] StandardScaler (mean=0, std=1 normalization) configured.")


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 5 : TRAIN-TEST SPLIT
# ═══════════════════════════════════════════════════════════════════════════
# Standard 80/20 split. Seed=42 for reproducibility across runs.

print("\n" + "=" * 70)
print("  STEP 5 : TRAIN-TEST SPLIT (80/20)")
print("=" * 70)

train_df, test_df = cleaned_df.randomSplit([0.8, 0.2], seed=42)

train_count = train_df.count()
test_count = test_df.count()
print(f"\n[✓] Training set : {train_count:,} rows")
print(f"[✓] Testing set  : {test_count:,} rows")

# ── Check class balance in training data ──────────────────────────────────
# If highly imbalanced (e.g., 95% completed), we'd need resampling.
print("\n--- Class distribution in training set ---")
train_df.groupBy("label").count().orderBy("label").show()


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 6 : BUILD LOGISTIC REGRESSION MODEL
# ═══════════════════════════════════════════════════════════════════════════
# We use a Spark ML Pipeline to chain all steps:
#   Assembler → Scaler → Logistic Regression
# Pipeline ensures the same transformations apply to both train & test data.

print("\n" + "=" * 70)
print("  STEP 6 : LOGISTIC REGRESSION MODEL")
print("=" * 70)

# ── Define the Logistic Regression classifier ─────────────────────────────
# maxIter=100  → enough iterations for the optimizer to converge
# regParam=0.01 → light L2 regularization to prevent overfitting
# elasticNetParam=0 → pure Ridge (L2); set to 1 for Lasso (L1)
lr = LogisticRegression(
    featuresCol="features",           # Scaled feature vector
    labelCol="label",                 # Binary target (0 or 1)
    maxIter=100,
    regParam=0.01,
    elasticNetParam=0.0,              # 0=Ridge, 1=Lasso, 0.5=ElasticNet
    predictionCol="prediction",
    probabilityCol="probability",
    rawPredictionCol="rawPrediction"
)

# ── Build the Pipeline ────────────────────────────────────────────────────
# A Pipeline chains multiple stages sequentially.
# .fit() trains all stages; .transform() applies them to new data.
pipeline = Pipeline(stages=[assembler, scaler, lr])

print("\n[INFO] Training pipeline: VectorAssembler → StandardScaler → LogisticRegression")
print("       This may take 30-60 seconds on 100K rows...")
pipeline_model = pipeline.fit(train_df)
print("[✓] Model training complete!")

# ── Extract the trained LR model for inspection ──────────────────────────
lr_model = pipeline_model.stages[-1]    # Last pipeline stage = LR model

print(f"\n--- Model Summary ---")
print(f"  Intercept        : {lr_model.intercept:.4f}")
print(f"  Num features     : {len(lr_model.coefficients)}")
print(f"  Total iterations : {lr_model.summary.totalIterations}")


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 7 : MODEL EVALUATION
# ═══════════════════════════════════════════════════════════════════════════
# We evaluate on the TEST set (unseen data) using:
#   - Accuracy  : % of correct predictions
#   - F1-Score  : Harmonic mean of precision & recall (handles imbalance)
#   - AUC-ROC   : Area under ROC curve (overall ranking quality)

print("\n" + "=" * 70)
print("  STEP 7 : MODEL EVALUATION")
print("=" * 70)

# ── Generate predictions on the test set ──────────────────────────────────
predictions = pipeline_model.transform(test_df)

print("\n--- Sample Predictions (first 10) ---")
predictions.select("label", "prediction", "probability").show(10, truncate=False)

# ── 7a. Accuracy ──────────────────────────────────────────────────────────
accuracy_eval = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="accuracy"
)
accuracy = accuracy_eval.evaluate(predictions)

# ── 7b. F1-Score (weighted) ──────────────────────────────────────────────
f1_eval = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="f1"
)
f1_score = f1_eval.evaluate(predictions)

# ── 7c. AUC-ROC ──────────────────────────────────────────────────────────
auc_eval = BinaryClassificationEvaluator(
    labelCol="label", rawPredictionCol="rawPrediction", metricName="areaUnderROC"
)
auc_roc = auc_eval.evaluate(predictions)

# ── 7d. Precision and Recall (bonus metrics) ─────────────────────────────
precision_eval = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="weightedPrecision"
)
recall_eval = MulticlassClassificationEvaluator(
    labelCol="label", predictionCol="prediction", metricName="weightedRecall"
)
precision = precision_eval.evaluate(predictions)
recall = recall_eval.evaluate(predictions)

# ── Print all metrics in a nice box ───────────────────────────────────────
print("\n" + "─" * 50)
print("  MODEL PERFORMANCE METRICS")
print("─" * 50)
print(f"  Accuracy   : {accuracy:.4f}  ({accuracy * 100:.2f}%)")
print(f"  F1-Score   : {f1_score:.4f}")
print(f"  AUC-ROC    : {auc_roc:.4f}")
print(f"  Precision  : {precision:.4f}")
print(f"  Recall     : {recall:.4f}")
print("─" * 50)

# ── Confusion Matrix ──────────────────────────────────────────────────────
# Rows = actual label, Columns = predicted label
# Helps us see false positives vs false negatives
print("\n--- Confusion Matrix ---")
print("  (label=actual, prediction=predicted)")
(
    predictions
    .groupBy("label", "prediction")
    .count()
    .orderBy("label", "prediction")
    .show()
)


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 8 : VISUALIZATIONS
# ═══════════════════════════════════════════════════════════════════════════
# Two key charts:
#   (a) Completion vs. Dropout ratio — overall class distribution
#   (b) Feature importance — which features matter most to the model

print("\n" + "=" * 70)
print("  STEP 8 : VISUALIZATIONS")
print("=" * 70)

sns.set_theme(style="whitegrid", font_scale=1.1)

# ── 8a. COMPLETION vs. DROPOUT PIE + BAR CHART ──────────────────────────
# We create a side-by-side figure: bar chart on left, pie chart on right
completion_counts = (
    cleaned_df
    .groupBy("label")
    .count()
    .orderBy("label")
    .toPandas()
)
completion_counts["status"] = completion_counts["label"].map(
    {0: "Dropout", 1: "Completed"}
)

fig1, (ax_bar, ax_pie) = plt.subplots(1, 2, figsize=(14, 5))
colors = ["#E74C3C", "#2ECC71"]   # Red=Dropout, Green=Completed

# --- Bar chart (left) ---
bars = ax_bar.bar(
    completion_counts["status"],
    completion_counts["count"],
    color=colors, edgecolor="white", linewidth=1.5, width=0.5
)
for bar, count in zip(bars, completion_counts["count"]):
    ax_bar.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + max(completion_counts["count"]) * 0.02,
        f"{count:,}",
        ha="center", va="bottom", fontsize=13, fontweight="bold"
    )
ax_bar.set_title("Completion vs. Dropout (Count)", fontsize=14, fontweight="bold")
ax_bar.set_xlabel("Status", fontsize=12)
ax_bar.set_ylabel("Number of Learners", fontsize=12)
ax_bar.set_ylim(0, max(completion_counts["count"]) * 1.15)

# --- Pie chart (right) ---
ax_pie.pie(
    completion_counts["count"],
    labels=completion_counts["status"],
    colors=colors,
    autopct="%1.1f%%",
    startangle=90,
    textprops={"fontsize": 13, "fontweight": "bold"},
    wedgeprops={"edgecolor": "white", "linewidth": 2}
)
ax_pie.set_title("Completion vs. Dropout (Ratio)", fontsize=14, fontweight="bold")

plt.tight_layout()
fig1.savefig("completion_vs_dropout.png", dpi=150, bbox_inches="tight")
print("\n[✓] Saved: completion_vs_dropout.png")
plt.close(fig1)

# ── 8b. FEATURE IMPORTANCE (Logistic Regression Coefficients) ────────────
# The coefficient of each feature tells us:
#   Positive → increases chance of completion
#   Negative → decreases chance of completion
#   Larger absolute value → stronger influence
coefficients = lr_model.coefficients.toArray()

importance_df = pd.DataFrame({
    "feature": feature_columns,
    "coefficient": coefficients,
    "abs_coeff": [abs(c) for c in coefficients]
}).sort_values("abs_coeff", ascending=True)    # Sorted for horizontal bar

fig2, ax2 = plt.subplots(figsize=(11, 7))

bar_colors = ["#2ECC71" if c > 0 else "#E74C3C" for c in importance_df["coefficient"]]
ax2.barh(
    importance_df["feature"],
    importance_df["coefficient"],
    color=bar_colors, edgecolor="white", linewidth=0.8, height=0.6
)
ax2.set_title("Feature Importance (Logistic Regression Coefficients)",
              fontsize=14, fontweight="bold", pad=15)
ax2.set_xlabel("Coefficient Value", fontsize=12)
ax2.axvline(x=0, color="gray", linestyle="--", linewidth=0.8)

# Legend explaining colors
from matplotlib.patches import Patch
legend_items = [
    Patch(facecolor="#2ECC71", label="Positive (helps completion)"),
    Patch(facecolor="#E74C3C", label="Negative (hurts completion)")
]
ax2.legend(handles=legend_items, loc="lower right", fontsize=10)

plt.tight_layout()
fig2.savefig("model_feature_importance.png", dpi=150, bbox_inches="tight")
print("[✓] Saved: model_feature_importance.png")
plt.close(fig2)


# ═══════════════════════════════════════════════════════════════════════════
# SECTION 9 : FINAL SUMMARY & CLEANUP
# ═══════════════════════════════════════════════════════════════════════════

print("\n" + "=" * 70)
print("  FINAL SUMMARY")
print("=" * 70)
print(f"  Total raw records loaded    : {total_raw:,}")
print(f"  Records after cleaning      : {after_filter:,}")
print(f"  Invalid records removed     : {removed:,}")
print(f"  Training set size           : {train_count:,}")
print(f"  Testing set size            : {test_count:,}")
print(f"  Number of features used     : {len(feature_columns)}")
print(f"  Model Accuracy              : {accuracy * 100:.2f}%")
print(f"  Model F1-Score              : {f1_score:.4f}")
print(f"  Model AUC-ROC               : {auc_roc:.4f}")
print("=" * 70)
print("  Output files generated:")
print("    → completion_vs_dropout.png")
print("    → model_feature_importance.png")
print("=" * 70)

# ── Stop Spark (releases all resources) ───────────────────────────────────
spark.stop()
print("\n[✓] Spark session stopped. Pipeline complete!")