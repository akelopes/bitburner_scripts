/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.tprint("Running initial scripts");
    ns.run('spiderCracker.js', 1);
    ns.run('purchaseServer.js', 1);
    ns.run('starter/buyTORRouter.js', 1);
    await ns.sleep(5e3);
    ns.run('levelupHack.js', 1, 'foodnstuff')
    ns.run('loopInfiltrate.js', 1, '--faction', 'none', '--target', 'MegaCorp')
    ns.tprint("Starter finished.")
}