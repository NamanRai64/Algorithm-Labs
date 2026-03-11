/* ===== Closest Pair of Points ===== */
AlgorithmLab.register({
    id: 'closestPair',
    name: 'Closest Pair of Points',
    category: 'Geometry',
    usesCanvas: true,
    description: `
        <strong>Closest Pair of Points</strong> finds the two points in a 2D plane with the
        smallest Euclidean distance. The D&C approach sorts points by x-coordinate, splits
        at the median, recursively finds the closest pair in each half, then checks the
        "strip" near the dividing line.
        <br><br>
        <strong>Key Idea:</strong> The strip check only needs to compare each point against
        at most 7 others (when sorted by y), making the combine step efficient.
    `,
    complexity: {
        recurrence: 'T(n) = 2T(n/2) + O(n log n)',
        time: 'O(n log² n)',
        space: 'O(n)',
        divide: 'Sort by x-coordinate and split points at the median vertical line.',
        conquer: 'Recursively find the closest pair in left and right halves.',
        combine: 'Check the strip of width 2δ around the dividing line for closer pairs.'
    },
    generateInput() {
        const n = 24;
        const pts = [];
        for (let i = 0; i < n; i++) {
            pts.push({
                x: Math.random() * 0.9 + 0.05,
                y: Math.random() * 0.9 + 0.05
            });
        }
        return pts;
    },
    run(input) {
        const steps = [];
        const pts = input.map((p, i) => ({ ...p, id: i }));
        pts.sort((a, b) => a.x - b.x);

        const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        steps.push({
            phase: 'ready',
            explanation: `${pts.length} points sorted by x-coordinate. Find the closest pair.`,
            points: pts,
            pairs: [],
            divLine: null,
            strip: null,
            best: null
        });

        function closestPair(points, lo, hi) {
            if (hi - lo < 3) {
                // Brute force
                let best = { d: Infinity, p1: null, p2: null };
                const pairs = [];
                for (let i = lo; i <= hi; i++) {
                    for (let j = i + 1; j <= hi; j++) {
                        const d = dist(pts[i], pts[j]);
                        pairs.push({ i: pts[i].id, j: pts[j].id, d });
                        if (d < best.d) best = { d, p1: pts[i], p2: pts[j] };
                    }
                }
                steps.push({
                    phase: 'conquer',
                    explanation: `Base case: brute-force ${hi - lo + 1} points. Closest = ${best.d.toFixed(3)}.`,
                    points: pts,
                    highlightIds: pts.slice(lo, hi + 1).map(p => p.id),
                    pairs,
                    best: best.p1 ? { p1: best.p1.id, p2: best.p2.id, d: best.d } : null,
                    divLine: null, strip: null
                });
                return best;
            }

            const mid = Math.floor((lo + hi) / 2);
            const midX = pts[mid].x;

            // Divide
            steps.push({
                phase: 'divide',
                explanation: `Divide at x = ${midX.toFixed(3)}: left [${lo}..${mid}], right [${mid + 1}..${hi}].`,
                points: pts,
                highlightIds: [],
                pairs: [],
                best: null,
                divLine: midX,
                strip: null,
                leftIds: pts.slice(lo, mid + 1).map(p => p.id),
                rightIds: pts.slice(mid + 1, hi + 1).map(p => p.id)
            });

            const leftBest = closestPair(points, lo, mid);
            const rightBest = closestPair(points, mid + 1, hi);

            let delta = Math.min(leftBest.d, rightBest.d);
            let best = leftBest.d <= rightBest.d ? leftBest : rightBest;

            // Strip
            const stripPts = [];
            for (let i = lo; i <= hi; i++) {
                if (Math.abs(pts[i].x - midX) < delta) stripPts.push(pts[i]);
            }
            stripPts.sort((a, b) => a.y - b.y);

            steps.push({
                phase: 'combine',
                explanation: `Strip check: δ = ${delta.toFixed(3)}. ${stripPts.length} points within strip width 2δ around x = ${midX.toFixed(3)}.`,
                points: pts,
                highlightIds: stripPts.map(p => p.id),
                pairs: [],
                best: best.p1 ? { p1: best.p1.id, p2: best.p2.id, d: best.d } : null,
                divLine: midX,
                strip: { x: midX, delta }
            });

            for (let i = 0; i < stripPts.length; i++) {
                for (let j = i + 1; j < stripPts.length && (stripPts[j].y - stripPts[i].y) < delta; j++) {
                    const d = dist(stripPts[i], stripPts[j]);
                    if (d < delta) {
                        delta = d;
                        best = { d, p1: stripPts[i], p2: stripPts[j] };
                    }
                }
            }

            steps.push({
                phase: 'combine',
                explanation: `Best in [${lo}..${hi}]: distance = ${best.d.toFixed(3)}.`,
                points: pts,
                highlightIds: [],
                pairs: [],
                best: best.p1 ? { p1: best.p1.id, p2: best.p2.id, d: best.d } : null,
                divLine: null,
                strip: null
            });

            return best;
        }

        const result = closestPair(pts, 0, pts.length - 1);

        steps.push({
            phase: 'combine',
            explanation: `Closest pair found! Distance = ${result.d.toFixed(4)}.`,
            points: pts,
            highlightIds: [],
            pairs: [],
            best: { p1: result.p1.id, p2: result.p2.id, d: result.d },
            divLine: null,
            strip: null
        });

        return steps;
    },
    render(step, ctx, canvas) {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * w;
            const y = (i / 10) * h;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        const pts = step.points;
        const tx = p => p.x * (w - 40) + 20;
        const ty = p => (1 - p.y) * (h - 40) + 20;

        // Strip
        if (step.strip) {
            const sx = step.strip.x;
            const sd = step.strip.delta;
            const x1 = (sx - sd) * (w - 40) + 20;
            const x2 = (sx + sd) * (w - 40) + 20;
            ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
            ctx.fillRect(x1, 0, x2 - x1, h);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Dividing line
        if (step.divLine !== null && step.divLine !== undefined) {
            const lx = step.divLine * (w - 40) + 20;
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, h); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Best pair line
        if (step.best) {
            const p1 = pts.find(p => p.id === step.best.p1);
            const p2 = pts.find(p => p.id === step.best.p2);
            if (p1 && p2) {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(tx(p1), ty(p1));
                ctx.lineTo(tx(p2), ty(p2));
                ctx.stroke();

                // Label
                const mx = (tx(p1) + tx(p2)) / 2;
                const my = (ty(p1) + ty(p2)) / 2;
                ctx.fillStyle = '#10b981';
                ctx.font = '600 11px "JetBrains Mono"';
                ctx.fillText(step.best.d.toFixed(3), mx + 6, my - 6);
            }
        }

        // Draw points
        const highlightSet = new Set(step.highlightIds || []);
        const leftSet = new Set(step.leftIds || []);
        const rightSet = new Set(step.rightIds || []);
        const bestSet = new Set();
        if (step.best) { bestSet.add(step.best.p1); bestSet.add(step.best.p2); }

        pts.forEach(p => {
            const px = tx(p);
            const py = ty(p);
            let color = 'rgba(148, 163, 184, 0.6)';
            let radius = 4;

            if (bestSet.has(p.id)) { color = '#10b981'; radius = 7; }
            else if (highlightSet.has(p.id)) { color = '#8b5cf6'; radius = 5; }
            else if (leftSet.has(p.id)) { color = '#06b6d4'; radius = 5; }
            else if (rightSet.has(p.id)) { color = '#f59e0b'; radius = 5; }

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Glow
            if (radius > 4) {
                ctx.beginPath();
                ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
                ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
                ctx.fill();
            }
        });
    }
});
