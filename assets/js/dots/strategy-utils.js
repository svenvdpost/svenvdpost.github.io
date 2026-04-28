const MAX_CHECKS = 400;

function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function recordCheck(checks, sourceIndex, targetIndex, maxChecks = MAX_CHECKS) {
    if (checks.length >= maxChecks) {
        checks.length = 0;
    }

    checks.push({ sourceIndex, targetIndex });
}

function getPairKey(leftIndex, rightIndex) {
    const sourceIndex = Math.min(leftIndex, rightIndex);
    const targetIndex = Math.max(leftIndex, rightIndex);
    return `${sourceIndex}:${targetIndex}`;
}

function addNeighborPair(neighborPairs, sourceIndex, targetIndex) {
    neighborPairs.add(getPairKey(sourceIndex, targetIndex));
}

function toNeighborPairs(neighborPairs) {
    return Array.from(neighborPairs).map(key => {
        const [sourceIndex, targetIndex] = key.split(":").map(Number);
        return { sourceIndex, targetIndex };
    });
}

export {
    MAX_CHECKS,
    addNeighborPair,
    distanceSquared,
    recordCheck,
    toNeighborPairs,
};