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

    let compareMode = false;
    let algo1 = null;
    let algo2 = null;
    let steps1 = [];
    let steps2 = [];

    // ── Audio ──
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let soundEnabled = false;

    // ── Audio Engine ──
    function playTone(value, type = 'sine', duration = 0.1) {
        if (!soundEnabled || compareMode) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;

        const minFreq = 150;
        const maxFreq = 900;
        const val = typeof value === 'number' ? Math.abs(value) : 50;
        const freq = minFreq + ((val % 100) / 100) * (maxFreq - minFreq);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const volume = 0.1;
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        if (soundEnabled && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        dom.iconSoundOn.style.display = soundEnabled ? 'block' : 'none';
        dom.iconSoundOff.style.display = soundEnabled ? 'none' : 'block';
    }

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

        dom.homePanel = $('homePanel');
        dom.vizPanel = $('vizPanel');
        dom.detailsPanel = $('detailsPanel');
        dom.controlsBar = $('controlsBar');
        dom.complexityPanel = $('complexityPanel');
        dom.comparisonPanel = $('comparisonPanel');

        dom.progressBar = $('progressBar');
        dom.pseudocodeContent = $('pseudocodeContent');
        dom.pseudocodeBody = $('pseudocodeBody');
        dom.comparisonTableBody = $('comparisonTableBody');
        dom.comparisonBody = $('comparisonBody');
        dom.toggleComparison = $('toggleComparison');
        dom.customInputModal = $('customInputModal');
        dom.modalTitle = $('modalTitle');
        dom.modalHint = $('modalHint');
        dom.modalInput = $('modalInput');
        dom.modalClose = $('modalClose');
        dom.modalCancel = $('modalCancel');
        dom.modalApply = $('modalApply');
        dom.btnCustomInput = $('btnCustomInput');
        dom.btnCompareMode = $('btnCompareMode');
        dom.compareDOM = $('compareDOM');
        dom.vizDOM1 = $('vizDOM1');
        dom.vizDOM2 = $('vizDOM2');
        dom.compareTitle1 = $('compareTitle1');
        dom.compareTitle2 = $('compareTitle2');
        dom.comparePhase1 = $('comparePhase1');
        dom.comparePhase2 = $('comparePhase2');

        dom.btnSound = $('btnSound');
        dom.iconSoundOn = $('iconSoundOn');
        dom.iconSoundOff = $('iconSoundOff');
        dom.algoGrid = $('algoGrid');
        dom.toggleDescription = $('toggleDescription');
        dom.descriptionBody = $('descriptionBody');
        dom.toggleImplementation = $('toggleImplementation');
    }

    // ── Registration ──
    function register(algo) {
        algorithms[algo.id] = algo;
    }

    // ── Switch Algorithm ──
    function switchTo(id) {
        stop();

        // --- Home View Logic --- //
        if (id === 'home') {
            currentAlgo = null;
            dom.sidebarNav.querySelectorAll('.nav-item').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.algo === 'home');
            });
            dom.algoTitle.textContent = 'Dashboard';
            dom.algoBadge.style.display = 'none';
            dom.btnCompareMode.style.display = 'none';
            if ($('topbar').querySelector('.topbar-shortcuts')) {
                $('topbar').querySelector('.topbar-shortcuts').style.display = 'none';
            }

            dom.homePanel.style.display = 'block';
            dom.vizPanel.style.display = 'none';
            dom.detailsPanel.style.display = 'none';
            dom.controlsBar.style.display = 'none';
            dom.complexityPanel.style.display = 'none';
            dom.comparisonPanel.style.display = 'none';

            dom.sidebar.classList.remove('open');
            return;
        }

        // --- Algorithm View Logic --- //
        const algo = algorithms[id];
        if (!algo) return;
        currentAlgo = algo;

        // Force panels to display (Overriding CSS display: none)
        dom.homePanel.style.display = 'none';
        dom.vizPanel.style.display = 'block';
        dom.detailsPanel.style.display = 'block';
        dom.controlsBar.style.display = 'flex';
        dom.complexityPanel.style.display = 'block';
        dom.comparisonPanel.style.display = 'block';

        dom.algoBadge.style.display = 'inline-block';
        if ($('topbar').querySelector('.topbar-shortcuts')) {
            $('topbar').querySelector('.topbar-shortcuts').style.display = 'block';
        }

        // Reset Accordion: Force Overview and Implementation to be open by default
        if (dom.descriptionBody) dom.descriptionBody.classList.remove('collapsed');
        if (dom.toggleDescription) dom.toggleDescription.classList.remove('collapsed');
        if (dom.pseudocodeBody) dom.pseudocodeBody.classList.remove('collapsed');
        if (dom.toggleImplementation) dom.toggleImplementation.classList.remove('collapsed');

        // Update nav
        dom.sidebarNav.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algo === id);
        });

        // Update header & badge
        dom.algoTitle.textContent = algo.name;
        const badgeClasses = { Sorting: '', Matrix: 'matrix', 'Search & Optimization': 'search', Geometry: 'geometry' };
        dom.algoBadge.className = 'algo-badge ' + (badgeClasses[algo.category] || '');
        dom.algoBadge.textContent = algo.category;

        // Details (Description)
        dom.algoDescription.innerHTML = algo.description;

        // Update Complexity info
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

        // Pseudocode & Table
        updatePseudocode(algo);
        updateComparisonHighlight(id);

        resetVisualization();
        dom.sidebar.classList.remove('open');
    }

    // ── Visualization Control ──
    function resetVisualization() {
        stop();
        steps = [];
        stepIndex = -1;
        dom.vizPlaceholder.style.display = 'flex';
        if (!compareMode) {
            dom.compareDOM.style.display = 'none';
            dom.vizDOM.style.display = 'none';
            dom.vizCanvas.style.display = 'none';
            dom.vizDOM.innerHTML = '';
        } else {
            dom.vizDOM1.innerHTML = '';
            dom.vizDOM2.innerHTML = '';
            dom.comparePhase1.textContent = 'READY';
            dom.comparePhase2.textContent = 'READY';
        }
        dom.stepPhase.textContent = 'Ready';
        dom.stepPhase.className = 'step-phase';
        dom.stepCounter.textContent = 'Step 0 / 0';
        dom.explanationText.textContent = 'Click Play to begin the visualization.';
        dom.progressBar.style.width = '0%';
        updatePlayIcon();
    }

    function generateAndRun(customInput = null) {
        if (!currentAlgo) return;
        const input = customInput || currentAlgo.generateInput();

        if (compareMode) {
            const categoryAlgos = Object.values(algorithms).filter(a => a.category === currentAlgo.category);
            algo1 = currentAlgo;
            algo2 = categoryAlgos.find(a => a.id !== currentAlgo.id) || currentAlgo;

            const inputCopy = JSON.parse(JSON.stringify(input));
            steps1 = algo1.customRun ? algo1.customRun(input) : algo1.run(input);
            steps2 = algo2.customRun ? algo2.customRun(inputCopy) : algo2.run(inputCopy);

            steps = new Array(Math.max(steps1.length, steps2.length));
            stepIndex = -1;

            dom.vizPlaceholder.style.display = 'none';
            dom.vizCanvas.style.display = 'none';
            dom.vizDOM.style.display = 'none';
            dom.compareDOM.style.display = 'flex';

            dom.compareTitle1.textContent = algo1.name;
            dom.compareTitle2.textContent = algo2.name;

            if (steps.length > 0) {
                stepIndex = 0;
                renderStep();
            }
        } else {
            steps = currentAlgo.customRun ? currentAlgo.customRun(input) : currentAlgo.run(input);
            stepIndex = -1;
            dom.vizPlaceholder.style.display = 'none';
            dom.compareDOM.style.display = 'none';

            if (currentAlgo.usesCanvas) {
                dom.vizCanvas.style.display = 'block';
                dom.vizDOM.style.display = 'none';
                resizeCanvas();
            } else {
                dom.vizCanvas.style.display = 'none';
                dom.vizDOM.style.display = 'flex';
            }

            if (steps.length > 0) {
                stepIndex = 0;
                renderStep();
            }
        }
    }

    function resizeCanvas() {
        const container = dom.vizContainer;
        const canvas = dom.vizCanvas;
        canvas.width = container.clientWidth - 32;
        canvas.height = Math.min(400, container.clientHeight - 32);
    }

    function renderStep() {
        if (compareMode) {
            const t1 = steps1.length;
            const t2 = steps2.length;
            const max = Math.max(t1, t2);
            if (stepIndex < 0 || stepIndex >= max) return;

            dom.stepCounter.textContent = `Step ${stepIndex + 1} / ${max}`;
            dom.explanationText.textContent = `Comparing execution of ${algo1.name} and ${algo2.name}...`;
            dom.progressBar.style.width = max > 0 ? ((stepIndex + 1) / max) * 100 + '%' : '0%';
            dom.stepPhase.textContent = 'Comparing';
            dom.stepPhase.className = 'step-phase';

            const i1 = Math.min(stepIndex, t1 - 1);
            const s1 = steps1[i1];
            dom.comparePhase1.textContent = (s1.phase || 'ready').toUpperCase() + ` | Step: ${i1 + 1}/${t1}`;
            dom.comparePhase1.className = 'compare-sub ' + (s1.phase || '');
            algo1.render(s1, dom.vizDOM1);

            const i2 = Math.min(stepIndex, t2 - 1);
            const s2 = steps2[i2];
            dom.comparePhase2.textContent = (s2.phase || 'ready').toUpperCase() + ` | Step: ${i2 + 1}/${t2}`;
            dom.comparePhase2.className = 'compare-sub ' + (s2.phase || '');
            algo2.render(s2, dom.vizDOM2);

            highlightPseudocodeLine(-1);

        } else {
            if (!currentAlgo || stepIndex < 0 || stepIndex >= steps.length) return;
            const step = steps[stepIndex];

            dom.stepCounter.textContent = `Step ${stepIndex + 1} / ${steps.length}`;
            dom.explanationText.textContent = step.explanation || '';

            const pct = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;
            dom.progressBar.style.width = pct + '%';

            const phase = step.phase || 'ready';
            dom.stepPhase.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
            dom.stepPhase.className = 'step-phase ' + phase;

            highlightPseudocodeLine(step.codeLine || -1);

            if (soundEnabled && !compareMode) {
                let valForSound = 50;
                if (currentAlgo.category === 'Sorting') {
                    const hlIndex = Object.keys(step.highlights || {}).find(k => step.highlights[k] === 'active' || step.highlights[k] === 'swap');
                    if (hlIndex !== undefined && step.array) valForSound = step.array[hlIndex];
                }
                playTone(valForSound, 'triangle', Math.min(speedMs / 1000, 0.2));
            }

            if (currentAlgo.usesCanvas) {
                const ctx = dom.vizCanvas.getContext('2d');
                currentAlgo.render(step, ctx, dom.vizCanvas);
            } else {
                currentAlgo.render(step, dom.vizDOM);
            }
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
        speedMs = Math.round(1200 / val);
        const label = val <= 3 ? '0.5×' : val <= 6 ? '1×' : val <= 8 ? '2×' : '3×';
        dom.speedValue.textContent = label;
    }

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

    function updatePseudocode(algo) {
        if (!algo.pseudocode) {
            dom.pseudocodeContent.innerHTML = '<span class="line"><span class="comment">// No pseudocode available</span></span>';
            return;
        }
        const lines = algo.pseudocode.split('\n');
        dom.pseudocodeContent.innerHTML = lines.map(line => {
            let escaped = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            escaped = escaped.replace(/\b(function|if|else|for|while|return|then|do|end|to|downto|let|and|or|not)\b/g, '<span class="keyword">$1</span>');
            escaped = escaped.replace(/\b(MERGE-SORT|MERGE|PARTITION|QUICKSORT|STRASSEN|FIND-MIN-MAX|MAX-CROSSING|MAX-SUBARRAY|CLOSEST-PAIR|CONVEX-HULL|MATRIX-MULTIPLY)\b/g, '<span class="fn-name">$1</span>');
            return `<span class="line">${escaped}</span>`;
        }).join('');
    }

    function highlightPseudocodeLine(lineNum) {
        const lines = dom.pseudocodeContent.querySelectorAll('.line');
        lines.forEach((el, i) => {
            el.classList.toggle('highlight', i === lineNum);
        });
    }

    function buildComparisonTable() {
        let html = '';
        Object.values(algorithms).forEach(algo => {
            const c = algo.complexity;
            html += `<tr data-algo-id="${algo.id}">
                <td>${algo.name}</td>
                <td>${c.recurrence || '—'}</td>
                <td>${c.bestCase || c.time || '—'}</td>
                <td>${c.avgCase || c.time || '—'}</td>
                <td>${c.worstCase || c.time || '—'}</td>
                <td>${c.space || '—'}</td>
            </tr>`;
        });
        dom.comparisonTableBody.innerHTML = html;
    }

    function updateComparisonHighlight(activeId) {
        dom.comparisonTableBody.querySelectorAll('tr').forEach(tr => {
            tr.classList.toggle('active-row', tr.dataset.algoId === activeId);
        });
    }

    function openCustomInputModal() {
        if (!currentAlgo) return;
        dom.modalTitle.textContent = `Custom Input — ${currentAlgo.name}`;
        dom.modalInput.value = '';
        dom.customInputModal.style.display = 'flex';
        dom.modalInput.focus();
    }

    function closeModal() {
        dom.customInputModal.style.display = 'none';
    }

    function applyCustomInput() {
        const raw = dom.modalInput.value.trim();
        if (!raw) return;
        let input;
        try {
            input = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        } catch (e) {
            alert('Invalid format.');
            return;
        }
        closeModal();
        resetVisualization();
        generateAndRun(input);
    }

    function init() {
        cacheDom();

        dom.sidebarNav.addEventListener('click', e => {
            const btn = e.target.closest('.nav-item');
            if (btn) switchTo(btn.dataset.algo);
        });

        document.querySelectorAll('.algo-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('info-btn')) return;
                switchTo(card.dataset.algo);
            });
        });

        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                switchTo(btn.dataset.algo);
                if (dom.pseudocodeBody) {
                    dom.pseudocodeBody.classList.remove('collapsed');
                    if (dom.toggleImplementation) dom.toggleImplementation.classList.remove('collapsed');
                }
            });
        });

        dom.btnPlay.addEventListener('click', togglePlay);
        dom.btnStep.addEventListener('click', () => { stop(); stepForward(); });
        dom.btnStepBack.addEventListener('click', () => { stop(); stepBack(); });
        dom.btnReset.addEventListener('click', resetVisualization);
        dom.btnNewInput.addEventListener('click', () => { resetVisualization(); generateAndRun(); });
        dom.speedSlider.addEventListener('input', updateSpeed);
        dom.btnSound.addEventListener('click', toggleSound);
        dom.btnCustomInput.addEventListener('click', openCustomInputModal);
        dom.modalClose.addEventListener('click', closeModal);
        dom.modalCancel.addEventListener('click', closeModal);
        dom.modalApply.addEventListener('click', applyCustomInput);

        dom.btnCompareMode.addEventListener('click', () => {
            compareMode = !compareMode;
            dom.btnCompareMode.classList.toggle('active', compareMode);
            resetVisualization();
            generateAndRun();
        });

        if (dom.toggleDescription) {
            dom.toggleDescription.addEventListener('click', () => {
                dom.descriptionBody.classList.toggle('collapsed');
                dom.toggleDescription.classList.toggle('collapsed');
            });
        }
        if (dom.toggleImplementation) {
            dom.toggleImplementation.addEventListener('click', () => {
                dom.pseudocodeBody.classList.toggle('collapsed');
                dom.toggleImplementation.classList.toggle('collapsed');
            });
        }
        dom.toggleComparison.addEventListener('click', () => {
            dom.comparisonBody.classList.toggle('collapsed');
            dom.toggleComparison.classList.toggle('collapsed');
        });

        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.code) {
                case 'Space': e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': e.preventDefault(); stop(); stepForward(); break;
                case 'ArrowLeft': e.preventDefault(); stop(); stepBack(); break;
                case 'KeyR': e.preventDefault(); resetVisualization(); break;
            }
        });

        dom.menuToggle.addEventListener('click', () => dom.sidebar.classList.toggle('open'));
        updateSpeed();

        setTimeout(() => {
            buildComparisonTable();
            switchTo('home');
        }, 50);
    }

    document.addEventListener('DOMContentLoaded', init);

    return { register, renderBarChart, renderArrayRows, renderMatrixViz };
})();