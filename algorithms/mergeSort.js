/* ===== Merge Sort ===== */
AlgorithmLab.register({
    id: 'mergeSort',
    name: 'Merge Sort',
    category: 'Sorting',
    usesCanvas: false,
    description: `
        <strong>Merge Sort</strong> is a classic divide-and-conquer sorting algorithm.
        It recursively splits the array into two halves, sorts each half, and then
        merges the two sorted halves into a single sorted array.
        <br><br>
        <strong>Key Idea:</strong> It's easier to merge two already-sorted arrays than to sort
        from scratch — this is the power of the "combine" step.
    `,
    complexity: {
        recurrence: 'T(n) = 2T(n/2) + O(n)',
        recurrenceExplanation: '2 subproblems of size n/2, plus O(n) work to merge',
        mastersTheorem: 'Case 2: a=2, b=2, f(n)=n, log_b(a)=1 → Θ(n log n)',
        mastersExplanation: 'f(n) = Θ(n^log_b(a)) = Θ(n¹), so Case 2 applies',
        bestCase: 'Ω(n log n)',
        avgCase: 'Θ(n log n)',
        worstCase: 'O(n log n)',
        comparisons: 'n⌈log₂n⌉ − 2^⌈log₂n⌉ + 1 ≈ O(n log n)',
        space: 'O(n) — auxiliary array for merging',
        subproblems: '2 subproblems of size n/2 at each level',
        divide: 'Split the array into two halves at the midpoint. Cost: O(1).',
        conquer: 'Recursively sort the left half and the right half.',
        combine: 'Merge the two sorted halves by comparing elements in order. Cost: O(n).'
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
            explanation: `Initial array: [${arr.join(', ')}]. Merge Sort will recursively divide this array.`,
            array: [...arr],
            highlights: {}
        });

        function mergeSort(a, lo, hi, depth) {
            if (lo >= hi) return;
            const mid = Math.floor((lo + hi) / 2);

            // Divide step
            const hl = {};
            for (let i = lo; i <= mid; i++) hl[i] = 'left-half';
            for (let i = mid + 1; i <= hi; i++) hl[i] = 'right-half';
            steps.push({
                phase: 'divide',
                explanation: `Divide: Split [${lo}..${hi}] into [${lo}..${mid}] (left) and [${mid + 1}..${hi}] (right). Depth ${depth}.`,
                array: [...arr],
                highlights: hl
            });

            // Conquer
            mergeSort(a, lo, mid, depth + 1);
            mergeSort(a, mid + 1, hi, depth + 1);

            // Combine (merge)
            const left = a.slice(lo, mid + 1);
            const right = a.slice(mid + 1, hi + 1);
            let i = 0, j = 0, k = lo;

            while (i < left.length && j < right.length) {
                const hl2 = {};
                for (let x = lo; x <= hi; x++) hl2[x] = 'merging';
                if (left[i] <= right[j]) {
                    a[k] = left[i];
                    hl2[k] = 'active';
                    steps.push({
                        phase: 'combine',
                        explanation: `Merge: Compare ${left[i]} ≤ ${right[j]}, place ${left[i]} at index ${k}.`,
                        array: [...a],
                        highlights: hl2
                    });
                    i++;
                } else {
                    a[k] = right[j];
                    hl2[k] = 'active';
                    steps.push({
                        phase: 'combine',
                        explanation: `Merge: Compare ${left[i]} > ${right[j]}, place ${right[j]} at index ${k}.`,
                        array: [...a],
                        highlights: hl2
                    });
                    j++;
                }
                k++;
            }
            while (i < left.length) {
                a[k] = left[i];
                const hl2 = {};
                for (let x = lo; x <= hi; x++) hl2[x] = 'merging';
                hl2[k] = 'active';
                steps.push({
                    phase: 'combine',
                    explanation: `Merge: Copy remaining left element ${left[i]} to index ${k}.`,
                    array: [...a],
                    highlights: hl2
                });
                i++; k++;
            }
            while (j < right.length) {
                a[k] = right[j];
                const hl2 = {};
                for (let x = lo; x <= hi; x++) hl2[x] = 'merging';
                hl2[k] = 'active';
                steps.push({
                    phase: 'combine',
                    explanation: `Merge: Copy remaining right element ${right[j]} to index ${k}.`,
                    array: [...a],
                    highlights: hl2
                });
                j++; k++;
            }

            // After merge
            const hlSorted = {};
            for (let x = lo; x <= hi; x++) hlSorted[x] = 'sorted';
            steps.push({
                phase: 'combine',
                explanation: `Merged [${lo}..${hi}]: [${a.slice(lo, hi + 1).join(', ')}]. This sub-array is now sorted.`,
                array: [...a],
                highlights: hlSorted
            });
        }

        mergeSort(arr, 0, arr.length - 1, 0);

        const finalHl = {};
        arr.forEach((_, i) => finalHl[i] = 'sorted');
        steps.push({
            phase: 'combine',
            explanation: `Merge Sort complete! The array is fully sorted.`,
            array: [...arr],
            highlights: finalHl
        });

        return steps;
    },
    render(step, container) {
        AlgorithmLab.renderBarChart(container, step.array, step.highlights);
    }
});
