/* Script to focus on leveling up the hacking skill */

import { collectServers } from './utils/serverScanner.js'

/** @param {import(".").NS} ns */
export async function main(ns) {
    let servers = collectServers(ns, 'home', []);
    servers.push.apply(servers, ns.getPurchasedServers());
    servers = servers.filter(s => ns.hasRootAccess(s));
    for (let i in servers) {
        ns.killall(servers[i]);
        let serverCapacity = Math.floor(ns.getServerMaxRam(servers[i]) / 1.75);
        if (serverCapacity < 1) {
            continue;
        }
        ns.exec('/remote/weaken.js', servers[i], serverCapacity, 'joesguns');
    }
}