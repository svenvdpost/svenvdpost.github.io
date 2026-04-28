function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function getNearestConnections(dots, options = {}) {
    const connections = [];
    const checks = [];
    let distanceChecks = 0;
    const neighborDistance = Number(options.neighborDistance || Number.POSITIVE_INFINITY);
    const maxDistanceSquared = neighborDistance * neighborDistance;

    for (let sourceIndex = 0; sourceIndex < dots.length; sourceIndex++) {
        let bestTargetIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let targetIndex = 0; targetIndex < dots.length; targetIndex++) {
            if (sourceIndex === targetIndex) {
                continue;
            }

            distanceChecks += 1;
            checks.push({ sourceIndex, targetIndex });
            const distance = distanceSquared(dots[sourceIndex], dots[targetIndex]);

            if (distance > maxDistanceSquared) {
                continue;
            }

            if (distance < bestDistance) {
                bestDistance = distance;
                bestTargetIndex = targetIndex;
            }
        }

        if (bestTargetIndex !== -1) {
            connections.push({ sourceIndex, targetIndex: bestTargetIndex });
        }
    }

    return {
        connections,
        distanceChecks,
        checks,
    };
}

function renderPanel(panelRoot) {
    panelRoot.innerHTML = `
        <h2>Brute force</h2>
        <p>Compares each dot against every other dot.</p>
    `;
}

export default {
    key: "bruteforce",
    label: "Brute force",
    renderPanel,
    getNearestConnections,
};