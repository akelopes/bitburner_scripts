/* 
This script works better once you have a good amount of RAM and hacking level. 
But theoretically it should still proportionally optimize hacking according to your current level.
*/
/** @param {NS} ns */
import { getAllServers } from './utils/serverScanner.js';

export async function main(ns) {
    const desiredHackPercent = ns.args[0] || 0.5;
    const REVIEW_INTERVAL = 60 * 60 * 1000;

    ns.disableLog("ALL");
    
    while (true) {
        await redistributeScripts(ns, desiredHackPercent);
        ns.print(`\nWaiting ${REVIEW_INTERVAL/1000} seconds until next review...`);
        await ns.sleep(REVIEW_INTERVAL);
    }
}

async function redistributeScripts(ns, desiredHackPercent) {
    const availableServers = getAllServers(ns);
    
    for (const server of availableServers) {
        ns.killall(server);
    }

    const totalRamAvailable = availableServers.reduce((sum, server) => {
        return sum + ns.getServerMaxRam(server);
    }, 0);

    const potentialTargets = getAllServers(ns).filter(server => {
        return ns.getServerMaxMoney(server) > 0 && 
               ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() &&
               ns.hasRootAccess(server);
    });

    const targetAnalysis = analyzeTargets(ns, potentialTargets);
    const selectedTargets = [];
    let totalRamUsed = 0;

    ns.print("\n=== Available Resources ===");
    ns.print(`Total RAM available: ${formatNumber(totalRamAvailable)}GB`);

    for (const target of targetAnalysis) {
        const idealThreads = calculateRequiredThreads(ns, target.hostname, desiredHackPercent);
        const idealRamNeeded = calculateRamNeeded(ns, idealThreads);
        
        // Calculate scaled threads if we can't use ideal threads
        const remainingRam = totalRamAvailable - totalRamUsed;
        const threads = remainingRam < idealRamNeeded ? 
            scaleThreads(ns, idealThreads, remainingRam, idealRamNeeded) : 
            idealThreads;
        
        const actualRamNeeded = calculateRamNeeded(ns, threads);
        
        if (actualRamNeeded > 0 && totalRamUsed + actualRamNeeded <= totalRamAvailable) {
            selectedTargets.push({
                ...target,
                threads,
                ramNeeded: actualRamNeeded,
                scaledDown: actualRamNeeded < idealRamNeeded
            });
            totalRamUsed += actualRamNeeded;
        }
    }

    if (selectedTargets.length === 0) {
        ns.print("\nNot enough RAM to target any servers!");
        return;
    }

    ns.print(`\n=== Selected Targets (${selectedTargets.length}) ===`);
    selectedTargets.forEach((target, index) => {
        ns.print(`\n${index + 1}. ${target.hostname}${target.scaledDown ? ' (Scaled Down)' : ''}`);
        ns.print(`   Max Money: $${formatNumber(target.maxMoney)}`);
        ns.print(`   Money/Sec: $${formatNumber(target.moneyPerSecond)}`);
        ns.print(`   RAM Needed: ${formatNumber(target.ramNeeded)}GB`);
        if (target.scaledDown) {
            ns.print(`   Threads: H:${target.threads.hack} G:${target.threads.grow} W:${target.threads.weaken}`);
        }
    });

    const serverRamUsage = new Map(availableServers.map(server => [server, 0]));

    for (const target of selectedTargets) {
        ns.print(`\n=== Distributing threads for ${target.hostname} ===`);
        await distributeThreads(ns, target.hostname, target.threads, availableServers, serverRamUsage);
    }

    ns.print(`\n=== Final Status ===`);
    ns.print(`Total RAM Used: ${formatNumber(totalRamUsed)}GB of ${formatNumber(totalRamAvailable)}GB`);
    ns.print(`Total Targets: ${selectedTargets.length}`);
}

function scaleThreads(ns, idealThreads, availableRam, idealRamNeeded) {
    const scaleFactor = availableRam / idealRamNeeded;
    
    // Ensure we have at least 1 thread for each operation type
    return {
        hack: Math.max(1, Math.floor(idealThreads.hack * scaleFactor)),
        grow: Math.max(1, Math.floor(idealThreads.grow * scaleFactor)),
        weaken: Math.max(1, Math.floor(idealThreads.weaken * scaleFactor))
    };
}

// [Rest of the functions remain unchanged]
function analyzeTargets(ns, servers) {
    return servers.map(hostname => {
        const maxMoney = ns.getServerMaxMoney(hostname);
        const minSecurity = ns.getServerMinSecurityLevel(hostname);
        const hackTime = ns.getHackTime(hostname);
        const growthRate = ns.getServerGrowth(hostname);
        const hackChance = ns.hackAnalyzeChance(hostname);
        
        const moneyPerHack = maxMoney * 0.5;
        const timePerCycle = hackTime * 4;
        const moneyPerSecond = (moneyPerHack * hackChance) / (timePerCycle / 1000);

        return {
            hostname,
            maxMoney,
            minSecurity,
            hackTime,
            growthRate,
            hackChance,
            moneyPerSecond,
            score: moneyPerSecond * hackChance * (growthRate / minSecurity)
        };
    }).sort((a, b) => b.score - a.score);
}

async function distributeThreads(ns, target, threads, availableServers, serverRamUsage) {
    const scripts = {
        grow: "/remote/grow.js",
        weaken: "/remote/weaken.js",
        hack: "/remote/hack.js"
    };

    const tasks = [
        { name: scripts.weaken, threads: threads.weaken, ramPerThread: ns.getScriptRam(scripts.weaken) },
        { name: scripts.grow, threads: threads.grow, ramPerThread: ns.getScriptRam(scripts.grow) },
        { name: scripts.hack, threads: threads.hack, ramPerThread: ns.getScriptRam(scripts.hack) }
    ];

    for (const task of tasks) {
        let remainingThreads = task.threads;
        
        for (const server of availableServers) {
            if (remainingThreads <= 0) break;

            const serverMaxRam = ns.getServerMaxRam(server);
            const currentUsage = serverRamUsage.get(server) || 0;
            const availableRam = serverMaxRam - currentUsage;
            const possibleThreads = Math.floor(availableRam / task.ramPerThread);
            const threadsToUse = Math.min(possibleThreads, remainingThreads);

            if (threadsToUse > 0) {
                const pid = ns.exec(task.name, server, threadsToUse, target);
                if (pid > 0) {
                    remainingThreads -= threadsToUse;
                    serverRamUsage.set(server, currentUsage + (threadsToUse * task.ramPerThread));
                }
            }
        }

        if (remainingThreads > 0) {
            ns.print(`WARNING: Could not allocate all threads for ${task.name}. ${remainingThreads} threads remaining.`);
        }
    }
}

function calculateRequiredThreads(ns, target, desiredHackPercent) {
    const growThreads = calculateGrowThreads(ns, target);
    const weakenThreads = calculateWeakenThreads(ns, target, growThreads);
    const hackThreads = calculateHackThreads(ns, target, desiredHackPercent);

    return {
        grow: growThreads,
        weaken: weakenThreads,
        hack: hackThreads
    };
}

function calculateGrowThreads(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const growthRequired = maxMoney;
    return Math.ceil(ns.growthAnalyze(target, growthRequired));
}

function calculateWeakenThreads(ns, target, growThreads) {
    const currentSecurity = ns.getServerSecurityLevel(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const growthSecurityIncrease = growThreads * 0.004;
    const securityToReduce = (currentSecurity - minSecurity) + growthSecurityIncrease;
    return Math.ceil(securityToReduce / 0.05);
}

function calculateHackThreads(ns, target, percentToSteal) {
    const hackAmount = ns.hackAnalyze(target);
    return Math.ceil(percentToSteal / hackAmount);
}

function calculateRamNeeded(ns, threads) {
    return (threads.grow * ns.getScriptRam("/remote/grow.js")) +
           (threads.weaken * ns.getScriptRam("/remote/weaken.js")) +
           (threads.hack * ns.getScriptRam("/remote/hack.js"));
}

function formatNumber(num) {
    return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}