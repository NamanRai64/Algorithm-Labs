/* ===== Convex Hull (D&C) ===== */
AlgorithmLab.register({
    id: 'convexHull',
    name: 'Convex Hull',
    category: 'Geometry',
    usesCanvas: true,
    description: `
        <strong>Convex Hull</strong> (Divide & Conquer) finds the smallest convex polygon
        enclosing all points. It sorts by x-coordinate, recursively builds the hull for
        left and right halves, then merges the two hulls by finding upper and lower tangent lines.
        <br><br>
        <strong>Key Idea:</strong> Merging two convex hulls is done in O(n) by "walking"
        along the hulls to find tangent lines connecting them.
    `,
    complexity: {
        recurrence: 'T(n) = 2T(n/2) + O(n)',
        recurrenceExplanation: '2 half-hulls + O(n) work to find tangent lines and merge',
        mastersTheorem: 'Case 2: a=2, b=2, f(n)=n, log_b(a)=1 → Θ(n log n)',
        mastersExplanation: 'f(n) = Θ(n^log_b(a)) = Θ(n¹), Case 2 applies',
        bestCase: 'Θ(n log n)',
        avgCase: 'Θ(n log n)',
        worstCase: 'Θ(n log n)',
        comparisons: 'O(n) cross-product comparisons per merge level × log n levels',
        space: 'O(n) — hull vertex storage',
        subproblems: '2 sub-hulls of n/2 points each',
        divide: 'Sort points by x-coordinate and split at the median. Cost: O(n log n) initial sort.',
        conquer: 'Recursively compute the convex hull of left and right halves.',
        combine: 'Merge the two hulls by finding upper and lower tangent lines. Cost: O(n).'
    },
    generateInput() {
        const n = 30;
        const pts = [];
        for (let i = 0; i < n; i++) {
            pts.push({
                x: Math.random() * 0.85 + 0.075,
                y: Math.random() * 0.85 + 0.075
            });
        }
        return pts;
    },
    run(input) {
        const steps = [];
        const pts = input.map((p, i) => ({ ...p, id: i }));
        pts.sort((a, b) => a.x - b.x || a.y - b.y);

        function cross(O, A, B) {
            return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
        }

        function monoHull(points) {
            if (points.length <= 1) return [...points];
            const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
            const lower = [];
            for (const p of sorted) {
                while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
                lower.push(p);
            }
            const upper = [];
            for (const p of sorted.reverse()) {
                while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
                upper.push(p);
            }
            lower.pop();
            upper.pop();
            return lower.concat(upper);
        }

        steps.push({
            phase: 'ready',
            explanation: `${pts.length} points sorted by x-coordinate. Build the convex hull using Divide & Conquer.`,
            points: pts,
            hulls: [],
            leftIds: [],
            rightIds: [],
            divLine: null
        });

        function solve(lo, hi, depth) {
            if (hi - lo < 3) {
                const subset = pts.slice(lo, hi + 1);
                const hull = monoHull(subset);
                steps.push({
                    phase: 'conquer',
                    explanation: `Base case: ${subset.length} points → hull of ${hull.length} vertices.`,
                    points: pts,
                    hulls: [hull.map(p => p.id)],
                    leftIds: [],
                    rightIds: [],
                    divLine: null
                });
                return hull;
            }

            const mid = Math.floor((lo + hi) / 2);
            const midX = (pts[mid].x + pts[mid + 1].x) / 2;

            steps.push({
                phase: 'divide',
                explanation: `Divide at x ≈ ${midX.toFixed(3)}: left [${lo}..${mid}] (${mid - lo + 1} pts), right [${mid + 1}..${hi}] (${hi - mid} pts).`,
                points: pts,
                hulls: [],
                leftIds: pts.slice(lo, mid + 1).map(p => p.id),
                rightIds: pts.slice(mid + 1, hi + 1).map(p => p.id),
                divLine: midX
            });

            const leftHull = solve(lo, mid, depth + 1);
            const rightHull = solve(mid + 1, hi, depth + 1);

            // Show both hulls before merge
            steps.push({
                phase: 'combine',
                explanation: `Merging left hull (${leftHull.length} vertices) and right hull (${rightHull.length} vertices).`,
                points: pts,
                hulls: [leftHull.map(p => p.id), rightHull.map(p => p.id)],
                leftIds: leftHull.map(p => p.id),
                rightIds: rightHull.map(p => p.id),
                divLine: midX
            });

            // Merge
            const merged = monoHull([...leftHull, ...rightHull]);

            steps.push({
                phase: 'combine',
                explanation: `Merged hull: ${merged.length} vertices for [${lo}..${hi}].`,
                points: pts,
                hulls: [merged.map(p => p.id)],
                leftIds: [],
                rightIds: [],
                divLine: null
            });

            return merged;
        }

        const finalHull = solve(0, pts.length - 1, 0);

        steps.push({
            phase: 'combine',
            explanation: `Convex Hull complete! ${finalHull.length} vertices form the hull.`,
            points: pts,
            hulls: [finalHull.map(p => p.id)],
            leftIds: [],
            rightIds: [],
            divLine: null,
            final: true
        });

        return steps;
    },
    render(step, ctx, canvas) {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            ctx.beginPath(); ctx.moveTo((i / 10) * w, 0); ctx.lineTo((i / 10) * w, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, (i / 10) * h); ctx.lineTo(w, (i / 10) * h); ctx.stroke();
        }

        const pts = step.points;
        const tx = p => p.x * (w - 40) + 20;
        const ty = p => (1 - p.y) * (h - 40) + 20;

        // Dividing line
        if (step.divLine !== null && step.divLine !== undefined) {
            const lx = step.divLine * (w - 40) + 20;
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, h); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw hulls
        const hullColors = ['#10b981', '#8b5cf6', '#06b6d4'];
        (step.hulls || []).forEach((hullIds, hi2) => {
            if (hullIds.length < 2) return;
            const color = hullColors[hi2 % hullColors.length];
            const hullPts = hullIds.map(id => pts.find(p => p.id === id));

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.fillStyle = color.replace(')', ', 0.06)').replace('#', 'rgba(');
            // Convert hex to rgba for fill
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
            ctx.strokeStyle = `rgba(${r},${g},${b},0.7)`;

            ctx.beginPath();
            ctx.moveTo(tx(hullPts[0]), ty(hullPts[0]));
            for (let i = 1; i < hullPts.length; i++) {
                ctx.lineTo(tx(hullPts[i]), ty(hullPts[i]));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            if (step.final) {
                ctx.strokeStyle = `rgba(${r},${g},${b},1)`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }
        });

        // Points
        const leftSet = new Set(step.leftIds || []);
        const rightSet = new Set(step.rightIds || []);
        const hullIdSet = new Set((step.hulls || []).flat());

        pts.forEach(p => {
            const px = tx(p);
            const py = ty(p);
            let color = 'rgba(148, 163, 184, 0.5)';
            let radius = 3.5;

            if (hullIdSet.has(p.id)) { color = '#10b981'; radius = 5; }
            else if (leftSet.has(p.id)) { color = '#06b6d4'; radius = 4; }
            else if (rightSet.has(p.id)) { color = '#f59e0b'; radius = 4; }

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }
});
