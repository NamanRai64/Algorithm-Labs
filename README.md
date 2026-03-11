# AlgorithmLab — Divide & Conquer Visualizer

An interactive web application that visualizes **8 Divide and Conquer algorithms** with step-by-step animations, clear explanations of the divide/conquer/combine phases, and time complexity analysis with recurrence relations.

## Features

- **Step-by-step visualization/animation** for each algorithm with play, pause, step forward/back, and reset controls
- **Clear phase highlighting** — each step is tagged as Divide, Conquer, or Combine with color-coded indicators
- **Time complexity analysis** with recurrence relations, Big-O notation, and space complexity
- **Adjustable animation speed** (0.5× to 3×)
- **Randomized inputs** — generate new test data with one click
- **Clean, modern dark-themed UI** with glassmorphism design
- **Responsive layout** — works on desktop and mobile

## Algorithms

| # | Algorithm | Category | Recurrence | Time Complexity |
|---|-----------|----------|-----------|-----------------|
| 1 | Merge Sort | Sorting | T(n) = 2T(n/2) + O(n) | O(n log n) |
| 2 | Quick Sort | Sorting | T(n) = T(k) + T(n−k−1) + O(n) | O(n log n) avg |
| 3 | Matrix Multiply (D&C) | Matrix | T(n) = 8T(n/2) + O(n²) | O(n³) |
| 4 | Strassen's Multiply | Matrix | T(n) = 7T(n/2) + O(n²) | O(n^2.807) |
| 5 | Min & Max Finding | Search | T(n) = 2T(n/2) + 2 | O(n) |
| 6 | Largest Subarray Sum | Search | T(n) = 2T(n/2) + O(n) | O(n log n) |
| 7 | Closest Pair of Points | Geometry | T(n) = 2T(n/2) + O(n log n) | O(n log² n) |
| 8 | Convex Hull | Geometry | T(n) = 2T(n/2) + O(n) | O(n log n) |

## How to Run

1. Download or clone the project files.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. No server, build tools, or dependencies required.

## Project Structure

```
AlgorithmLab/
├── index.html              # Main page with layout, navigation, and controls
├── styles.css              # Design system (dark theme, animations, responsive)
├── app.js                  # Core app controller, animation engine, shared utilities
├── algorithms/
│   ├── mergeSort.js        # Merge Sort visualization
│   ├── quickSort.js        # Quick Sort visualization
│   ├── matrixMultiply.js   # Naive D&C Matrix Multiplication
│   ├── strassen.js         # Strassen's Matrix Multiplication
│   ├── minMax.js           # Min & Max Finding
│   ├── largestSubarray.js  # Maximum Subarray Sum
│   ├── closestPair.js      # Closest Pair of Points
│   └── convexHull.js       # Convex Hull
└── README.md               # This file
```

## Implementation Details

### Architecture

- **No frameworks or build tools** — pure HTML, CSS, and vanilla JavaScript
- **Module pattern**: Each algorithm is a self-contained module that registers with the core `AlgorithmLab` controller
- **Animation engine**: A step-based queue system with play/pause/step-forward/step-back/reset functionality
- **Shared rendering**: Common visualization helpers (bar charts, array displays, matrix views, 2D canvas) used across algorithms

### Visualization Types

- **Bar Charts**: Used by Merge Sort, Quick Sort, Min/Max, and Largest Subarray Sum
- **Matrix Grids**: Used by Matrix Multiplication and Strassen's Algorithm
- **2D Canvas**: Used by Closest Pair of Points and Convex Hull for point/polygon rendering

### Design

- Premium dark theme with glassmorphism panels
- Color-coded phases: Cyan (Divide), Purple (Conquer), Emerald (Combine)
- Category colors: Sorting (Cyan), Matrix (Purple), Search (Amber), Geometry (Emerald)
- Smooth CSS transitions and micro-animations
- Google Fonts: Inter (UI) + JetBrains Mono (code/values)

## Browser Compatibility

Tested on modern browsers supporting ES6+, CSS Grid, Flexbox, and Canvas API:
- Google Chrome 90+
- Mozilla Firefox 88+
- Microsoft Edge 90+
- Safari 14+

## Author

Created for Design and Analysis of Algorithms (DAA) Lab.
