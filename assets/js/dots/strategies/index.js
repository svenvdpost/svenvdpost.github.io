const strategyLoaders = {
    bruteforce: () => import("./bruteforce.js"),
    grid: () => import("./grid.js"),
    kdtree: () => import("./kdtree.js"),
};

function getStrategyKeys() {
    return Object.keys(strategyLoaders);
}

async function loadStrategy(strategyKey) {
    const loader = strategyLoaders[strategyKey] || strategyLoaders.bruteforce;
    const module = await loader();
    return module.default;
}

export { getStrategyKeys, loadStrategy };