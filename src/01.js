/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.tprint("Running initial scripts");
    ns.run('spiderCracker.js', 1);
    ns.run('purchaseServer.js', 1);
    ns.run('starter/buyTORRouter.js', 1);
    ns.tprint("Starter finished.")
}