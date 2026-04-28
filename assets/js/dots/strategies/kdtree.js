function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
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

    function searchNearestWithCount(node, targetPoint, targetIndex, best) {
        if (!node) {
            return best;
        }

        const nodePoint = node.point;

        if (nodePoint.index !== targetIndex) {
            distanceChecks += 1;
            checks.push({ sourceIndex: targetPoint.index, targetIndex: nodePoint.index });
            const distance = distanceSquared(targetPoint, nodePoint);

            if (distance > maxDistanceSquared) {
                return best;
            }

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

        best = searchNearestWithCount(firstBranch, targetPoint, targetIndex, best);

        if ((targetValue - nodeValue) * (targetValue - nodeValue) < Math.min(best.distance, maxDistanceSquared)) {
            best = searchNearestWithCount(secondBranch, targetPoint, targetIndex, best);
        }

        return best;
    }

    points.forEach(point => {
        const nearest = searchNearestWithCount(tree, point, point.index, {
            index: -1,
            distance: Number.POSITIVE_INFINITY,
        });

        if (nearest.index !== -1) {
            connections.push({ sourceIndex: point.index, targetIndex: nearest.index });
        }
    });

    return {
        connections,
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