import { loadStrategy, getStrategyKeys } from "./strategies/index.js";

const DOT_RADIUS = 3;

class Dot {
    constructor(x, y, directionX, directionY) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
    }

    step() {
        this.x += this.directionX;
        this.y += this.directionY;
    }

    bounce(width, height) {
        if (this.x <= DOT_RADIUS || this.x >= width - DOT_RADIUS) {
            this.directionX *= -1;
        }

        if (this.y <= DOT_RADIUS || this.y >= height - DOT_RADIUS) {
            this.directionY *= -1;
        }
    }
}

function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function generateRandomDots(count, width, height) {
    const dots = [];

    for (let i = 0; i < count; i++) {
        dots.push(new Dot(
            Math.random() * width,
            Math.random() * height,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
        ));
    }

    return dots;
}

function createDotsApp({ canvas, strategyButtons, rightPanel }) {
    const ctx = canvas.getContext("2d");
    const defaultStrategyKey = strategyButtons[0]?.dataset.strategy || getStrategyKeys()[0];
    const neighborDistanceSlider = document.querySelector("[data-neighbor-distance-slider]");
    const neighborDistanceValueNode = document.querySelector("[data-neighbor-distance-value]");

    let activeStrategy = null;
    let selectedStrategyKey = defaultStrategyKey;
    let dots = [];
    let lastDistanceChecks = 0;
    let lastChecks = [];
    let showDistanceChecks = false;
    let neighborDistance = Number(neighborDistanceSlider?.value || 120);
    let strategyTimeNode = null;
    let strategyInfoNode = null;
    let strategyToggleNode = null;

    function updateNeighborDistanceLabel() {
        if (neighborDistanceValueNode) {
            neighborDistanceValueNode.textContent = `${neighborDistance}`;
        }
    }

    function initializeNeighborDistanceSlider() {
        updateNeighborDistanceLabel();

        if (!neighborDistanceSlider) {
            return;
        }

        neighborDistanceSlider.addEventListener("input", () => {
            neighborDistance = Number(neighborDistanceSlider.value);
            updateNeighborDistanceLabel();
        });
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawDot(dot) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }

    function drawConnections(connections) {
        if (!connections.length) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = "rgba(234, 234, 234, 0.25)";
        ctx.lineWidth = 1;

        connections.forEach(connection => {
            const source = dots[connection.sourceIndex];
            const target = dots[connection.targetIndex];

            if (!source || !target) {
                return;
            }

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        });

        ctx.restore();
    }

    function drawNeighborLinks() {
        const maxDistanceSquared = neighborDistance * neighborDistance;

        ctx.save();
        ctx.strokeStyle = "rgba(234, 234, 234, 0.12)";
        ctx.lineWidth = 1;

        for (let sourceIndex = 0; sourceIndex < dots.length; sourceIndex++) {
            for (let targetIndex = sourceIndex + 1; targetIndex < dots.length; targetIndex++) {
                const distance = distanceSquared(dots[sourceIndex], dots[targetIndex]);

                if (distance > maxDistanceSquared) {
                    continue;
                }

                ctx.beginPath();
                ctx.moveTo(dots[sourceIndex].x, dots[sourceIndex].y);
                ctx.lineTo(dots[targetIndex].x, dots[targetIndex].y);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    function drawDistanceChecks(checks) {
        if (!showDistanceChecks || !checks.length) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = "rgba(255, 74, 74, 0.12)";
        ctx.lineWidth = 1;

        checks.forEach(check => {
            const source = dots[check.sourceIndex];
            const target = dots[check.targetIndex];

            if (!source || !target) {
                return;
            }

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        });

        ctx.restore();
    }

    function drawOverlay() {
        if (typeof activeStrategy?.renderOverlay !== "function") {
            return;
        }

        activeStrategy.renderOverlay(ctx, canvas, dots);
    }

    function renderRightPanel() {
        rightPanel.innerHTML = `
            <div class="strategy-panel">
                <div class="strategy-panel__info" data-strategy-info></div>
                <div class="strategy-diagnostic" aria-live="polite">
                    <span class="strategy-diagnostic__label">Distance checks</span>
                    <strong class="strategy-diagnostic__value" data-strategy-time>0</strong>
                </div>
                <button type="button" class="strategy-switch" data-distance-checks-toggle role="switch" aria-checked="false">
                    <span class="strategy-switch__label">Distance checks</span>
                    <span class="strategy-switch__track" aria-hidden="true">
                        <span class="strategy-switch__thumb"></span>
                    </span>
                </button>
            </div>
        `;

        strategyInfoNode = rightPanel.querySelector("[data-strategy-info]");
        strategyTimeNode = rightPanel.querySelector("[data-strategy-time]");
        strategyToggleNode = rightPanel.querySelector("[data-distance-checks-toggle]");

        if (strategyToggleNode) {
            strategyToggleNode.addEventListener("click", () => {
                showDistanceChecks = !showDistanceChecks;
                strategyToggleNode.setAttribute("aria-checked", String(showDistanceChecks));
            });
        }

        if (!activeStrategy?.renderPanel || !strategyInfoNode) {
            if (strategyInfoNode) {
                strategyInfoNode.innerHTML = `<p>Strategy details will appear here.</p>`;
            }
            return;
        }

        activeStrategy.renderPanel(strategyInfoNode, {
            dots,
            canvas,
            selectedStrategyKey,
            neighborDistance,
        });
    }

    function updateDiagnostics() {
        if (!strategyTimeNode) {
            return;
        }

        strategyTimeNode.textContent = `${lastDistanceChecks}`;
    }

    function updateToggleState() {
        if (!strategyToggleNode) {
            return;
        }

        strategyToggleNode.setAttribute("aria-checked", String(showDistanceChecks));
    }

    function syncButtonState() {
        strategyButtons.forEach(button => {
            button.classList.toggle("is-active", button.dataset.strategy === selectedStrategyKey);
        });
    }

    async function setStrategy(strategyKey) {
        if (strategyKey === selectedStrategyKey && activeStrategy) {
            return;
        }

        selectedStrategyKey = strategyKey;
        window.selectedDotStrategy = strategyKey;
        syncButtonState();

        activeStrategy = await loadStrategy(strategyKey);
        renderRightPanel();
        updateToggleState();
    }

    function animate() {
        clearCanvas();

        const strategyResult = activeStrategy?.getNearestConnections
            ? activeStrategy.getNearestConnections(dots, { neighborDistance })
            : { connections: [], distanceChecks: 0, checks: [] };

        const connections = strategyResult.connections || [];
        lastDistanceChecks = strategyResult.distanceChecks || 0;
        lastChecks = strategyResult.checks || [];

        drawOverlay();
        drawNeighborLinks();
        drawDistanceChecks(lastChecks);
        drawConnections(connections);
        updateDiagnostics();

        dots.forEach(dot => {
            drawDot(dot);
            dot.step();
            dot.bounce(canvas.width, canvas.height);
        });

        requestAnimationFrame(animate);
    }

    async function start() {
        initializeNeighborDistanceSlider();

        strategyButtons.forEach(button => {
            button.addEventListener("click", () => {
                void setStrategy(button.dataset.strategy);
            });
        });

        dots = generateRandomDots(100, canvas.width, canvas.height);
        await setStrategy(defaultStrategyKey);
        requestAnimationFrame(animate);
    }

    return {
        start,
    };
}

export { createDotsApp };