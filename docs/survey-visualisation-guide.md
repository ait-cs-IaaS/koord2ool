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
| Numerical (`numerical`) | Candlestick | High/low values over time |
| Multiple Short Text (`multipleshorttext`) | Area | Distribution visualization |
| Multiple Choice (`multiplechoice`) | Area | Distribution visualization |

## Visualization Types Explained

### Line Charts (Timeline Visualization)

**Used for:** Yes/No, List Dropdown, Bootstrap Dropdown, and List Radio questions

Line charts in Koord2ool display how responses change over time, allowing you to track trends and patterns in participant answers.

![Line Chart Example](images/line_chart_example.png)

**How to read this visualization:**
- The X-axis represents time (date)
- The Y-axis represents response values or counts
- Each line typically represents a different answer option
- Points on the line indicate individual responses or aggregated data points
- Line slopes show trends in the response data over time

**Example:** For Yes/No questions, the line chart might show the percentage of "Yes" responses over time, making it easy to identify when opinions shifted.

### Candlestick Charts (Numerical Data)

**Used for:** Numerical input questions

Candlestick charts visualize the range of numerical responses over time, making them ideal for tracking metrics that fluctuate.

![Candlestick Chart Example](images/candlestick_example.png)

**How to read this visualization:**
- The X-axis represents time (date)
- The Y-axis represents the numerical values
- Each "candle" represents a time period (typically a day)
- The "body" of the candle shows the range between opening and closing values
- The "wicks" or "shadows" show the highest and lowest values during that period

**Example:** For a numerical question asking about temperature, the candlestick chart will show the range of temperatures reported on each day, with highs and lows clearly visible.

### Area Charts (Distribution Visualization)

**Used for:** Multiple Short Text and Multiple Choice questions

Area charts in Koord2ool show how the distribution of different responses changes over time, stacked to show relative proportions.

![Area Chart Example](images/area_chart_example.png)

**How to read this visualization:**
- The X-axis represents time (date)
- The Y-axis represents counts or percentages
- Each colored area represents a different answer option
- The height of each colored section shows the relative proportion of that response
- The total height at any point shows the total number of responses

**Example:** For multiple choice questions, the area chart will show how the popularity of each option changed over the course of the survey period.

## Settings and Customizations

### Time Format Options

Koord2ool provides two time format options that affect how temporal data is displayed:

1. **Real Time Format**
   - Shows actual timestamps of survey responses
   - Best for seeing precise timing of individual responses
   - Most useful for candlestick charts and when timing is critical

2. **Stepped Time Format**
   - Aggregates responses based on configurable time steps (1, 6, or 24 hours)
   - Smooths out data to show trends more clearly
   - Useful for line and area charts to reduce noise

![Time Format Settings](images/time_format_settings.png)

### Display Options

Additional visualization settings include:

- **Show/Hide N/A:** Toggle visibility of N/A responses in charts
- **Active Answers Only:** Choose to show only the latest response from each participant
- **Expiration Time:** Configure how long responses remain "active" (1 day to 1 year)

![Display Settings](images/display_settings.png)

## Detailed Examples by Question Type

### Yes/No Questions

LimeSurvey Configuration:
- Select "Yes/No" question type
- Set a clear question

![Yes/No Configuration](images/yesno_config.png)

Koord2ool Visualization:
- Displayed as a line chart
- Yes/No options tracked over time
- Optional doughnut chart for aggregate view

![Yes/No Visualization](images/yesno_visualization.png)

### List Dropdown / Bootstrap Dropdown / List Radio

LimeSurvey Configuration:
- Create dropdown or radio options
- Provide clear option labels

![Dropdown Configuration](images/dropdown_config.png)

Koord2ool Visualization:
- Displayed as a line chart
- Each option tracked as a separate line
- Trends in selection visible over time

![Dropdown Visualization](images/dropdown_visualization.png)

### Numerical Questions

LimeSurvey Configuration:
- Set appropriate min/max values (if desired)
- Consider adding a unit label

![Numerical Configuration](images/numerical_config.png)

Koord2ool Visualization:
- Displayed as a candlestick chart in real time mode
- Displayed as a line chart showing averages in stepped time mode
- High/low ranges clearly visible

![Numerical Visualization](images/numerical_visualization.png)

### Multiple Short Text

LimeSurvey Configuration:
- Create multiple text input fields
- Give each subquestion a descriptive label

![Multiple Short Text Configuration](images/shorttext_config.png)

Koord2ool Visualization:
- Displayed as an area chart
- Each subquestion tracked as a separate area
- Proportional representation over time

![Multiple Short Text Visualization](images/shorttext_visualization.png)

### Multiple Choice

LimeSurvey Configuration:
- Create checkbox options
- Provide clear descriptions for each option

![Multiple Choice Configuration](images/multiplechoice_config.png)

Koord2ool Visualization:
- Displayed as an area chart
- Each option shown as a colored area
- Changes in selection patterns visible over time

![Multiple Choice Visualization](images/multiplechoice_visualization.png)

## Best Practices for Visualization

### Question Design for Optimal Visualization

1. **Keep options consistent:** Changing question options mid-survey can lead to confusing visualizations.
2. **Use clear, concise labels:** Short labels display better in legends and tooltips.
3. **Group related questions:** Questions in the same group are easier to compare.
4. **Consider data types carefully:** Choose the question type based on what visualization would best represent your data.

### Interpreting the Data

1. **Look for trends:** The primary value of time-based visualizations is spotting trends over time.
2. **Consider external factors:** Correlate changes in responses with external events or interventions.
3. **Watch for outliers:** Particularly in numerical data, outliers can skew visualizations.
4. **Compare related questions:** Look for correlations between answers to different questions.

### Time-based Analysis Tips

1. **Choose appropriate time steps:** For infrequent surveys, larger time steps may show trends more clearly.
2. **Consider response expiration:** Setting appropriate expiration times can help focus on relevant data.
3. **Analyze both aggregate and timeline views:** Use both perspectives to get a complete picture.
4. **Export data for deeper analysis:** For complex analysis, consider exporting visualization data.



