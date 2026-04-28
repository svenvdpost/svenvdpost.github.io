function distanceSquared(left, right) {
    const deltaX = left.x - right.x;
    const deltaY = left.y - right.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function pairKey(leftIndex, rightIndex) {
    const sourceIndex = Math.min(leftIndex, rightIndex);
    const targetIndex = Math.max(leftIndex, rightIndex);

    return `${sourceIndex}:${targetIndex}`;
}

function pairFromKey(key) {
    const [sourceIndex, targetIndex] = key.split(":").map(Number);

    return {
        sourceIndex,
        targetIndex,
    };
}

export { distanceSquared, pairFromKey, pairKey };
