# Koord2ool Supported Question Types & Visualizations

This document details the LimeSurvey question types supported by Koord2ool and explains how each type is visualized in the application.

## Overview of Supported Question Types

Koord2ool supports the following LimeSurvey question types:

| LimeSurvey Question Type | Chart Type | Visualization |
|--------------------------|------------|---------------|
| Yes/No (`yesno`) | Line | Timeline-based visualization |
| List Dropdown (`list_dropdown`) | Line | Timeline-based visualization |
| Bootstrap Dropdown (`bootstrap_dropdown`) | Line | Timeline-based visualization |
| List Radio (`listradio`) | Line | Timeline-based visualization |
| Numerical (`numerical`) | Histogram | Distribution of numerical responses across value ranges |
| Multiple Short Text (`multipleshorttext`) | Area | Distribution visualization |
| Multiple Choice (`multiplechoice`) | Area | Distribution visualization |

---

## **Line Charts (Timeline Visualization)**

**Used for:** Yes/No, List Dropdown, Bootstrap Dropdown, and List Radio questions  

### **Visualization Details**
- **Chart Type:** Line chart
- **Purpose:** Tracks changes in responses over time
- **Displayed Data:** Individual responses or aggregated trends  

### **Graph Interpretation**
- **X-Axis:** Time (dates of responses)
- **Y-Axis:** Response values or counts  
- **Lines:** Represent different answer choices  
- **Trends:** Show how responses change over time  

### **Tooltip Functionality**
- Displays exact response values for each time point  
- Helps identify fluctuations or response patterns  

### **Displayed Responses**
- Only **active** responses are shown  
- Filters can hide/show `N/A` responses  

---

## **Histogram (Numerical Data)**

**Used for:** Numerical input questions  

### **Visualization Details**
- **Chart Type:** Histogram & Time Series  
- **Purpose:** Shows the distribution of numerical responses and trends over time  
- **Displayed Data:** Responses grouped into bins  

### **Graph Interpretation**
- **X-Axis (Histogram):** Numerical value ranges (e.g., `3-7°C`, `7-10°C`)  
- **Y-Axis (Histogram):** Number of responses per range  
- **X-Axis (Time Series):** Time (response dates)  

### **How Bins are Created**
1. Responses are converted to numbers and rounded  
2. Unique values are detected  
3. If unique values ≤ `maxBins`, each value becomes its own bin  
4. Otherwise, responses are grouped into evenly spaced ranges  
5. Bin labels can be a **single value** (`10`) or a **range** (`7 - 10`)  

### **Tooltip Functionality**
- Displays bin range (e.g., `7 - 10`)  
- Shows total response count in that bin  
- Shows percentage of total responses  

### **Displayed Responses**
- Only **active** responses are shown  
- Filters can hide/show `N/A` responses  

---

## **Area Charts (Distribution Visualization)**

**Used for:** Multiple Short Text and Multiple Choice questions  

### **Visualization Details**
- **Chart Type:** Stacked area chart  
- **Purpose:** Tracks response distribution over time  
- **Displayed Data:** Relative proportions of response options  

### **Graph Interpretation**
- **X-Axis:** Time (dates of responses)  
- **Y-Axis:** Counts or percentages  
- **Colored Areas:** Represent different response options  
- **Total Height:** Represents total number of responses at each point  

### **Tooltip Functionality**
- Displays response breakdown at a given time  
- Highlights trends in response popularity  

### **Displayed Responses**
- Only **active** responses are shown  
- Filters can hide/show `N/A` responses  

---

## **Settings and Customizations**

### **Time Format Options**
1. **Real Time Format:** Uses exact timestamps for precise response tracking  
2. **Stepped Time Format:** Groups responses into time intervals (1, 6, or 24 hours)  

### **Display Options**
- **Show/Hide N/A:** Toggle visibility of missing responses  
- **Active Answers Only:** Display only the latest response per participant  
- **Expiration Time:** Set how long responses remain "active" (1 day to 1 year)  
