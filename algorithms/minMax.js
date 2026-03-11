/* ===== Min and Max Finding (D&C) ===== */
AlgorithmLab.register({
    id: 'minMax',
    name: 'Min & Max Finding',
    category: 'Search & Optimization',
    usesCanvas: false,
    description: `
        <strong>Min & Max Finding</strong> using Divide and Conquer splits the array in half,
        recursively finds the min and max of each half, then combines by comparing the two halves'
        min and max values.
        <br><br>
        <strong>Key Idea:</strong> This approach requires only <strong>3n/2 − 2</strong> comparisons,
        which is fewer than the naive 2(n−1) comparisons when n is large.
    `,
    complexity: {
        recurrence: 'T(n) = 2T(n/2) + 2',
        recurrenceExplanation: '2 subproblems of size n/2, plus 2 comparisons to combine min and max',
        mastersTheorem: 'Case 1: a=2, b=2, f(n)=2=O(1), log_b(a)=1 > 0 → Θ(n)',
        mastersExplanation: 'f(n)=O(1) = O(n^(1−ε)) for ε<1, so Case 1 applies → Θ(n)',
        bestCase: 'Θ(n) — 3n/2 − 2 comparisons',
        avgCase: 'Θ(n) — 3n/2 − 2 comparisons',
        worstCase: 'Θ(n) — 3n/2 − 2 comparisons',
        comparisons: '3⌈n/2⌉ − 2 (fewer than naive 2n − 2)',
        space: 'O(log n) — recursion stack depth',
        subproblems: '2 subproblems of size n/2 at each level',
        divide: 'Split the array into two halves at the midpoint. Cost: O(1).',
        conquer: 'Recursively find min and max in each half.',
        combine: 'Compare the two mins and two maxes: min = min(leftMin, rightMin), max = max(leftMax, rightMax). Cost: O(1).'
    },
    generateInput() {
        const n = 16;
        return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    },
    run(input) {
        const steps = [];
        const arr = [...input];

        steps.push({
            phase: 'ready',
            explanation: `Array: [${arr.join(', ')}]. Find the minimum and maximum using Divide & Conquer.`,
            array: [...arr],
            highlights: {}
        });

        function findMinMax(a, lo, hi, depth) {
            if (lo === hi) {
                const hl = {};
                hl[lo] = 'active';
                steps.push({
                    phase: 'conquer',
                    explanation: `Base case: single element a[${lo}] = ${a[lo]}. Min = Max = ${a[lo]}.`,
                    array: [...arr],
                    highlights: hl
                });
                return { min: a[lo], max: a[lo] };
            }
            if (hi === lo + 1) {
                const hl = {};
                hl[lo] = a[lo] <= a[hi] ? 'min-bar' : 'max-bar';
                hl[hi] = a[hi] <= a[lo] ? 'min-bar' : 'max-bar';
                const mn = Math.min(a[lo], a[hi]);
                const mx = Math.max(a[lo], a[hi]);
                steps.push({
                    phase: 'conquer',
                    explanation: `Base case: compare a[${lo}]=${a[lo]} and a[${hi}]=${a[hi]}. Min=${mn}, Max=${mx}.`,
                    array: [...arr],
                    highlights: hl
                });
                return { min: mn, max: mx };
            }

            const mid = Math.floor((lo + hi) / 2);

            // Divide
            const hl = {};
            for (let i = lo; i <= mid; i++) hl[i] = 'left-half';
            for (let i = mid + 1; i <= hi; i++) hl[i] = 'right-half';
            steps.push({
                phase: 'divide',
                explanation: `Divide [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}]. Depth ${depth}.`,
                array: [...arr],
                highlights: hl
            });

            const leftResult = findMinMax(a, lo, mid, depth + 1);
            const rightResult = findMinMax(a, mid + 1, hi, depth + 1);

            // Combine
            const overallMin = Math.min(leftResult.min, rightResult.min);
            const overallMax = Math.max(leftResult.max, rightResult.max);
            const hlC = {};
            for (let i = lo; i <= hi; i++) {
                if (arr[i] === overallMin) hlC[i] = 'min-bar';
                else if (arr[i] === overallMax) hlC[i] = 'max-bar';
                else if (i <= mid) hlC[i] = 'left-half';
                else hlC[i] = 'right-half';
            }
            steps.push({
                phase: 'combine',
                explanation: `Combine [${lo}..${hi}]: min(${leftResult.min}, ${rightResult.min}) = ${overallMin}, max(${leftResult.max}, ${rightResult.max}) = ${overallMax}.`,
                array: [...arr],
                highlights: hlC
            });

            return { min: overallMin, max: overallMax };
        }

        const result = findMinMax(arr, 0, arr.length - 1, 0);

        const hlFinal = {};
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === result.min) hlFinal[i] = 'min-bar';
            else if (arr[i] === result.max) hlFinal[i] = 'max-bar';
            else hlFinal[i] = 'sorted';
        }
        steps.push({
            phase: 'combine',
            explanation: `Done! Minimum = ${result.min} (cyan), Maximum = ${result.max} (red).`,
            array: [...arr],
            highlights: hlFinal
        });

        return steps;
    },
    render(step, container) {
        AlgorithmLab.renderBarChart(container, step.array, step.highlights);
    }
});
