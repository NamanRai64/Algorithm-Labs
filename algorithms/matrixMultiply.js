/* ===== Matrix Multiplication (Divide & Conquer) ===== */
AlgorithmLab.register({
    id: 'matrixMultiply',
    name: 'Matrix Multiply (D&C)',
    category: 'Matrix',
    usesCanvas: false,
    description: `
        <strong>Divide & Conquer Matrix Multiplication</strong> splits each n×n matrix into
        four n/2×n/2 sub-matrices (quadrants), performs <strong>8 recursive multiplications</strong>,
        and combines the results by addition.
        <br><br>
        <strong>Key Idea:</strong> While conceptually elegant, this approach still requires 8
        multiplications, resulting in O(n³) — the same as the naive algorithm. Strassen's
        method improves on this.
    `,
    complexity: {
        recurrence: 'T(n) = 8T(n/2) + O(n²)',
        time: 'O(n³)',
        space: 'O(n² log n)',
        divide: 'Partition each matrix into 4 quadrants (n/2 × n/2).',
        conquer: 'Recursively multiply the 8 pairs of sub-matrices.',
        combine: 'Add the products to form the 4 quadrants of the result.'
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

        // Compute result for display
        const C = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                for (let k = 0; k < n; k++)
                    C[i][j] += A[i][k] * B[k][j];

        steps.push({
            phase: 'ready',
            explanation: `Two ${n}×${n} matrices A and B. We will multiply them using Divide & Conquer.`,
            blocks: [
                { label: 'A', matrix: A, highlights: {} },
                { label: 'B', matrix: B, highlights: {} }
            ],
            operators: ['×'],
            info: null
        });

        // Divide: show quadrants of A
        const half = n / 2;
        const hlA = {};
        for (let r = 0; r < n; r++) { hlA[r] = {}; for (let c = 0; c < n; c++) {
            if (r < half && c < half) hlA[r][c] = 'q1';
            else if (r < half && c >= half) hlA[r][c] = 'q2';
            else if (r >= half && c < half) hlA[r][c] = 'q3';
            else hlA[r][c] = 'q4';
        }}
        const hlB = {};
        for (let r = 0; r < n; r++) { hlB[r] = {}; for (let c = 0; c < n; c++) {
            if (r < half && c < half) hlB[r][c] = 'q1';
            else if (r < half && c >= half) hlB[r][c] = 'q2';
            else if (r >= half && c < half) hlB[r][c] = 'q3';
            else hlB[r][c] = 'q4';
        }}

        steps.push({
            phase: 'divide',
            explanation: `Divide: Partition A and B into 4 quadrants each (${half}×${half}). Colors show Q1 (top-left), Q2 (top-right), Q3 (bottom-left), Q4 (bottom-right).`,
            blocks: [
                { label: 'A', matrix: A, highlights: hlA },
                { label: 'B', matrix: B, highlights: hlB }
            ],
            operators: ['×'],
            info: 'A = [A₁₁ A₁₂; A₂₁ A₂₂] · B = [B₁₁ B₁₂; B₂₁ B₂₂]'
        });

        // Show the 8 multiplications
        const pairs = [
            ['A₁₁', 'B₁₁', 'C₁₁ part 1', [0, 0], [0, 0]],
            ['A₁₂', 'B₂₁', 'C₁₁ part 2', [0, 1], [1, 0]],
            ['A₁₁', 'B₁₂', 'C₁₂ part 1', [0, 0], [0, 1]],
            ['A₁₂', 'B₂₂', 'C₁₂ part 2', [0, 1], [1, 1]],
            ['A₂₁', 'B₁₁', 'C₂₁ part 1', [1, 0], [0, 0]],
            ['A₂₂', 'B₂₁', 'C₂₁ part 2', [1, 1], [1, 0]],
            ['A₂₁', 'B₁₂', 'C₂₂ part 1', [1, 0], [0, 1]],
            ['A₂₂', 'B₂₂', 'C₂₂ part 2', [1, 1], [1, 1]],
        ];

        const qClass = [[' q1', 'q2'], ['q3', 'q4']];

        pairs.forEach(([aName, bName, cName, aq, bq], idx) => {
            const hlAi = {};
            for (let r = 0; r < n; r++) { hlAi[r] = {}; for (let c = 0; c < n; c++) {
                const qr = r < half ? 0 : 1;
                const qc = c < half ? 0 : 1;
                hlAi[r][c] = (qr === aq[0] && qc === aq[1]) ? 'computing' : '';
            }}
            const hlBi = {};
            for (let r = 0; r < n; r++) { hlBi[r] = {}; for (let c = 0; c < n; c++) {
                const qr = r < half ? 0 : 1;
                const qc = c < half ? 0 : 1;
                hlBi[r][c] = (qr === bq[0] && qc === bq[1]) ? 'computing' : '';
            }}

            steps.push({
                phase: 'conquer',
                explanation: `Conquer (${idx + 1}/8): Multiply ${aName} × ${bName} → contributes to ${cName}.`,
                blocks: [
                    { label: 'A', matrix: A, highlights: hlAi },
                    { label: 'B', matrix: B, highlights: hlBi }
                ],
                operators: ['×'],
                info: `Recursion ${idx + 1} of 8: ${aName} × ${bName}`
            });
        });

        // Combine: show result
        const hlC = {};
        for (let r = 0; r < n; r++) { hlC[r] = {}; for (let c = 0; c < n; c++) hlC[r][c] = 'result'; }
        steps.push({
            phase: 'combine',
            explanation: `Combine: Add the products to form C. C₁₁ = A₁₁B₁₁ + A₁₂B₂₁, etc. Result is the product matrix C.`,
            blocks: [
                { label: 'A', matrix: A, highlights: {} },
                { label: 'B', matrix: B, highlights: {} },
                { label: 'C = A×B', matrix: C, highlights: hlC }
            ],
            operators: ['×', '='],
            info: 'C₁₁ = A₁₁B₁₁+A₁₂B₂₁ | C₁₂ = A₁₁B₁₂+A₁₂B₂₂ | C₂₁ = A₂₁B₁₁+A₂₂B₂₁ | C₂₂ = A₂₁B₁₂+A₂₂B₂₂'
        });

        return steps;
    },
    render(step, container) {
        AlgorithmLab.renderMatrixViz(container, step);
    }
});
