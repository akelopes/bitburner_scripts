import { deployScripts } from "./deployHack";

/** @param {import(".").NS} ns */
export async function upgradeServer(ns, serverName, ram) {
    let scriptsRunning = ns.ps(serverName);
    let target = scriptsRunning.length > 0 ? scriptsRunning[0].args[0] : undefined;

    let scripts = ns.ls('home').filter(f => f.startsWith('remote/'))

    ns.killall(serverName);
    ns.deleteServer(serverName);
    ns.purchaseServer(serverName, ram);

    ns.scp(scripts, serverName, 'home');
    if (scriptsRunning.length > 0) {
        let script = scriptsRunning[0];
        let deployArgs = [serverName, script.args.shift()];
        deployScripts(ns, deployArgs);
    }
    ns.print(`Upgraded server ${serverName} to ${ram} GB ram.`)
}


/** @param {import(".").NS} ns */
export async function main(ns) {
    function canBuy() {
        return ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram);
    }

    ns.disableLog('ALL');


    let serversMaxRamPotency = ns.args[0] ? ns.args[0] : 14;
    let ram;
    if (ns.getPurchasedServers().length > 0) {
        ram = ns.getServerMaxRam(ns.getPurchasedServers()[0]);
    } else {
        ram = 8;
    }
    let serversLimit = ns.getPurchasedServerLimit();
    let serverPreffix = 'pserv-';
    let ramPotency = 0;
    while (true) {
        let serversBought = ns.getPurchasedServers().length;
        while (serversBought < serversLimit) {
            if (canBuy()) {
                let serverName = serverPreffix + serversBought;
                ns.purchaseServer(serverName, ram);
                let scripts = ns.ls('home').filter(f => f.startsWith('remote/'))
                ns.scp(scripts, serverName, 'home');
                ns.print(`Purchased server ${serverName} with ${ram} GB ram.`)
                serversBought = ns.getPurchasedServers().length;
            }
            await ns.sleep(1e3);
        }

        let serversToUpgrade = ns.getPurchasedServers();
        serversToUpgrade = serversToUpgrade.filter(s => ns.getServerMaxRam(s) < Math.pow(2, ramPotency));

        while (serversToUpgrade.length == 0) {
            ramPotency += 1;
            serversToUpgrade = ns.getPurchasedServers();
            serversToUpgrade = serversToUpgrade.filter(s => ns.getServerMaxRam(s) < Math.pow(2, ramPotency));
        }

        ram = Math.pow(2, ramPotency);

        let maxServersToUpgrade = serversToUpgrade.length;
        let serversUpgraded = 0;
        ns.print(`Upgrading servers to ${ram} GB RAM.`)
        while (serversUpgraded < maxServersToUpgrade) {
            if (canBuy()) {
                let serverName = serversToUpgrade.shift();
                if (!serverName) { break; }

                if (ns.getServerMaxRam(serverName) < ram) {
                    await upgradeServer(ns, serverName, ram);
                }
                serversUpgraded += 1;
            }
            await ns.sleep(1e3);
        }
        await ns.sleep(1e3);
    }
}