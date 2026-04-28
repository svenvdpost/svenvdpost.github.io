import { addNeighborPair, distanceSquared, recordCheck, toNeighborPairs } from "../strategy-utils.js";

function getCellKey(column, row) {
    return `${column}:${row}`;
}

function getCellIndex(value, cellSize) {
    return Math.floor(value / cellSize);
}

function buildGrid(dots, cellSize) {
    const grid = new Map();

    dots.forEach((dot, index) => {
        const column = getCellIndex(dot.x, cellSize);
        const row = getCellIndex(dot.y, cellSize);
        const key = getCellKey(column, row);

        if (!grid.has(key)) {
            grid.set(key, []);
        }

        grid.get(key).push(index);
    });

    return grid;
}

function collectCandidateIndices(grid, column, row, searchRadius) {
    const candidates = new Set();

    for (let deltaRow = -searchRadius; deltaRow <= searchRadius; deltaRow++) {
        for (let deltaColumn = -searchRadius; deltaColumn <= searchRadius; deltaColumn++) {
            const key = getCellKey(column + deltaColumn, row + deltaRow);
            const cell = grid.get(key);

            if (!cell) {
                continue;
            }

            cell.forEach(index => candidates.add(index));
        }
    }

    return Array.from(candidates);
}

function getNearestConnections(dots, options = {}) {
    if (dots.length < 2) {
        return {
            connections: [],
            distanceChecks: 0,
            checks: [],
        };
    }

    const cellSize = 50;
    const neighborDistance = Number(options.neighborDistance || 120);
    const searchRadius = Math.max(1, Math.ceil(neighborDistance / cellSize));
    const grid = buildGrid(dots, cellSize);
    const connections = [];
    const checks = [];
    let distanceChecks = 0;
    const neighborPairs = new Set();
    const maxDistanceSquared = neighborDistance * neighborDistance;

    for (let sourceIndex = 0; sourceIndex < dots.length; sourceIndex++) {
        const source = dots[sourceIndex];
        const column = getCellIndex(source.x, cellSize);
        const row = getCellIndex(source.y, cellSize);
        const candidateIndices = collectCandidateIndices(grid, column, row, searchRadius).filter(index => index !== sourceIndex);
        let bestTargetIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const targetIndex of candidateIndices) {
            distanceChecks += 1;
            recordCheck(checks, sourceIndex, targetIndex);
            const distance = distanceSquared(source, dots[targetIndex]);

            if (distance > maxDistanceSquared) {
                continue;
            }

            addNeighborPair(neighborPairs, sourceIndex, targetIndex);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestTargetIndex = targetIndex;
            }
        }

        if (bestTargetIndex === -1) {
            for (let targetIndex = 0; targetIndex < dots.length; targetIndex++) {
                if (sourceIndex === targetIndex) {
                    continue;
                }

                distanceChecks += 1;
                recordCheck(checks, sourceIndex, targetIndex);
                const distance = distanceSquared(source, dots[targetIndex]);

                if (distance > maxDistanceSquared) {
                    continue;
                }

                addNeighborPair(neighborPairs, sourceIndex, targetIndex);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestTargetIndex = targetIndex;
                }
            }
        }

        if (bestTargetIndex !== -1) {
            connections.push({ sourceIndex, targetIndex: bestTargetIndex });
        }

    }

    const neighbors = toNeighborPairs(neighborPairs);

    return {
        connections,
        neighbors,
        distanceChecks,
        checks,
    };
}

function renderOverlay(ctx, canvas) {
    const cellSize = 50;

    ctx.save();
    ctx.strokeStyle = "rgba(234, 234, 234, 0.15)";
    ctx.lineWidth = 1;

    for (let x = cellSize; x < canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = cellSize; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.restore();
}

function renderPanel(panelRoot) {
    panelRoot.innerHTML = `
        <h2>Grid search</h2>
        <p>Bins dots into fixed cells and checks nearby cells first.</p>
    `;
}

export default {
    key: "grid",
    label: "Grid search",
    renderPanel,
    renderOverlay,
    getNearestConnections,
};