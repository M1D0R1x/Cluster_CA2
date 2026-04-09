const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Project 4x Team";
pres.title = "MOOC Course Completion Prediction";

// ── Color Palette: Ocean Gradient ────────────────────────────────
const C = {
  navy:      "0F2B46",
  teal:      "0D7377",
  mint:      "14B8A6",
  light:     "F0FDFA",
  white:     "FFFFFF",
  dark:      "1E293B",
  gray:      "64748B",
  red:       "E74C3C",
  green:     "2ECC71",
  accent:    "065A82",
  bg:        "F8FAFC",
};

const TITLE_FONT = "Georgia";
const BODY_FONT  = "Calibri";

const makeShadow = () => ({
  type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12
});

// ═══════════════════════════════════════════════════════════════
// SLIDE 1 : TITLE SLIDE
// ═══════════════════════════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: C.navy };

s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 3.8, w: 10, h: 1.85, fill: { color: C.teal, transparency: 30 }
});

s1.addText("MOOC Course Completion\nPrediction", {
  x: 0.8, y: 0.8, w: 8.4, h: 2.2,
  fontFace: TITLE_FONT, fontSize: 38, color: C.white, bold: true,
  lineSpacingMultiple: 1.1
});

s1.addText("Using Apache Spark MLlib & Logistic Regression", {
  x: 0.8, y: 2.9, w: 8.4, h: 0.5,
  fontFace: BODY_FONT, fontSize: 18, color: C.mint, italic: true
});

s1.addText([
  { text: "Project 4x  |  Big Data Analytics", options: { breakLine: true } },
  { text: "Python 3.11  •  PySpark  •  Spark MLlib  •  Matplotlib" }
], {
  x: 0.8, y: 4.0, w: 8.4, h: 1.2,
  fontFace: BODY_FONT, fontSize: 14, color: C.white
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 2 : PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: C.bg };

s2.addText("Problem Statement", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

// Left card
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 1.3, w: 4.2, h: 3.5,
  fill: { color: C.white }, shadow: makeShadow()
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 1.3, w: 0.08, h: 3.5, fill: { color: C.red }
});
s2.addText("The Challenge", {
  x: 0.95, y: 1.45, w: 3.7, h: 0.45,
  fontFace: TITLE_FONT, fontSize: 18, color: C.red, bold: true, margin: 0
});
s2.addText([
  { text: "MOOCs suffer from extremely high dropout rates — often 85-95% of enrolled learners never complete the course.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "Early identification of at-risk learners can enable timely interventions (reminders, support, adaptive content).", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "We need a predictive model that uses clickstream behavior data to flag dropouts before they leave." }
], {
  x: 0.95, y: 2.0, w: 3.6, h: 2.5,
  fontFace: BODY_FONT, fontSize: 13, color: C.dark, lineSpacingMultiple: 1.2
});

// Right card
s2.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.3, w: 4.2, h: 3.5,
  fill: { color: C.white }, shadow: makeShadow()
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.3, w: 0.08, h: 3.5, fill: { color: C.green }
});
s2.addText("Our Approach", {
  x: 5.55, y: 1.45, w: 3.7, h: 0.45,
  fontFace: TITLE_FONT, fontSize: 18, color: C.teal, bold: true, margin: 0
});
s2.addText([
  { text: "Use 100K student interaction records from a MOOC platform.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "Build a Logistic Regression classifier using Spark MLlib.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "Leverage 21 behavioral features: video activity, quiz scores, session patterns, engagement metrics." }
], {
  x: 5.55, y: 2.0, w: 3.6, h: 2.5,
  fontFace: BODY_FONT, fontSize: 13, color: C.dark, lineSpacingMultiple: 1.2
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 3 : DATASET OVERVIEW
// ═══════════════════════════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: C.bg };

s3.addText("Dataset Overview", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

// Big stat callouts
const stats = [
  { val: "100K+", label: "Student Records", color: C.teal },
  { val: "39", label: "Columns", color: C.accent },
  { val: "8", label: "Courses", color: C.navy },
  { val: "21", label: "ML Features", color: C.mint },
];
stats.forEach((s, i) => {
  const xPos = 0.6 + i * 2.3;
  s3.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.2, w: 2.0, h: 1.3,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s3.addText(s.val, {
    x: xPos, y: 1.25, w: 2.0, h: 0.75,
    fontFace: TITLE_FONT, fontSize: 36, color: s.color, bold: true,
    align: "center", valign: "middle"
  });
  s3.addText(s.label, {
    x: xPos, y: 2.0, w: 2.0, h: 0.4,
    fontFace: BODY_FONT, fontSize: 12, color: C.gray,
    align: "center", valign: "middle"
  });
});

// Column categories table
const tableData = [
  [
    { text: "Category", options: { fill: { color: C.navy }, color: C.white, bold: true, fontFace: BODY_FONT, fontSize: 12, align: "center" } },
    { text: "Key Columns", options: { fill: { color: C.navy }, color: C.white, bold: true, fontFace: BODY_FONT, fontSize: 12, align: "center" } },
  ],
  [
    { text: "Demographics", options: { fontFace: BODY_FONT, fontSize: 11, bold: true, color: C.dark } },
    { text: "Age, Gender, City, Education_Level, Employment_Status", options: { fontFace: BODY_FONT, fontSize: 11, color: C.dark } },
  ],
  [
    { text: "Engagement", options: { fontFace: BODY_FONT, fontSize: 11, bold: true, color: C.dark } },
    { text: "Login_Frequency, Video_Completion_Rate, Quiz_Score_Avg, Time_Spent_Hours", options: { fontFace: BODY_FONT, fontSize: 11, color: C.dark } },
  ],
  [
    { text: "Assessments", options: { fontFace: BODY_FONT, fontSize: 11, bold: true, color: C.dark } },
    { text: "Assignments_Submitted, Quiz_Attempts, Project_Grade, Progress_Percentage", options: { fontFace: BODY_FONT, fontSize: 11, color: C.dark } },
  ],
  [
    { text: "Target", options: { fontFace: BODY_FONT, fontSize: 11, bold: true, color: C.red } },
    { text: "Completed  →  'Completed' or 'Not Completed'  (Binary Classification)", options: { fontFace: BODY_FONT, fontSize: 11, color: C.red } },
  ],
];

s3.addTable(tableData, {
  x: 0.6, y: 2.85, w: 8.8, h: 2.2,
  border: { pt: 0.5, color: "E2E8F0" },
  colW: [2.2, 6.6],
  rowH: [0.35, 0.35, 0.35, 0.35, 0.35],
  autoPage: false,
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 4 : PIPELINE / METHODOLOGY
// ═══════════════════════════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: C.bg };

s4.addText("Pipeline & Methodology", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

const steps = [
  { num: "1", title: "Load Data", desc: "Read 100K-row CSV into Spark DataFrame with schema inference", color: C.accent },
  { num: "2", title: "Clean & Filter", desc: "Fill nulls with median, remove negative durations & zero sessions", color: C.teal },
  { num: "3", title: "Feature Engineering", desc: "21 features → VectorAssembler → StandardScaler (mean=0, std=1)", color: C.mint },
  { num: "4", title: "Train Model", desc: "80/20 split → Logistic Regression (Pipeline: Assemble→Scale→LR)", color: C.navy },
  { num: "5", title: "Evaluate", desc: "Accuracy, F1-Score, AUC-ROC, Precision, Recall + Confusion Matrix", color: C.accent },
  { num: "6", title: "Visualize", desc: "Completion vs Dropout bar/pie chart + Feature Importance chart", color: C.teal },
];

steps.forEach((step, i) => {
  const yPos = 1.25 + i * 0.68;

  // Number circle (simulated with oval)
  s4.addShape(pres.shapes.OVAL, {
    x: 0.7, y: yPos, w: 0.5, h: 0.5,
    fill: { color: step.color }
  });
  s4.addText(step.num, {
    x: 0.7, y: yPos, w: 0.5, h: 0.5,
    fontFace: TITLE_FONT, fontSize: 16, color: C.white, bold: true,
    align: "center", valign: "middle"
  });

  // Title + Description
  s4.addText(step.title, {
    x: 1.4, y: yPos - 0.02, w: 2.5, h: 0.5,
    fontFace: TITLE_FONT, fontSize: 15, color: C.dark, bold: true,
    valign: "middle", margin: 0
  });
  s4.addText(step.desc, {
    x: 3.8, y: yPos - 0.02, w: 5.6, h: 0.5,
    fontFace: BODY_FONT, fontSize: 12, color: C.gray,
    valign: "middle", margin: 0
  });
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 5 : DATA CLEANING DETAILS
// ═══════════════════════════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: C.bg };

s5.addText("Data Cleaning & Preprocessing", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

const cleanSteps = [
  { title: "Target Encoding", desc: "Converted \"Completed\" → 1, \"Not Completed\" → 0 for binary classification." },
  { title: "Null Handling", desc: "Identified nulls in numeric columns. Filled missing values using column median (approxQuantile for efficiency)." },
  { title: "Invalid Record Filtering", desc: "Removed rows with negative session durations (bad logs), zero login frequency (impossible records), and invalid ages." },
  { title: "Feature Selection", desc: "Dropped non-numeric identifiers (Student_ID, Name, City, Course_Name). Retained 21 behavioral & course features." },
];

cleanSteps.forEach((item, i) => {
  const yPos = 1.2 + i * 1.05;
  s5.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: yPos, w: 8.8, h: 0.9,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s5.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: yPos, w: 0.08, h: 0.9, fill: { color: C.teal }
  });
  s5.addText(item.title, {
    x: 0.9, y: yPos + 0.05, w: 2.5, h: 0.35,
    fontFace: TITLE_FONT, fontSize: 14, color: C.navy, bold: true, margin: 0
  });
  s5.addText(item.desc, {
    x: 0.9, y: yPos + 0.4, w: 8.2, h: 0.4,
    fontFace: BODY_FONT, fontSize: 12, color: C.gray, margin: 0
  });
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 6 : FEATURE ENGINEERING
// ═══════════════════════════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: C.bg };

s6.addText("Feature Engineering (21 Features)", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

const featureGroups = [
  {
    title: "Video & Content",
    color: C.teal,
    features: ["Video_Completion_Rate", "Rewatch_Count", "Progress_Percentage"],
  },
  {
    title: "Quiz & Assessments",
    color: C.accent,
    features: ["Quiz_Attempts", "Quiz_Score_Avg", "Project_Grade", "Assignments_Submitted", "Assignments_Missed"],
  },
  {
    title: "Session & Login",
    color: C.navy,
    features: ["Login_Frequency", "Avg_Session_Duration", "Time_Spent_Hours", "Days_Since_Last_Login"],
  },
  {
    title: "Engagement",
    color: C.mint,
    features: ["Discussion_Participation", "Peer_Interaction_Score", "Notifications_Checked", "App_Usage_%", "Reminder_Emails_Clicked", "Support_Tickets", "Satisfaction_Rating"],
  },
];

featureGroups.forEach((grp, i) => {
  const xPos = 0.5 + i * 2.4;
  s6.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.2, w: 2.2, h: 4.0,
    fill: { color: C.white }, shadow: makeShadow()
  });
  // Header bar
  s6.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.2, w: 2.2, h: 0.55,
    fill: { color: grp.color }
  });
  s6.addText(grp.title, {
    x: xPos, y: 1.2, w: 2.2, h: 0.55,
    fontFace: TITLE_FONT, fontSize: 13, color: C.white, bold: true,
    align: "center", valign: "middle"
  });

  const featureText = grp.features.map((f, fi) => ({
    text: `${fi + 1}. ${f}`,
    options: { breakLine: true, paraSpaceAfter: 5 }
  }));
  s6.addText(featureText, {
    x: xPos + 0.15, y: 1.9, w: 1.9, h: 3.1,
    fontFace: BODY_FONT, fontSize: 10.5, color: C.dark, valign: "top"
  });
});

// Bottom note
s6.addText("VectorAssembler → StandardScaler (mean=0, std=1) → Logistic Regression", {
  x: 0.6, y: 5.15, w: 8.8, h: 0.35,
  fontFace: BODY_FONT, fontSize: 12, color: C.gray, italic: true, align: "center"
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 7 : MODEL & RESULTS
// ═══════════════════════════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: C.bg };

s7.addText("Model Results", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

s7.addText("Logistic Regression  •  80/20 Train-Test Split  •  regParam=0.01  •  maxIter=100", {
  x: 0.6, y: 0.95, w: 8.8, h: 0.35,
  fontFace: BODY_FONT, fontSize: 12, color: C.gray, italic: true
});

// Metric cards — placeholder values, update after running
const metrics = [
  { name: "Accuracy",  val: "XX.X%",  desc: "Correct predictions",             color: C.teal },
  { name: "F1-Score",  val: "X.XXX",  desc: "Precision-Recall balance",        color: C.accent },
  { name: "AUC-ROC",   val: "X.XXX",  desc: "Ranking quality",                 color: C.navy },
  { name: "Precision",  val: "X.XXX",  desc: "True positive rate",             color: C.mint },
];
metrics.forEach((m, i) => {
  const xPos = 0.5 + i * 2.4;
  s7.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: 1.5, w: 2.2, h: 1.6,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s7.addText(m.name, {
    x: xPos, y: 1.55, w: 2.2, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: C.gray,
    align: "center", valign: "middle", bold: true
  });
  s7.addText(m.val, {
    x: xPos, y: 1.9, w: 2.2, h: 0.7,
    fontFace: TITLE_FONT, fontSize: 32, color: m.color,
    align: "center", valign: "middle", bold: true
  });
  s7.addText(m.desc, {
    x: xPos, y: 2.65, w: 2.2, h: 0.35,
    fontFace: BODY_FONT, fontSize: 10, color: C.gray,
    align: "center", valign: "middle"
  });
});

s7.addText("* Replace XX values with actual results after running the pipeline.", {
  x: 0.6, y: 3.4, w: 8.8, h: 0.35,
  fontFace: BODY_FONT, fontSize: 11, color: C.red, italic: true
});

// Confusion matrix placeholder
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 3.9, w: 8.8, h: 1.4,
  fill: { color: C.white }, shadow: makeShadow()
});
s7.addText("Confusion Matrix", {
  x: 0.8, y: 3.95, w: 4, h: 0.35,
  fontFace: TITLE_FONT, fontSize: 14, color: C.navy, bold: true, margin: 0
});
const cmTable = [
  [
    { text: "", options: { fill: { color: C.light } } },
    { text: "Pred: Dropout", options: { fill: { color: C.navy }, color: C.white, bold: true, fontFace: BODY_FONT, fontSize: 11, align: "center" } },
    { text: "Pred: Completed", options: { fill: { color: C.navy }, color: C.white, bold: true, fontFace: BODY_FONT, fontSize: 11, align: "center" } },
  ],
  [
    { text: "Actual: Dropout", options: { fill: { color: C.light }, bold: true, fontFace: BODY_FONT, fontSize: 11 } },
    { text: "TN", options: { fontFace: BODY_FONT, fontSize: 14, align: "center", bold: true, color: C.green } },
    { text: "FP", options: { fontFace: BODY_FONT, fontSize: 14, align: "center", bold: true, color: C.red } },
  ],
  [
    { text: "Actual: Completed", options: { fill: { color: C.light }, bold: true, fontFace: BODY_FONT, fontSize: 11 } },
    { text: "FN", options: { fontFace: BODY_FONT, fontSize: 14, align: "center", bold: true, color: C.red } },
    { text: "TP", options: { fontFace: BODY_FONT, fontSize: 14, align: "center", bold: true, color: C.green } },
  ],
];
s7.addTable(cmTable, {
  x: 2.5, y: 4.35, w: 5.0, h: 0.85,
  border: { pt: 0.5, color: "E2E8F0" },
  colW: [1.8, 1.6, 1.6],
  autoPage: false,
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 8 : VISUALIZATIONS
// ═══════════════════════════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: C.bg };

s8.addText("Visualizations", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

// Left placeholder card
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.2, w: 4.3, h: 3.5,
  fill: { color: C.white }, shadow: makeShadow()
});
s8.addText("Completion vs. Dropout Ratio", {
  x: 0.7, y: 1.35, w: 3.9, h: 0.4,
  fontFace: TITLE_FONT, fontSize: 14, color: C.navy, bold: true, margin: 0
});
s8.addText("(Insert completion_vs_dropout.png here)\n\nBar + Pie chart showing the class distribution of Completed vs. Dropout learners in the dataset.", {
  x: 0.7, y: 2.0, w: 3.9, h: 2.3,
  fontFace: BODY_FONT, fontSize: 12, color: C.gray, align: "center", valign: "middle"
});

// Right placeholder card
s8.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.2, w: 4.3, h: 3.5,
  fill: { color: C.white }, shadow: makeShadow()
});
s8.addText("Feature Importance", {
  x: 5.4, y: 1.35, w: 3.9, h: 0.4,
  fontFace: TITLE_FONT, fontSize: 14, color: C.navy, bold: true, margin: 0
});
s8.addText("(Insert model_feature_importance.png here)\n\nHorizontal bar chart showing LR coefficients — green = helps completion, red = hurts completion.", {
  x: 5.4, y: 2.0, w: 3.9, h: 2.3,
  fontFace: BODY_FONT, fontSize: 12, color: C.gray, align: "center", valign: "middle"
});

s8.addText("Replace placeholders with the actual PNG charts generated by the pipeline.", {
  x: 0.6, y: 4.9, w: 8.8, h: 0.35,
  fontFace: BODY_FONT, fontSize: 11, color: C.red, italic: true, align: "center"
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 9 : KEY FINDINGS
// ═══════════════════════════════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: C.bg };

s9.addText("Key Findings", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

const findings = [
  { title: "Video Completion Rate", desc: "Students who watched more videos had significantly higher completion rates. This was one of the strongest predictors." },
  { title: "Quiz Engagement", desc: "Both quiz attempts and average quiz scores strongly correlate with course completion — active assessment drives retention." },
  { title: "Session Patterns", desc: "Higher login frequency and longer session durations indicate sustained commitment — key behavioral signals." },
  { title: "Recency Matters", desc: "Days Since Last Login is a powerful dropout indicator — students who stop logging in rarely return." },
  { title: "Assignments Are Critical", desc: "Assignments submitted vs. missed ratio is a direct predictor — missing assignments is the strongest dropout signal." },
];

findings.forEach((f, i) => {
  const yPos = 1.1 + i * 0.88;
  s9.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: yPos, w: 8.8, h: 0.75,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s9.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: yPos, w: 0.08, h: 0.75, fill: { color: C.teal }
  });
  s9.addText(f.title, {
    x: 0.9, y: yPos + 0.05, w: 2.8, h: 0.65,
    fontFace: TITLE_FONT, fontSize: 13, color: C.navy, bold: true, valign: "middle", margin: 0
  });
  s9.addText(f.desc, {
    x: 3.7, y: yPos + 0.05, w: 5.5, h: 0.65,
    fontFace: BODY_FONT, fontSize: 12, color: C.gray, valign: "middle", margin: 0
  });
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 10 : TECH STACK & TOOLS
// ═══════════════════════════════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: C.bg };

s10.addText("Tech Stack & Tools", {
  x: 0.6, y: 0.3, w: 8.8, h: 0.7,
  fontFace: TITLE_FONT, fontSize: 32, color: C.navy, bold: true, margin: 0
});

const tools = [
  { name: "Python 3.11",       role: "Primary language",                    color: C.accent },
  { name: "PySpark 3.5",       role: "Distributed data processing",         color: C.teal },
  { name: "Spark MLlib",       role: "ML Pipeline, Logistic Regression",    color: C.navy },
  { name: "VectorAssembler",   role: "Feature vector creation",             color: C.mint },
  { name: "StandardScaler",    role: "Feature normalization",               color: C.accent },
  { name: "Matplotlib",        role: "Chart generation (PNG output)",       color: C.teal },
  { name: "Seaborn",           role: "Statistical plot styling",            color: C.navy },
  { name: "PyCharm",           role: "IDE for development",                 color: C.mint },
  { name: "GitHub",            role: "Version control & code hosting",      color: C.accent },
];

tools.forEach((t, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const xPos = 0.5 + col * 3.15;
  const yPos = 1.2 + row * 1.35;

  s10.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 2.9, h: 1.1,
    fill: { color: C.white }, shadow: makeShadow()
  });
  s10.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: yPos, w: 2.9, h: 0.06, fill: { color: t.color }
  });
  s10.addText(t.name, {
    x: xPos + 0.15, y: yPos + 0.15, w: 2.6, h: 0.4,
    fontFace: TITLE_FONT, fontSize: 14, color: C.dark, bold: true, margin: 0
  });
  s10.addText(t.role, {
    x: xPos + 0.15, y: yPos + 0.55, w: 2.6, h: 0.4,
    fontFace: BODY_FONT, fontSize: 11, color: C.gray, margin: 0
  });
});


// ═══════════════════════════════════════════════════════════════
// SLIDE 11 : CONCLUSION + GITHUB LINK
// ═══════════════════════════════════════════════════════════════
let s11 = pres.addSlide();
s11.background = { color: C.navy };

s11.addText("Conclusion", {
  x: 0.8, y: 0.5, w: 8.4, h: 0.8,
  fontFace: TITLE_FONT, fontSize: 36, color: C.white, bold: true
});

s11.addText([
  { text: "We successfully built a Spark MLlib pipeline that predicts MOOC course completion from learner clickstream data with high accuracy.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "Video engagement, quiz performance, and assignment submission are the strongest completion predictors.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "The model can be deployed to identify at-risk learners early and trigger interventions.", options: { breakLine: true, paraSpaceAfter: 10 } },
  { text: "Future work: Random Forest, GBT classifiers, categorical feature encoding.", options: {} }
], {
  x: 0.8, y: 1.4, w: 8.4, h: 2.5,
  fontFace: BODY_FONT, fontSize: 14, color: C.white, lineSpacingMultiple: 1.25
});

// GitHub link box
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 4.2, w: 8.4, h: 1.0,
  fill: { color: C.teal, transparency: 20 }
});
s11.addText([
  { text: "GitHub Repository:", options: { bold: true, breakLine: true } },
  { text: "https://github.com/YOUR_USERNAME/mooc-completion-prediction", options: {} }
], {
  x: 1.0, y: 4.25, w: 8.0, h: 0.9,
  fontFace: BODY_FONT, fontSize: 16, color: C.white,
  align: "center", valign: "middle"
});


// ═══════════════════════════════════════════════════════════════
// SAVE THE PRESENTATION
// ═══════════════════════════════════════════════════════════════
pres.writeFile({ fileName: "/Users/veera/Desktop/Cluster_CA2/MOOC_Completion_Prediction.pptx" })
  .then(() => console.log("PPT saved successfully!"))
  .catch(err => console.error("Error:", err));