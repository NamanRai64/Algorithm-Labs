/* ===================================================================
   AlgorithmLab — Core Application Controller
   =================================================================== */

const AlgorithmLab = (() => {
    // ── Registry ──
    const algorithms = {};
    let currentAlgo = null;
    let steps = [];
    let stepIndex = -1;
    let isPlaying = false;
    let playTimer = null;
    let speedMs = 600;

    // ── DOM refs ──
    const $ = id => document.getElementById(id);
    const dom = {};

    function cacheDom() {
        dom.sidebar = $('sidebar');
        dom.sidebarNav = $('sidebarNav');
        dom.menuToggle = $('menuToggle');
        dom.algoTitle = $('algoTitle');
        dom.algoBadge = $('algoBadge');
        dom.algoDescription = $('algoDescription');
        dom.vizContainer = $('vizContainer');
        dom.vizPlaceholder = $('vizPlaceholder');
        dom.vizCanvas = $('vizCanvas');
        dom.vizDOM = $('vizDOM');
        dom.stepPhase = $('stepPhase');
        dom.stepCounter = $('stepCounter');
        dom.explanationText = $('explanationText');
        dom.btnPlay = $('btnPlay');
        dom.btnStep = $('btnStep');
        dom.btnStepBack = $('btnStepBack');
        dom.btnReset = $('btnReset');
        dom.btnNewInput = $('btnNewInput');
        dom.iconPlay = $('iconPlay');
        dom.iconPause = $('iconPause');
        dom.speedSlider = $('speedSlider');
        dom.speedValue = $('speedValue');
        dom.recurrenceRelation = $('recurrenceRelation');
        dom.recurrenceExplanation = $('recurrenceExplanation');
        dom.mastersTheorem = $('mastersTheorem');
        dom.mastersExplanation = $('mastersExplanation');
        dom.bestCase = $('bestCase');
        dom.avgCase = $('avgCase');
        dom.worstCase = $('worstCase');
        dom.numComparisons = $('numComparisons');
        dom.spaceComplexity = $('spaceComplexity');
        dom.numSubproblems = $('numSubproblems');
        dom.divideText = $('divideText');
        dom.conquerText = $('conquerText');
        dom.combineText = $('combineText');
    }

    // ── Registration ──
    function register(algo) {
        algorithms[algo.id] = algo;
    }

    // ── Switch Algorithm ──
    function switchTo(id) {
        stop();
        const algo = algorithms[id];
        if (!algo) return;
        currentAlgo = algo;

        // Update nav
        dom.sidebarNav.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algo === id);
        });

        // Update header
        dom.algoTitle.textContent = algo.name;
        const badgeClasses = { Sorting: '', Matrix: 'matrix', 'Search & Optimization': 'search', Geometry: 'geometry' };
        dom.algoBadge.className = 'algo-badge ' + (badgeClasses[algo.category] || '');
        dom.algoBadge.textContent = algo.category;

        // Description
        dom.algoDescription.innerHTML = algo.description;

        // Complexity info
        const c = algo.complexity;
        dom.recurrenceRelation.textContent = c.recurrence || '—';
        dom.recurrenceExplanation.textContent = c.recurrenceExplanation || '';
        dom.mastersTheorem.textContent = c.mastersTheorem || '—';
        dom.mastersExplanation.textContent = c.mastersExplanation || '';
        dom.bestCase.textContent = c.bestCase || c.time || '—';
        dom.avgCase.textContent = c.avgCase || c.time || '—';
        dom.worstCase.textContent = c.worstCase || c.time || '—';
        dom.numComparisons.textContent = c.comparisons || '—';
        dom.spaceComplexity.textContent = c.space || '—';
        dom.numSubproblems.textContent = c.subproblems || '—';
        dom.divideText.textContent = c.divide || '—';
        dom.conquerText.textContent = c.conquer || '—';
        dom.combineText.textContent = c.combine || '—';

        resetVisualization();

        // Close sidebar on mobile
        dom.sidebar.classList.remove('open');
    }

    // ── Visualization Control ──
    function resetVisualization() {
        stop();
        steps = [];
        stepIndex = -1;
        dom.vizPlaceholder.style.display = 'flex';
        dom.vizDOM.innerHTML = '';
        dom.vizDOM.style.display = 'none';
        dom.vizCanvas.style.display = 'none';
        dom.stepPhase.textContent = 'Ready';
        dom.stepPhase.className = 'step-phase';
        dom.stepCounter.textContent = 'Step 0 / 0';
        dom.explanationText.textContent = 'Click Play to begin the visualization.';
        updatePlayIcon();
    }

    function generateAndRun() {
        if (!currentAlgo) return;
        const input = currentAlgo.generateInput();
        steps = currentAlgo.run(input);
        stepIndex = -1;
        dom.vizPlaceholder.style.display = 'none';

        if (currentAlgo.usesCanvas) {
            dom.vizCanvas.style.display = 'block';
            dom.vizDOM.style.display = 'none';
            resizeCanvas();
        } else {
            dom.vizCanvas.style.display = 'none';
            dom.vizDOM.style.display = 'flex';
        }

        // Render initial state
        if (steps.length > 0) {
            stepIndex = 0;
            renderStep();
        }
    }

    function resizeCanvas() {
        const container = dom.vizContainer;
        const canvas = dom.vizCanvas;
        canvas.width = container.clientWidth - 32;
        canvas.height = Math.min(400, container.clientHeight - 32);
    }

    function renderStep() {
        if (!currentAlgo || stepIndex < 0 || stepIndex >= steps.length) return;
        const step = steps[stepIndex];

        // Update step info
        dom.stepCounter.textContent = `Step ${stepIndex + 1} / ${steps.length}`;
        dom.explanationText.textContent = step.explanation || '';

        const phase = step.phase || 'ready';
        dom.stepPhase.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
        dom.stepPhase.className = 'step-phase ' + phase;

        // Render
        if (currentAlgo.usesCanvas) {
            const ctx = dom.vizCanvas.getContext('2d');
            currentAlgo.render(step, ctx, dom.vizCanvas);
        } else {
            currentAlgo.render(step, dom.vizDOM);
        }
    }

    function stepForward() {
        if (steps.length === 0) {
            generateAndRun();
            return;
        }
        if (stepIndex < steps.length - 1) {
            stepIndex++;
            renderStep();
        } else {
            stop();
        }
    }

    function stepBack() {
        if (stepIndex > 0) {
            stepIndex--;
            renderStep();
        }
    }

    function play() {
        if (steps.length === 0) {
            generateAndRun();
        }
        if (stepIndex >= steps.length - 1) {
            stepIndex = -1;
            if (steps.length === 0) generateAndRun();
            else { stepIndex = 0; renderStep(); }
        }
        isPlaying = true;
        updatePlayIcon();
        tick();
    }

    function tick() {
        if (!isPlaying) return;
        if (stepIndex < steps.length - 1) {
            stepIndex++;
            renderStep();
            playTimer = setTimeout(tick, speedMs);
        } else {
            stop();
        }
    }

    function stop() {
        isPlaying = false;
        clearTimeout(playTimer);
        playTimer = null;
        updatePlayIcon();
    }

    function togglePlay() {
        if (isPlaying) stop();
        else play();
    }

    function updatePlayIcon() {
        dom.iconPlay.style.display = isPlaying ? 'none' : 'block';
        dom.iconPause.style.display = isPlaying ? 'block' : 'none';
        dom.btnPlay.classList.toggle('paused', isPlaying);
    }

    function updateSpeed() {
        const val = parseInt(dom.speedSlider.value);
        // 1 = slowest (1200ms), 10 = fastest (50ms)
        speedMs = Math.round(1200 / val);
        const label = val <= 3 ? '0.5×' : val <= 6 ? '1×' : val <= 8 ? '2×' : '3×';
        dom.speedValue.textContent = label;
    }

    // ── Helpers shared by algorithms ──

    function renderBarChart(container, arr, highlights = {}, maxVal = null) {
        const mx = maxVal || Math.max(...arr, 1);
        const maxH = 250;
        let html = '<div class="bar-chart">';
        for (let i = 0; i < arr.length; i++) {
            const h = Math.max(4, (arr[i] / mx) * maxH);
            const cls = highlights[i] || 'default';
            html += `<div class="bar-wrapper">
                <div class="bar ${cls}" style="height:${h}px"></div>
                <span class="bar-value">${arr[i]}</span>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function renderArrayRows(container, rows, labelRows = []) {
        let html = '<div class="array-rows">';
        rows.forEach((row, ri) => {
            if (labelRows[ri]) html += `<div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">${labelRows[ri]}</div>`;
            html += '<div class="array-row">';
            row.forEach(cell => {
                const cls = cell.cls || '';
                html += `<div class="array-cell ${cls}">${cell.v}</div>`;
            });
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function renderMatrixViz(container, data) {
        // data: { blocks: [{ label, matrix, highlights }], operators: ['+', '×', '='] }
        let html = '<div class="matrix-viz">';
        html += '<div class="matrix-row-display">';
        data.blocks.forEach((block, bi) => {
            if (bi > 0 && data.operators && data.operators[bi - 1]) {
                html += `<span class="matrix-operator">${data.operators[bi - 1]}</span>`;
            }
            html += '<div class="matrix-block">';
            if (block.label) html += `<div class="matrix-block-label">${block.label}</div>`;
            const n = block.matrix.length;
            const m = block.matrix[0].length;
            html += `<div class="matrix-grid" style="grid-template-columns:repeat(${m}, 42px);">`;
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < m; c++) {
                    const cls = (block.highlights && block.highlights[r] && block.highlights[r][c]) || '';
                    html += `<div class="matrix-cell ${cls}">${block.matrix[r][c]}</div>`;
                }
            }
            html += '</div></div>';
        });
        html += '</div>';
        if (data.info) {
            html += `<div style="font-size:0.8rem;color:var(--text-secondary);text-align:center;margin-top:6px;">${data.info}</div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    // ── Init ──
    function init() {
        cacheDom();

        // Nav clicks
        dom.sidebarNav.addEventListener('click', e => {
            const btn = e.target.closest('.nav-item');
            if (btn) switchTo(btn.dataset.algo);
        });

        // Controls
        dom.btnPlay.addEventListener('click', togglePlay);
        dom.btnStep.addEventListener('click', () => { stop(); stepForward(); });
        dom.btnStepBack.addEventListener('click', () => { stop(); stepBack(); });
        dom.btnReset.addEventListener('click', resetVisualization);
        dom.btnNewInput.addEventListener('click', () => { resetVisualization(); generateAndRun(); });
        dom.speedSlider.addEventListener('input', updateSpeed);

        // Menu toggle
        dom.menuToggle.addEventListener('click', () => dom.sidebar.classList.toggle('open'));

        // Close sidebar on outside click (mobile)
        document.addEventListener('click', e => {
            if (window.innerWidth <= 900 && dom.sidebar.classList.contains('open')) {
                if (!dom.sidebar.contains(e.target) && e.target !== dom.menuToggle) {
                    dom.sidebar.classList.remove('open');
                }
            }
        });

        // Resize canvas
        window.addEventListener('resize', () => {
            if (currentAlgo && currentAlgo.usesCanvas && dom.vizCanvas.style.display !== 'none') {
                resizeCanvas();
                if (stepIndex >= 0) renderStep();
            }
        });

        updateSpeed();

        // Auto-select first algorithm once all scripts are loaded
        setTimeout(() => {
            if (algorithms['mergeSort']) switchTo('mergeSort');
        }, 50);
    }

    document.addEventListener('DOMContentLoaded', init);

    return { register, renderBarChart, renderArrayRows, renderMatrixViz };
})();
