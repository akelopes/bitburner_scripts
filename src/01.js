/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.tprint("Running initial scripts");
    ns.exec('crackerSpider.js', 'home', 1);
    await ns.sleep(10);
    ns.exec('purchaseServers.js', 'home', 1);
    await ns.sleep(10);
    ns.exec('starters/buyTORRouter.js', 'home', 1);
    await ns.sleep(1e4);
    ns.exec('hackerSpider.js', 'home', 1);
    ns.tprint("Starter finished.")
}