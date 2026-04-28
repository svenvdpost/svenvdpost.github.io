function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function getNearestConnections(dots) {
    const connections = [];
    let distanceChecks = 0;

    for (let sourceIndex = 0; sourceIndex < dots.length; sourceIndex++) {
        let bestTargetIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let targetIndex = 0; targetIndex < dots.length; targetIndex++) {
            if (sourceIndex === targetIndex) {
                continue;
            }

            distanceChecks += 1;
            const distance = distanceSquared(dots[sourceIndex], dots[targetIndex]);

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