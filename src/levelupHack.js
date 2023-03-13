/* Script to focus on leveling up the hacking skill */

import { getAllServers } from './utils/serverScanner.js'

export function autocomplete(data) {
    return [...data.servers, ...data.scripts,]
}

/** @param {import(".").NS} ns */
export async function main(ns) {
	let servers = getAllServers(ns, 'home', []);
	for (let i in servers) {
		ns.killall(servers[i]);
		let serverCapacity = Math.floor(ns.getServerMaxRam(servers[i]) / 1.75);
		if (serverCapacity < 1) {
			continue;
		}
		ns.exec('/remote/weaken.js', servers[i], serverCapacity, ns.args[0]);
	}
    let homeCapacity = Math.floor(ns.getServerMaxRam('home') / 1.75 * 0.75);
    ns.exec('remote/weaken.js', 'home', homeCapacity, ns.args[0]);
}