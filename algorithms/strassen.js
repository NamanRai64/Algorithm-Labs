/* ===== Strassen's Matrix Multiplication ===== */
AlgorithmLab.register({
    id: 'strassen',
    name: "Strassen's Multiply",
    category: 'Matrix',
    usesCanvas: false,
    description: `
        <strong>Strassen's Algorithm</strong> multiplies two n×n matrices using only
        <strong>7 recursive multiplications</strong> instead of 8, by computing 7 special
        products (M1–M7) and cleverly combining them.
        <br><br>
        <strong>Key Idea:</strong> Trading one multiplication for several additions/subtractions
        reduces asymptotic complexity from O(n³) to O(n<sup>2.807</sup>).
    `,
    complexity: {
        recurrence: 'T(n) = 7T(n/2) + O(n²)',
        recurrenceExplanation: '7 recursive multiplications (not 8!) plus O(n²) additions/subtractions',
        mastersTheorem: 'Case 1: a=7, b=2, log_b(a)=2.807 > 2 → Θ(n^2.807)',
        mastersExplanation: 'f(n)=n² = O(n^(log₂7−ε)) = O(n^(2.807−ε)), so Case 1 applies',
        bestCase: 'Θ(n^2.807)',
        avgCase: 'Θ(n^2.807)',
        worstCase: 'Θ(n^2.807)',
        comparisons: '7 multiplications + 18 additions per recursion level',
        space: 'O(n² log n) — sub-matrix storage across recursion',
        subproblems: '7 special products (M₁–M₇) of n/2 × n/2 matrices',
        divide: 'Partition each matrix into 4 quadrants and compute auxiliary sums/differences. Cost: O(n²).',
        conquer: 'Compute 7 special products M₁ through M₇ recursively.',
        combine: 'Reconstruct the 4 quadrants of C from M₁–M₇ using additions and subtractions. Cost: O(n²).'
    },
    generateInput() {
        const n = 4;
        const randMat = () => Array.from({ length: n }, () =>
            Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1)
        );
        return { A: randMat(), B: randMat(), n };
    },
    run(input) {
        const { A, B, n } = input;
        const steps = [];
        const half = n / 2;

        // Extract quadrants
        const sub = (M, r0, c0) => Array.from({ length: half }, (_, i) =>
            Array.from({ length: half }, (_, j) => M[r0 + i][c0 + j])
        );

        const A11 = sub(A, 0, 0), A12 = sub(A, 0, half), A21 = sub(A, half, 0), A22 = sub(A, half, half);
        const B11 = sub(B, 0, 0), B12 = sub(B, 0, half), B21 = sub(B, half, 0), B22 = sub(B, half, half);

        const mAdd = (X, Y) => X.map((row, i) => row.map((v, j) => v + Y[i][j]));
        const mSub = (X, Y) => X.map((row, i) => row.map((v, j) => v - Y[i][j]));
        const mMul = (X, Y) => {
            const s = X.length;
            const R = Array.from({ length: s }, () => Array(s).fill(0));
            for (let i = 0; i < s; i++)
                for (let j = 0; j < s; j++)
                    for (let k = 0; k < s; k++) R[i][j] += X[i][k] * Y[k][j];
            return R;
        };

        // Compute C for final display
        const C = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                for (let k = 0; k < n; k++) C[i][j] += A[i][k] * B[k][j];

        // Step 0: initial
        steps.push({
            phase: 'ready',
            explanation: `Two ${n}×${n} matrices. Strassen's reduces 8 multiplications to just 7.`,
            blocks: [
                { label: 'A', matrix: A, highlights: {} },
                { label: 'B', matrix: B, highlights: {} }
            ],
            operators: ['×'], info: null
        });

        // Step 1: Divide into quadrants
        const hlQ = {};
        for (let r = 0; r < n; r++) { hlQ[r] = {}; for (let c = 0; c < n; c++) {
            if (r < half && c < half) hlQ[r][c] = 'q1';
            else if (r < half) hlQ[r][c] = 'q2';
            else if (c < half) hlQ[r][c] = 'q3';
            else hlQ[r][c] = 'q4';
        }}
        steps.push({
            phase: 'divide',
            explanation: 'Divide: Partition A and B into 4 quadrants each.',
            blocks: [
                { label: 'A', matrix: A, highlights: hlQ },
                { label: 'B', matrix: B, highlights: hlQ }
            ],
            operators: ['×'],
            info: 'A = [A₁₁ A₁₂; A₂₁ A₂₂] · B = [B₁₁ B₁₂; B₂₁ B₂₂]'
        });

        // Steps 2-8: The 7 Strassen products
        const products = [
            { name: 'M₁', formula: '(A₁₁ + A₂₂)(B₁₁ + B₂₂)', X: mAdd(A11, A22), Y: mAdd(B11, B22) },
            { name: 'M₂', formula: '(A₂₁ + A₂₂) · B₁₁', X: mAdd(A21, A22), Y: B11 },
            { name: 'M₃', formula: 'A₁₁ · (B₁₂ − B₂₂)', X: A11, Y: mSub(B12, B22) },
            { name: 'M₄', formula: 'A₂₂ · (B₂₁ − B₁₁)', X: A22, Y: mSub(B21, B11) },
            { name: 'M₅', formula: '(A₁₁ + A₁₂) · B₂₂', X: mAdd(A11, A12), Y: B22 },
            { name: 'M₆', formula: '(A₂₁ − A₁₁)(B₁₁ + B₁₂)', X: mSub(A21, A11), Y: mAdd(B11, B12) },
            { name: 'M₇', formula: '(A₁₂ − A₂₂)(B₂₁ + B₂₂)', X: mSub(A12, A22), Y: mAdd(B21, B22) },
        ];

        products.forEach((p, idx) => {
            const result = mMul(p.X, p.Y);
            const hlR = {};
            for (let r = 0; r < half; r++) { hlR[r] = {}; for (let c = 0; c < half; c++) hlR[r][c] = 'computing'; }

            steps.push({
                phase: 'conquer',
                explanation: `Conquer (${idx + 1}/7): ${p.name} = ${p.formula}`,
                blocks: [
                    { label: p.name + ' Factor 1', matrix: p.X, highlights: {} },
                    { label: p.name + ' Factor 2', matrix: p.Y, highlights: {} },
                    { label: p.name + ' Result', matrix: result, highlights: hlR }
                ],
                operators: ['×', '='],
                info: `${p.name} = ${p.formula}`
            });
        });

        // Step 9: Combine formulas
        steps.push({
            phase: 'combine',
            explanation: 'Combine: C₁₁ = M₁+M₄−M₅+M₇, C₁₂ = M₃+M₅, C₂₁ = M₂+M₄, C₂₂ = M₁−M₂+M₃+M₆',
            blocks: [
                { label: 'A', matrix: A, highlights: {} },
                { label: 'B', matrix: B, highlights: {} },
            ],
            operators: ['×'],
            info: 'C₁₁ = M₁+M₄−M₅+M₇ | C₁₂ = M₃+M₅ | C₂₁ = M₂+M₄ | C₂₂ = M₁−M₂+M₃+M₆'
        });

        // Step 10: Final result
        const hlC = {};
        for (let r = 0; r < n; r++) { hlC[r] = {}; for (let c = 0; c < n; c++) hlC[r][c] = 'result'; }
        steps.push({
            phase: 'combine',
            explanation: `Final result matrix C computed using only 7 multiplications instead of 8!`,
            blocks: [
                { label: 'A', matrix: A, highlights: {} },
                { label: 'B', matrix: B, highlights: {} },
                { label: 'C = A×B', matrix: C, highlights: hlC }
            ],
            operators: ['×', '='],
            info: 'Strassen\'s: 7 multiplications + 18 additions vs. Naive D&C: 8 multiplications + 4 additions'
        });

        return steps;
    },
    render(step, container) {
        AlgorithmLab.renderMatrixViz(container, step);
    }
});
