import { logFile } from "./utils/logWriter.js";
import { collectServers } from "./utils/serverScanner.js";

/** @param {import(".").NS} ns */
export function crackServer(ns, target) {
	function fileExists(file) {
		return ns.fileExists(file + ".exe", "home");
	}
	let ports = 0;
	if (fileExists("brutessh")) { ns.brutessh(target); ++ports; }
	if (fileExists("ftpcrack")) { ns.ftpcrack(target); ++ports; }
	if (fileExists("relaysmtp")) { ns.relaysmtp(target); ++ports; }
	if (fileExists("httpworm")) { ns.httpworm(target); ++ports; }
	if (fileExists("sqlinject")) { ns.sqlinject(target); ++ports; }
	if (ns.getServerNumPortsRequired(target) <= ports) {
		return ns.nuke(target);
	} else {
		return false;
	}
}

/** @param {import(".").NS} ns */
export async function iterateCrawl(ns, servers) {
	let hackedServers = servers.filter(e => ns.hasRootAccess(e));
	if (hackedServers.length > 0) {
		logFile(ns, 'hackedServers.txt', hackedServers.join('\n'))
	}
	let hackableServers = servers.filter(e => !ns.hasRootAccess(e) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(e));
	let scripts = ns.ls('home').filter(f => f.startsWith('/remote/'));
	for (let i in hackableServers) {
		if (crackServer(ns, hackableServers[i])) {
			ns.tprintf('%s has been hacked.', hackableServers[i]);
			ns.scp(scripts, hackableServers[i], 'home');
			logFile(ns, 'hackedServers.txt', '\n' + hackableServers[i], 'a')
		}
		await ns.sleep(3e3);
	}
}

/** @param {import(".").NS} ns */
export async function main(ns) {
	let servers = collectServers(ns, 'home', []);
	while (true) {
		await iterateCrawl(ns, servers)
		await ns.sleep(1e4);
	}
}