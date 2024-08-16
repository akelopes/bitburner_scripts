import { argParser } from "./utils/argParser";
import { selectBestTarget } from "./utils/serverScanner";

/** @param {import(".").NS} ns */
function getMoneyInfo(ns, args) {
    let target = args[0];
    let moneyAvailable = ns.getServerMoneyAvailable(target);
    let maxMoney = ns.getServerMaxMoney(target);
    let ratio = moneyAvailable / maxMoney;

    ns.tprint(`Money available: ${moneyAvailable}`);
    ns.tprint(`Max money: ${maxMoney}`);
    ns.tprint(`Ratio: ${ratio}`);
}

/** @param {import(".").NS} ns */
function getServerInfo(ns, args) {
    let target = args[0]; 
    let minSecurity = ns.getServerMinSecurityLevel(target);
    let currentSecurity = ns.getServerSecurityLevel(target);
    let hackingLevel = ns.getServerRequiredHackingLevel(target);
    let memory = ns.getServerMaxRam(target);
    let ports = ns.getServerNumPortsRequired(target);

    ns.tprint(`Min security: ${minSecurity}`);
    ns.tprint(`Current security: ${currentSecurity}`);
    ns.tprint(`Required hacking level: ${hackingLevel}`);
    ns.tprint(`Memory: ${memory}`);
    ns.tprint(`Ports: ${ports}`);
}

/** @param {import(".").NS} ns */
function getBestServer(ns) {
    ns.tprint("Best server: " + selectBestTarget(ns));
}

export function autocomplete(data) {
    return [...data.servers, ...data.scripts,]
}

/** @param {import(".").NS} ns */
export async function main(ns) {
    const argsFn = {
        'money': getMoneyInfo,
        'server': getServerInfo,
        'best': getBestServer
    }

    let args = argParser(ns.args);
    if (args) {
        for (let key in args) {
            if (argsFn[key]) { argsFn[key](ns, args[key]) }
        }
    }
    else {
        ns.tprint("No arguments provided");
        ns.tprint("Usage: info.js --[server|money] <server>");
    }
}