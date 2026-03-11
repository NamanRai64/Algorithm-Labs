/* ===== Largest Subarray Sum (D&C) ===== */
AlgorithmLab.register({
    id: 'largestSubarray',
    name: 'Largest Subarray Sum',
    category: 'Search & Optimization',
    usesCanvas: false,
    description: `
        <strong>Maximum Subarray Sum</strong> via Divide and Conquer finds the contiguous
        sub-array with the largest sum. It checks three cases: the best sub-array lies entirely
        in the <em>left half</em>, entirely in the <em>right half</em>, or <em>crosses the midpoint</em>.
        <br><br>
        <strong>Key Idea:</strong> The crossing case is solved in O(n) by expanding from the
        midpoint in both directions. The best of the three cases is the answer.
    `,
    complexity: {
        recurrence: 'T(n) = 2T(n/2) + O(n)',
        recurrenceExplanation: '2 half-problems + O(n) to find crossing subarray from midpoint',
        mastersTheorem: 'Case 2: a=2, b=2, f(n)=n, log_b(a)=1 → Θ(n log n)',
        mastersExplanation: 'f(n) = Θ(n^log_b(a)) = Θ(n¹), Case 2 applies',
        bestCase: 'Θ(n log n)',
        avgCase: 'Θ(n log n)',
        worstCase: 'Θ(n log n)',
        comparisons: '~2n log₂n comparisons across all levels',
        space: 'O(log n) — recursion stack depth',
        subproblems: '2 subproblems of size n/2 + crossing check',
        divide: 'Split the array at the midpoint. Cost: O(1).',
        conquer: 'Recursively find the max subarray sum in left and right halves.',
        combine: 'Find the max crossing subarray (expanding from mid), then return the best of left, right, and crossing. Cost: O(n).'
    },
    pseudocode: [
        'function MAX-SUBARRAY(A, lo, hi)',
        '  if lo == hi then',
        '    return (lo, hi, A[lo])',
        '  mid = ⌊(lo + hi) / 2⌋',
        '  (lLo, lHi, lSum) = MAX-SUBARRAY(A, lo, mid)',
        '  (rLo, rHi, rSum) = MAX-SUBARRAY(A, mid+1, hi)',
        '  (cLo, cHi, cSum) = MAX-CROSSING(A, lo, mid, hi)',
        '  return max of (lSum, rSum, cSum)',
        '',
        'function MAX-CROSSING(A, lo, mid, hi)',
        '  leftSum = -∞, sum = 0',
        '  for i = mid downto lo do',
        '    sum += A[i]',
        '    if sum > leftSum then leftSum = sum',
        '  rightSum = -∞, sum = 0',
        '  for j = mid+1 to hi do',
        '    sum += A[j]',
        '    if sum > rightSum then rightSum = sum',
        '  return leftSum + rightSum'
    ].join('\n'),
    generateInput() {
        const n = 16;
        return Array.from({ length: n }, () => Math.floor(Math.random() * 41) - 20);
    },
    run(input) {
        const steps = [];
        const arr = [...input];
        const maxVal = Math.max(...arr.map(Math.abs), 1);

        steps.push({
            phase: 'ready',
            explanation: `Array: [${arr.join(', ')}]. Find the contiguous sub-array with the maximum sum.`,
            array: [...arr],
            highlights: {},
            maxVal
        });

        function maxSubarray(a, lo, hi, depth) {
            if (lo === hi) {
                const hl = {};
                hl[lo] = 'active';
                steps.push({
                    phase: 'conquer',
                    explanation: `Base case: a[${lo}] = ${a[lo]}. Max subarray sum = ${a[lo]}.`,
                    array: [...arr],
                    highlights: hl, maxVal
                });
                return { sum: a[lo], left: lo, right: lo };
            }

            const mid = Math.floor((lo + hi) / 2);

            // Divide
            const hlD = {};
            for (let i = lo; i <= mid; i++) hlD[i] = 'left-half';
            for (let i = mid + 1; i <= hi; i++) hlD[i] = 'right-half';
            steps.push({
                phase: 'divide',
                explanation: `Divide [${lo}..${hi}] at mid=${mid}. Check left, right, and crossing.`,
                array: [...arr],
                highlights: hlD, maxVal
            });

            const leftResult = maxSubarray(a, lo, mid, depth + 1);
            const rightResult = maxSubarray(a, mid + 1, hi, depth + 1);

            // Crossing subarray
            let leftSum = -Infinity, bestLeftIdx = mid, s = 0;
            for (let i = mid; i >= lo; i--) {
                s += a[i];
                if (s > leftSum) { leftSum = s; bestLeftIdx = i; }
            }
            let rightSum = -Infinity, bestRightIdx = mid + 1;
            s = 0;
            for (let i = mid + 1; i <= hi; i++) {
                s += a[i];
                if (s > rightSum) { rightSum = s; bestRightIdx = i; }
            }
            const crossSum = leftSum + rightSum;

            const hlCross = {};
            for (let i = bestLeftIdx; i <= bestRightIdx; i++) hlCross[i] = 'cross';
            steps.push({
                phase: 'combine',
                explanation: `Crossing [${bestLeftIdx}..${bestRightIdx}], sum = ${crossSum}. Left best = ${leftResult.sum}, Right best = ${rightResult.sum}.`,
                array: [...arr],
                highlights: hlCross, maxVal
            });

            // Best of three
            let best;
            if (leftResult.sum >= rightResult.sum && leftResult.sum >= crossSum) {
                best = leftResult;
            } else if (rightResult.sum >= leftResult.sum && rightResult.sum >= crossSum) {
                best = rightResult;
            } else {
                best = { sum: crossSum, left: bestLeftIdx, right: bestRightIdx };
            }

            const hlBest = {};
            for (let i = best.left; i <= best.right; i++) hlBest[i] = 'subarray';
            steps.push({
                phase: 'combine',
                explanation: `Best in [${lo}..${hi}]: sub-array [${best.left}..${best.right}] with sum = ${best.sum}.`,
                array: [...arr],
                highlights: hlBest, maxVal
            });

            return best;
        }

        const result = maxSubarray(arr, 0, arr.length - 1, 0);

        const hlFinal = {};
        for (let i = 0; i < arr.length; i++) {
            hlFinal[i] = (i >= result.left && i <= result.right) ? 'subarray' : 'default';
        }
        steps.push({
            phase: 'combine',
            explanation: `Maximum subarray: [${result.left}..${result.right}] = [${arr.slice(result.left, result.right + 1).join(', ')}], sum = ${result.sum}.`,
            array: [...arr],
            highlights: hlFinal, maxVal
        });

        return steps;
    },
    render(step, container) {
        // Render bar chart with negative values handled
        const arr = step.array;
        const mx = step.maxVal || Math.max(...arr.map(Math.abs), 1);
        const maxH = 120;
        let html = '<div class="bar-chart" style="align-items:center; height:280px;">';
        for (let i = 0; i < arr.length; i++) {
            const h = Math.max(4, (Math.abs(arr[i]) / mx) * maxH);
            const cls = step.highlights[i] || 'default';
            const isNeg = arr[i] < 0;
            html += `<div class="bar-wrapper" style="justify-content:center;">
                ${isNeg ? `<span class="bar-value" style="color:var(--accent-rose);">${arr[i]}</span>` : ''}
                <div class="bar ${cls}" style="height:${h}px;${isNeg ? 'opacity:0.5;border-radius:0 0 4px 4px;' : ''}"></div>
                ${!isNeg ? `<span class="bar-value">${arr[i]}</span>` : ''}
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }
});
