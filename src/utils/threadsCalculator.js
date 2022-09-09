/** @param {import("..").NS} ns */
export function estimateServerCapacity(ns, serverName) {
    let serverCapacity = Math.floor(ns.getServerMaxRam(serverName) / 1.75);
    return {
        hackThreads: Math.floor(serverCapacity / 15),
        growThreads: Math.ceil(serverCapacity / 15 * 10),
        weakenThreads: Math.ceil(serverCapacity / 15 * 2),
        total: serverCapacity
    };
}