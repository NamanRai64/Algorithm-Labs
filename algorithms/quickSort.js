/* ===== Quick Sort ===== */
AlgorithmLab.register({
    id: 'quickSort',
    name: 'Quick Sort',
    category: 'Sorting',
    usesCanvas: false,
    description: `
        <strong>Quick Sort</strong> picks a pivot element, partitions the array so that all elements
        smaller than the pivot go to its left and all greater go to its right, then recursively
        sorts the two partitions.
        <br><br>
        <strong>Key Idea:</strong> After partitioning, the pivot is in its final sorted position.
        The combine step is trivial since the sub-arrays are sorted in-place.
    `,
    complexity: {
        recurrence: 'T(n) = T(k) + T(n−k−1) + O(n)',
        recurrenceExplanation: 'k = pivot position; partition costs O(n)',
        mastersTheorem: 'Not directly applicable (unequal subproblems)',
        mastersExplanation: 'Best case gives T(n)=2T(n/2)+O(n) → Case 2 → O(n log n)',
        bestCase: 'Ω(n log n) — balanced partitions',
        avgCase: 'Θ(n log n) — expected with random pivots',
        worstCase: 'O(n²) — already sorted / all equal',
        comparisons: '~1.39 n log₂n average, n(n−1)/2 worst',
        space: 'O(log n) — recursion stack depth',
        subproblems: '2 subproblems of sizes k and n−k−1',
        divide: 'Choose a pivot and partition into elements ≤ pivot and > pivot. Cost: O(n).',
        conquer: 'Recursively sort the left partition and the right partition.',
        combine: 'No work needed — the array is sorted in-place after conquering. Cost: O(1).'
    },
    pseudocode: [
        'function QUICKSORT(A, lo, hi)',
        '  if lo < hi then',
        '    p = PARTITION(A, lo, hi)',
        '    QUICKSORT(A, lo, p - 1)',
        '    QUICKSORT(A, p + 1, hi)',
        '',
        'function PARTITION(A, lo, hi)',
        '  pivot = A[hi]',
        '  i = lo - 1',
        '  for j = lo to hi - 1 do',
        '    if A[j] ≤ pivot then',
        '      i = i + 1',
        '      swap A[i] and A[j]',
        '  swap A[i+1] and A[hi]',
        '  return i + 1'
    ].join('\n'),
    generateInput() {
        const n = 16;
        return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    },
    run(input) {
        const steps = [];
        const arr = [...input];

        steps.push({
            phase: 'ready',
            explanation: `Initial array: [${arr.join(', ')}]. Quick Sort will pick pivots and partition.`,
            array: [...arr],
            highlights: {}
        });

        function quickSort(a, lo, hi) {
            if (lo >= hi) return;

            const pivotVal = a[hi];
            const hl1 = {};
            for (let x = lo; x <= hi; x++) hl1[x] = 'active';
            hl1[hi] = 'pivot';
            steps.push({
                phase: 'divide',
                explanation: `Pivot chosen: ${pivotVal} at index ${hi}. Partition [${lo}..${hi}].`,
                array: [...a],
                highlights: hl1
            });

            let i = lo;
            for (let j = lo; j < hi; j++) {
                const hl = {};
                for (let x = lo; x <= hi; x++) hl[x] = 'active';
                hl[hi] = 'pivot';
                hl[j] = 'comparing';
                if (a[j] <= pivotVal) {
                    [a[i], a[j]] = [a[j], a[i]];
                    hl[i] = 'left-half';
                    steps.push({
                        phase: 'divide',
                        explanation: `${a[j]} ≤ ${pivotVal}, swap to position ${i}.`,
                        array: [...a],
                        highlights: hl
                    });
                    i++;
                } else {
                    hl[j] = 'right-half';
                    steps.push({
                        phase: 'divide',
                        explanation: `${a[j]} > ${pivotVal}, stays in place.`,
                        array: [...a],
                        highlights: hl
                    });
                }
            }

            [a[i], a[hi]] = [a[hi], a[i]];
            const hlPiv = {};
            hlPiv[i] = 'sorted';
            steps.push({
                phase: 'divide',
                explanation: `Place pivot ${pivotVal} at its final position ${i}.`,
                array: [...a],
                highlights: hlPiv
            });

            quickSort(a, lo, i - 1);
            quickSort(a, i + 1, hi);
        }

        quickSort(arr, 0, arr.length - 1);

        const finalHl = {};
        arr.forEach((_, i) => finalHl[i] = 'sorted');
        steps.push({
            phase: 'combine',
            explanation: 'Quick Sort complete! The array is fully sorted.',
            array: [...arr],
            highlights: finalHl
        });

        return steps;
    },
    render(step, container) {
        AlgorithmLab.renderBarChart(container, step.array, step.highlights);
    }
});
