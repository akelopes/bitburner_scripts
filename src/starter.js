/* This script automates the initial setup of the game. It will purchase all the 
necessary programs, and deploy hacks to the best target. */

import { getAllServers, selectBestTarget } from './utils/serverScanner.js'
import { findRetry, click } from './utils/borrowedHelpers.js'

const exeList = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "NUKE.exe", "SQLInject.exe", "relaySMTP.exe"]

/** @param {import(".").NS} ns */
async function runDeployHack(ns) {
    function deployHack(target) {
        ns.exec('deployHack.js', 'home', 1, '--s', target);
    }
    let t = selectBestTarget(ns);
    let target = t ? t : 'n00dles';
    let new_target = ''
    while (ns.getHackingLevel() <= 100) {
        deployHack(target);
        do {
            // if (ns.getHackingLevel() >= 100) return;
            t = selectBestTarget(ns);
            new_target = t ? t : 'n00dles';
            await new Promise(r => setTimeout(r, 1000));
        }
        while (target === new_target);
    }

    return;
}

/** @param {import(".").NS} ns */
async function buyApps(ns) {

    for (let exe of exeList) {
        while (ns.fileExists(exe) == false) {
            await click(await findRetry(ns, "//div[(@role = 'button') and (contains(., 'Terminal'))]"));
            const terminalInput = document.getElementById("terminal-input");
            terminalInput.value = `home;connect darkweb;buy ${exe};home;`;
            const handler = Object.keys(terminalInput)[1];
            terminalInput[handler].onChange({ target: terminalInput });
            terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
            await ns.sleep(1e3)
        }
        ns.toast(`${exe} purchased.`)
    }
    ns.toast("All exe's purchased.")
}

/** @param {import(".").NS} ns */
async function buyTORRouter(ns) {
    let money = ns.getServerMoneyAvailable('home');
    let servers = getAllServers(ns);
    if (!servers.includes('darkweb')) {
        while (money < 200000) {
            money = ns.getServerMoneyAvailable('home');
            await ns.sleep(1e3)
        }
        await click(await findRetry(ns, "//div[(@role = 'button') and (contains(., 'City'))]"));
        await click(await findRetry(ns, "//span[@aria-label = 'Alpha Enterprises']"));
        await click(await findRetry(ns, "//button[contains(text(), 'Purchase TOR Router')]"));
    }
    buyApps(ns);

}

/** @param {import(".").NS} ns */
function checkConditions(ns) {
    let hackingLevel = ns.getHackingLevel();

    let boughtExe = [];
    for (let exe of exeList) {
        if (ns.fileExists(exe) == true) {
            boughtExe.push(exe);
        }
    }

    return (hackingLevel >= 100 && boughtExe.length == 6);

}

/** @param {import(".").NS} ns */
export async function main(ns) {
    ns.tprint("Running initial scripts")
    ns.exec('spiderCracker.js', 'home', 1);
    ns.exec('purchaseServer.js', 'home', 1);
    await ns.sleep(1e3);

    ns.tprint("Deploying hacks")

    runDeployHack(ns);
    buyTORRouter(ns);

    // Script does not die until conditions are met
    // Requried to maintain async stack calls running in the game;
    let finished;
    do {
        finished = checkConditions(ns);
    }
    while (!finished) {
        await ns.sleep(1e4);
    }
    ns.tprint("Starter finished.")
}