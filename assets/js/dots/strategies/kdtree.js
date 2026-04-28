function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

const MAX_CHECKS = 400;

function recordCheck(checks, sourceIndex, targetIndex) {
    if (checks.length >= MAX_CHECKS) {
        checks.length = 0;
    }

    checks.push({ sourceIndex, targetIndex });
}

function buildTree(points, depth = 0) {
    if (points.length === 0) {
        return null;
    }

    const axis = depth % 2;
    const sorted = [...points].sort((left, right) => axis === 0 ? left.x - right.x : left.y - right.y);
    const middleIndex = Math.floor(sorted.length / 2);

    return {
        point: sorted[middleIndex],
        axis,
        left: buildTree(sorted.slice(0, middleIndex), depth + 1),
        right: buildTree(sorted.slice(middleIndex + 1), depth + 1),
    };
}

function searchNearest(node, targetPoint, targetIndex, best) {
    if (!node) {
        return best;
    }

    const nodePoint = node.point;

    if (nodePoint.index !== targetIndex) {
        const distance = distanceSquared(targetPoint, nodePoint);

        if (distance < best.distance) {
            best = {
                index: nodePoint.index,
                distance,
            };
        }
    }

    const axisKey = node.axis === 0 ? "x" : "y";
    const targetValue = targetPoint[axisKey];
    const nodeValue = nodePoint[axisKey];
    const firstBranch = targetValue < nodeValue ? node.left : node.right;
    const secondBranch = targetValue < nodeValue ? node.right : node.left;

    best = searchNearest(firstBranch, targetPoint, targetIndex, best);

    if ((targetValue - nodeValue) * (targetValue - nodeValue) < best.distance) {
        best = searchNearest(secondBranch, targetPoint, targetIndex, best);
    }

    return best;
}

function getNearestConnections(dots, options = {}) {
    if (dots.length < 2) {
        return {
            connections: [],
            distanceChecks: 0,
            checks: [],
        };
    }

    const points = dots.map((dot, index) => ({
        x: dot.x,
        y: dot.y,
        index,
    }));
    const tree = buildTree(points);
    const connections = [];
    const checks = [];
    let distanceChecks = 0;
    const neighborDistance = Number(options.neighborDistance || Number.POSITIVE_INFINITY);
    const maxDistanceSquared = neighborDistance * neighborDistance;
    const neighborsSet = new Set();

    function searchRange(node, targetPoint, targetIndex, best) {
        if (!node) return best;

        const nodePoint = node.point;

        if (nodePoint.index !== targetIndex) {
            distanceChecks += 1;
            recordCheck(checks, targetPoint.index, nodePoint.index);
            const distance = distanceSquared(targetPoint, nodePoint);

            if (distance <= maxDistanceSquared) {
                const a = Math.min(targetIndex, nodePoint.index);
                const b = Math.max(targetIndex, nodePoint.index);
                neighborsSet.add(`${a}:${b}`);

                if (distance < best.distance) {
                    best = { index: nodePoint.index, distance };
                }
            }
        }

        const axisKey = node.axis === 0 ? "x" : "y";
        const targetValue = targetPoint[axisKey];
        const nodeValue = nodePoint[axisKey];
        const firstBranch = targetValue < nodeValue ? node.left : node.right;
        const secondBranch = targetValue < nodeValue ? node.right : node.left;

        best = searchRange(firstBranch, targetPoint, targetIndex, best);

        const diff = targetValue - nodeValue;
        if (diff * diff <= maxDistanceSquared) {
            best = searchRange(secondBranch, targetPoint, targetIndex, best);
        }

        return best;
    }

    points.forEach(point => {
        const best = searchRange(tree, point, point.index, {
            index: -1,
            distance: Number.POSITIVE_INFINITY,
        });

        if (best.index !== -1) {
            connections.push({ sourceIndex: point.index, targetIndex: best.index });
        }
    });

    const neighbors = Array.from(neighborsSet).map(key => {
        const [a, b] = key.split(":").map(Number);
        return { sourceIndex: a, targetIndex: b };
    });

    return {
        connections,
        neighbors,
        distanceChecks,
        checks,
    };
}

function renderPanel(panelRoot) {
    panelRoot.innerHTML = `
        <h2>KD-tree</h2>
        <p>Builds a recursive partition tree and prunes distance checks.</p>
    `;
}

export default {
    key: "kdtree",
    label: "KD-tree",
    renderPanel,
    getNearestConnections,
};