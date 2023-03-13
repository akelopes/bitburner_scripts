import { argParser } from './utils/argParser.js';
import { readLog } from './utils/logManager.js';
import { getAllServers, selectBestTarget } from './utils/serverScanner.js';
/** @param {import(".").NS} ns */
export function deployScripts(ns, args) {
    let server = args[0];
    let target = args[1];

    let scripts = ['/remote/grow.js', '/remote/weaken.js', '/remote/hack.js'];

    ns.killall(server);
    let serverCapacity = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75);

    let growThreads = Math.floor(serverCapacity / 15 * 10);
    let weakThreads = Math.ceil(serverCapacity / 15 * 2);
    let hackThreads = Math.ceil(serverCapacity / 15);
    let threads = [growThreads, weakThreads, hackThreads];

    for (let i in scripts) {
        if (threads[i] < 1) {
            continue;
        }
        ns.printf('Running %1$s on %2$s with %3$s threads', scripts[i], server, threads[i]);
        ns.exec(scripts[i], server, threads[i], target)
    }
}

/** @param {import(".").NS} ns */
function deployOnMultipleServers(ns, args) {
    let servers;
    let target = args[0];
    let filter = args.slice(1).length > 0 ? args.slice(1) : undefined;

    if (filter) {
        servers = filter;
    } else {
        servers = getAllServers(ns)
    }

    for (let i in servers) {
        let deployArgs = [servers[i], target]
        deployScripts(ns, deployArgs);
    }
}

/** @param {import(".").NS} ns */
function deployMultipleTargetsOnPrivateServers(ns, args) {
    let servers = ns.getPurchasedServers()
    let targets = args;

    for (let i in targets) {
        let deployArgs = [servers[i], targets[i]]
        deployScripts(ns, deployArgs)
    }
}

/** @param {import(".").NS} ns */
function deployOnBestTarget(ns) {
    let servers = getAllServers(ns);
    let target = selectBestTarget(ns);

    for (let i in servers) {
        let deployArgs = [servers[i], target]
        deployScripts(ns, deployArgs)
    }
}


export function autocomplete(data) {
    return [...data.servers, ...data.scripts,]
}

/** @param {import(".").NS} ns */
export async function main(ns) {
    const argsFn = {
        's': deployOnMultipleServers,
        'o': deployScripts,
        't': deployMultipleTargetsOnPrivateServers,
        'max': deployOnBestTarget
    }
    let args = argParser(ns.args);
    if (args) {
        for (let key in args) {
            if (argsFn[key]) { argsFn[key](ns, args[key]) }
        }
    }
    else {
        ns.tprint("No arguments provided");
        ns.tprint("Usage: deployHack.js [s|o|t|max] <server> <target>");
        ns.tprint("--s: deploy target on multiple servers (optionally listed after target) \n \
        --o: deploy on one server and one target \n \
        --t: deploy multiple targets on private servers iteratively \n \
        --max: deploy on all servers with the best target");

    }

}