/** @param {import("..").NS} ns */
export function collectServers(ns, srv, srvRepo) {
	let srvList = ns.scan(srv);
	srvList = srvList.filter(e => !e.includes('home') && !e.includes('pserv'));
	srvList = srvList.filter(e => !srvRepo.includes(e));
	srvRepo.push.apply(srvRepo, srvList);
	srvList.forEach(function (s) {
		srvRepo = collectServers(ns, s, srvRepo);
	})
	return srvRepo;
}

/** @param {import("..").NS} ns */
export function listHackedServersByMaxMoney(ns) {
	let targets = collectServers(ns, 'home', []);
	targets = targets.filter(s => ns.hasRootAccess(s));
	targets = targets.sort((a, b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a));

	return targets;
}

/** @param {import(".").NS} ns */
export function getAllServers(ns) {
    let servers = collectServers(ns, 'home', []);
    servers = servers.filter(s => ns.hasRootAccess(s));
    servers.push.apply(servers, ns.getPurchasedServers());
    return servers;
}

/** @param {import(".").NS} ns */
export function selectBestTarget(ns) {
    let potentialTargets = listHackedServersByMaxMoney(ns);
    for (let i in potentialTargets) {
        if (ns.getServerRequiredHackingLevel(potentialTargets[i]) <= ns.getHackingLevel() / 3) {
            return potentialTargets[i];
        }
    }
    
}

