function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

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

function getNearestConnections(dots) {
    if (dots.length < 2) {
        return {
            connections: [],
            distanceChecks: 0,
        };
    }

    const cellSize = 80;
    const grid = buildGrid(dots, cellSize);
    const connections = [];
    let distanceChecks = 0;

    for (let sourceIndex = 0; sourceIndex < dots.length; sourceIndex++) {
        const source = dots[sourceIndex];
        const column = getCellIndex(source.x, cellSize);
        const row = getCellIndex(source.y, cellSize);
        const candidateIndices = collectCandidateIndices(grid, column, row, 1).filter(index => index !== sourceIndex);

        let bestTargetIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const targetIndex of candidateIndices) {
            distanceChecks += 1;
            const distance = distanceSquared(source, dots[targetIndex]);

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
                const distance = distanceSquared(source, dots[targetIndex]);

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

    return {
        connections,
        distanceChecks,
    };
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
    getNearestConnections,
};