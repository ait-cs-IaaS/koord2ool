# Koord2ool Question Types and Visualizations

This guide explains how different LimeSurvey question types are visualized in Koord2ool, how to interpret them, and best practices for setting up your surveys.

## Supported Question Types

Koord2ool supports the following LimeSurvey question types:

1. **Yes/No** (`yesno`) - Visualized as line charts
2. **List Dropdown** (`list_dropdown`) - Visualized as line charts
3. **Bootstrap Dropdown** (`bootstrap_dropdown`) - Visualized as line charts
4. **List Radio** (`listradio`) - Visualized as line charts
5. **Numerical** (`numerical`) - Visualized as candlestick charts
6. **Multiple Short Text** (`multipleshorttext`) - Visualized as area charts
7. **Multiple Choice** (`multiplechoice`) - Visualized as area charts

## Visualization Types

### Numerical Questions (Candlestick Charts)

Numerical questions show the range of numerical values provided by respondents over time.

![Numerical Question Visualization](images/numerical_visualization.png)

**How to read this chart:**
- Each point on the chart represents aggregated data for a specific day
- The "high" and "low" values show the range of responses on that day
- The X-axis shows the date
- The Y-axis shows the numerical value

**Implementation details:**
- Uses candlestick charts for "real" time format
- Aggregates values by day, showing the range within each day
- Automatically calculates min/max values for appropriate scaling

**Best used for:**
- Rating scales (1-10)
- Quantities (how many...)
- Measurements (temperature, distance, etc.)

**In LimeSurvey:**
- Choose the "Numerical input" question type
- Set appropriate min/max values if needed
- Consider adding a unit label for clarity

### Yes/No Questions (Line Charts)

Yes/No questions are visualized using line charts that track responses over time. Koord2ool also provides doughnut charts for aggregate views.

![Yes/No Question Visualization](images/yesno_visualization.png)

**How to read this chart:**
- The line shows the number of responses for each option over time
- The area under the line is filled to enhance visibility
- The tooltip shows details for a specific point in time, including:
  - Date and time
  - Average response value
  - Number of responses
  - Number of participants

**Implementation details:**
- Uses smooth cubic interpolation ("monotone" mode) for line charts
- Fills area under the line for better visibility
- Uses consistent color coding for options across visualizations

**Best used for:**
- Binary choices (Yes/No, True/False)
- Simple approval questions
- Presence/absence questions

**In LimeSurvey:**
- Choose the "Yes/No" question type
- Provide a clear question

### Multiple Choice Questions (Area Charts)

Multiple choice questions are visualized as stacked area charts that show how different selections change over time.

![Multiple Choice Visualization](images/multiplechoice_visualization.png)

**How to read this chart:**
- Each colored area represents a different answer option
- The height of each area shows the number of responses for that option
- Stacking allows you to see both individual option popularity and total responses
- The X-axis shows the date range
- The Y-axis shows the response count

**Implementation details:**
- Tracks changes in user selections over time
- Updates counters when users change their responses
- Maintains a consistent color scheme for each option

**Best used for:**
- Questions with multiple possible selections
- Categorical data
- "Select all that apply" scenarios

**In LimeSurvey:**
- Choose the "Multiple choice" question type
- Provide clear, concise options
- Keep the number of options reasonable for visualization clarity

## Dual Visualization Approach

As shown in the screenshots, Koord2ool provides two visualization methods for most question types:

1. **Temporal Visualization** (right side):
   - Shows how responses change over time
   - Helps identify trends, patterns, and shifts in responses
   - Useful for longitudinal analysis

2. **Aggregate Visualization** (left side - Doughnut Chart):
   - Shows the overall distribution of responses
   - Provides a snapshot view of the data
   - Color-coded to match temporal visualization
   - Fixed height of 300px for consistent layout
   - Responsive to container width

## Time Format Settings

Koord2ool offers two time format options that affect how temporal data is displayed:

1. **Real Time Format**
   - Shows actual timestamps of survey responses
   - Best for seeing the precise timing of individual responses
   - Most useful for candlestick charts with numerical data

2. **Stepped Time Format**
   - Aggregates responses based on configurable time steps (1, 6, or 24 hours)
   - Smooths out data to show trends more clearly
   - Useful for line and area charts to reduce noise
   - Implementation calculates counters at each time step

## Working with Numerical Data

For numerical questions, Koord2ool provides specialized visualizations:

1. **Candlestick View** (Real Time Format):
   - Shows the high and low range of numerical responses for each day
   - Helps identify daily fluctuations in values
   - Automatically calculates min/max values

2. **Distribution View** (Bar Chart):
   - Shows the frequency distribution of numerical responses
   - Helps identify common values and outliers
   - Provides a quick overview of the data range

## N/A Handling

Koord2ool provides options for handling N/A (Not Applicable) responses:

- You can choose to show or hide N/A values in charts
- When shown, N/A values are treated as a separate category
- The code specifically filters and optionally includes N/A values based on user settings

## Reading the Visualizations

### Doughnut Chart (Aggregate View)

The doughnut chart provides a quick overview of response distribution:

- Each segment represents a different answer option
- The size of each segment shows the proportion of responses for that option
- Color coding matches the temporal visualization for consistency
- Legend shows the name of each option and its count

### Area/Line Charts (Temporal View)

The temporal charts show how responses change over time:

- Each line or area represents a different answer option
- The height shows the number of responses for that option
- Points represent specific data points (can be actual responses or aggregated)
- Hover over points to see detailed information in a tooltip
- Grid lines help track values across time periods

### Interpreting Changes Over Time

When analyzing temporal data, look for:

- **Trends**: Gradual increases or decreases in specific responses
- **Shifts**: Sudden changes that might indicate events or interventions
- **Patterns**: Recurring patterns that might indicate cyclical behavior
- **Convergence/Divergence**: Whether response options are becoming more similar or different over time

## Best Practices

### Survey Design for Optimal Visualization

1. **Use consistent question types** for related data to maintain visualization consistency
2. **Keep multiple choice options concise** to improve readability in legends
3. **Group related questions together** in your LimeSurvey setup
4. **Consider the visualization type** when choosing question types
5. **Use clear question codes** that will be easy to identify in Koord2ool

### Time-based Analysis

1. **Choose appropriate time steps** based on your survey frequency
2. **Consider response expiration settings** based on data relevance
3. **Look for patterns and anomalies** in temporal visualizations
4. **Compare related questions** to identify correlations over time

### Data Interpretation

1. **Hover over charts** to see detailed tooltips with specific values
2. **Pay attention to participant counts** when interpreting results
3. **Use both temporal and aggregate views** for comprehensive analysis
4. **Consider external factors** that might influence changes in responses over time# Koord2ool Question Types and Visualizations

This guide explains how different LimeSurvey question types are visualized in Koord2ool, how to interpret them, and best practices for setting up your surveys.

## Supported Question Types

Koord2ool supports the following LimeSurvey question types:

1. **Yes/No** (`yesno`) - Visualized as line charts
2. **List Dropdown** (`list_dropdown`) - Visualized as line charts
3. **Bootstrap Dropdown** (`bootstrap_dropdown`) - Visualized as line charts
4. **List Radio** (`listradio`) - Visualized as line charts
5. **Numerical** (`numerical`) - Visualized as candlestick charts
6. **Multiple Short Text** (`multipleshorttext`) - Visualized as area charts
7. **Multiple Choice** (`multiplechoice`) - Visualized as area charts

## Visualization Types

### Numerical Questions (Candlestick Charts)

Numerical questions show the range of numerical values provided by respondents over time.

![Numerical Question Visualization](images/numerical_visualization.png)

**How to read this chart:**
- Each point on the chart represents aggregated data for a specific day
- The "high" and "low" values show the range of responses on that day
- The X-axis shows the date
- The Y-axis shows the numerical value

**Implementation details:**
- Uses candlestick charts for "real" time format
- Aggregates values by day, showing the range within each day
- Automatically calculates min/max values for appropriate scaling

**Best used for:**
- Rating scales (1-10)
- Quantities (how many...)
- Measurements (temperature, distance, etc.)

**In LimeSurvey:**
- Choose the "Numerical input" question type
- Set appropriate min/max values if needed
- Consider adding a unit label for clarity

### Yes/No Questions (Line Charts)

Yes/No questions are visualized using line charts that track responses over time. Koord2ool also provides doughnut charts for aggregate views.

![Yes/No Question Visualization](images/yesno_visualization.png)

**How to read this chart:**
- The line shows the number of responses for each option over time
- The area under the line is filled to enhance visibility
- The tooltip shows details for a specific point in time, including:
  - Date and time
  - Average response value
  - Number of responses
  - Number of participants

**Implementation details:**
- Uses smooth cubic interpolation ("monotone" mode) for line charts
- Fills area under the line for better visibility
- Uses consistent color coding for options across visualizations

**Best used for:**
- Binary choices (Yes/No, True/False)
- Simple approval questions
- Presence/absence questions

**In LimeSurvey:**
- Choose the "Yes/No" question type
- Provide a clear question

### Multiple Choice Questions (Area Charts)

Multiple choice questions are visualized as stacked area charts that show how different selections change over time.

![Multiple Choice Visualization](images/multiplechoice_visualization.png)

**How to read this chart:**
- Each colored area represents a different answer option
- The height of each area shows the number of responses for that option
- Stacking allows you to see both individual option popularity and total responses
- The X-axis shows the date range
- The Y-axis shows the response count

**Implementation details:**
- Tracks changes in user selections over time
- Updates counters when users change their responses
- Maintains a consistent color scheme for each option

**Best used for:**
- Questions with multiple possible selections
- Categorical data
- "Select all that apply" scenarios

**In LimeSurvey:**
- Choose the "Multiple choice" question type
- Provide clear, concise options
- Keep the number of options reasonable for visualization clarity

## Dual Visualization Approach

As shown in the screenshots, Koord2ool provides two visualization methods for most question types:

1. **Temporal Visualization** (right side):
   - Shows how responses change over time
   - Helps identify trends, patterns, and shifts in responses
   - Useful for longitudinal analysis

2. **Aggregate Visualization** (left side - Doughnut Chart):
   - Shows the overall distribution of responses
   - Provides a snapshot view of the data
   - Color-coded to match temporal visualization
   - Fixed height of 300px for consistent layout
   - Responsive to container width

## Time Format Settings

Koord2ool offers two time format options that affect how temporal data is displayed:

1. **Real Time Format**
   - Shows actual timestamps of survey responses
   - Best for seeing the precise timing of individual responses
   - Most useful for candlestick charts with numerical data

2. **Stepped Time Format**
   - Aggregates responses based on configurable time steps (1, 6, or 24 hours)
   - Smooths out data to show trends more clearly
   - Useful for line and area charts to reduce noise
   - Implementation calculates counters at each time step

## Working with Numerical Data

For numerical questions, Koord2ool provides specialized visualizations:

1. **Candlestick View** (Real Time Format):
   - Shows the high and low range of numerical responses for each day
   - Helps identify daily fluctuations in values
   - Automatically calculates min/max values

2. **Distribution View** (Bar Chart):
   - Shows the frequency distribution of numerical responses
   - Helps identify common values and outliers
   - Provides a quick overview of the data range

## N/A Handling

Koord2ool provides options for handling N/A (Not Applicable) responses:

- You can choose to show or hide N/A values in charts
- When shown, N/A values are treated as a separate category
- The code specifically filters and optionally includes N/A values based on user settings

## Reading the Visualizations

### Doughnut Chart (Aggregate View)

The doughnut chart provides a quick overview of response distribution:

- Each segment represents a different answer option
- The size of each segment shows the proportion of responses for that option
- Color coding matches the temporal visualization for consistency
- Legend shows the name of each option and its count

### Area/Line Charts (Temporal View)

The temporal charts show how responses change over time:

- Each line or area represents a different answer option
- The height shows the number of responses for that option
- Points represent specific data points (can be actual responses or aggregated)
- Hover over points to see detailed information in a tooltip
- Grid lines help track values across time periods

### Interpreting Changes Over Time

When analyzing temporal data, look for:

- **Trends**: Gradual increases or decreases in specific responses
- **Shifts**: Sudden changes that might indicate events or interventions
- **Patterns**: Recurring patterns that might indicate cyclical behavior
- **Convergence/Divergence**: Whether response options are becoming more similar or different over time

## Best Practices

### Survey Design for Optimal Visualization

1. **Use consistent question types** for related data to maintain visualization consistency
2. **Keep multiple choice options concise** to improve readability in legends
3. **Group related questions together** in your LimeSurvey setup
4. **Consider the visualization type** when choosing question types
5. **Use clear question codes** that will be easy to identify in Koord2ool

### Time-based Analysis

1. **Choose appropriate time steps** based on your survey frequency
2. **Consider response expiration settings** based on data relevance
3. **Look for patterns and anomalies** in temporal visualizations
4. **Compare related questions** to identify correlations over time

### Data Interpretation

1. **Hover over charts** to see detailed tooltips with specific values
2. **Pay attention to participant counts** when interpreting results
3. **Use both temporal and aggregate views** for comprehensive analysis
4. **Consider external factors** that might influence changes in responses over time