// Runs SCP on all servers in the network for a specified script.

import { getAllServers } from "./serverScanner";
/** @param {import("..").NS} ns */
export async function main(ns, script) {
    ns.disableLog('sleep');
    let servers = getAllServers;
    for (let i in servers) {
        ns.scp(script, servers[i], 'home');
        await ns.sleep(1e3);
    }

}
