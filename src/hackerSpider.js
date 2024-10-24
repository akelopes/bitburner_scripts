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
    let availableServers = getAllServers(ns);
    
    for (const server of availableServers) {
        ns.killall(server);
    }

    availableServers = availableServers.sort((a, b) => 
        ns.getServerMaxRam(a) - ns.getServerMaxRam(b)
    );

    const totalRamAvailable = availableServers.reduce((sum, server) => {
        return sum + ns.getServerMaxRam(server);
    }, 0);

    ns.print("\n=== Available Resources ===");
    ns.print(`Total RAM available: ${formatNumber(totalRamAvailable)}GB`);
    ns.print("Servers sorted by RAM capacity (lowest first):");
    availableServers.forEach(server => {
        ns.print(`${server}: ${formatNumber(ns.getServerMaxRam(server))}GB`);
    });

    const scriptRam = {
        grow: ns.getScriptRam("/remote/grow.js"),
        weaken: ns.getScriptRam("/remote/weaken.js"),
        hack: ns.getScriptRam("/remote/hack.js")
    };

    const potentialTargets = getAllServers(ns)
        .filter(server => {
            return ns.getServerMaxMoney(server) > 0 && 
                   ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() &&
                   ns.hasRootAccess(server);
        })
        .map(server => {
            const idealThreads = calculateRequiredThreads(ns, server, desiredHackPercent);
            
            // Calculate total and individual RAM needs
            const totalRamNeeded = (idealThreads.grow * scriptRam.grow) +
                                 (idealThreads.weaken * scriptRam.weaken) +
                                 (idealThreads.hack * scriptRam.hack);

            const threadRatio = {
                grow: idealThreads.grow / (idealThreads.grow + idealThreads.weaken + idealThreads.hack),
                weaken: idealThreads.weaken / (idealThreads.grow + idealThreads.weaken + idealThreads.hack),
                hack: idealThreads.hack / (idealThreads.grow + idealThreads.weaken + idealThreads.hack)
            };

            // Calculate available threads based on RAM
            const totalThreadsPossible = Math.floor(totalRamAvailable / 
                ((threadRatio.grow * scriptRam.grow) + 
                 (threadRatio.weaken * scriptRam.weaken) + 
                 (threadRatio.hack * scriptRam.hack)));

            const scaledThreads = {
                grow: Math.max(1, Math.floor(totalThreadsPossible * threadRatio.grow)),
                weaken: Math.max(1, Math.floor(totalThreadsPossible * threadRatio.weaken)),
                hack: Math.max(1, Math.floor(totalThreadsPossible * threadRatio.hack))
            };

            const actualRamNeeded = (scaledThreads.grow * scriptRam.grow) +
                                  (scaledThreads.weaken * scriptRam.weaken) +
                                  (scaledThreads.hack * scriptRam.hack);

            return {
                hostname: server,
                idealThreads,
                threads: scaledThreads,
                ramNeeded: actualRamNeeded,
                maxMoney: ns.getServerMaxMoney(server),
                hackChance: ns.hackAnalyzeChance(server),
                moneyPerSecond: calculateMoneyPerSecond(ns, server, desiredHackPercent),
                ratio: threadRatio
            };
        })
        .sort((a, b) => b.moneyPerSecond - a.moneyPerSecond);

    if (potentialTargets.length === 0) {
        ns.print("\nNo viable targets found!");
        return;
    }

    const target = potentialTargets[0];
    ns.print(`\n=== Selected Target: ${target.hostname} ===`);
    ns.print(`Max Money: $${formatNumber(target.maxMoney)}`);
    ns.print(`Money/Sec: $${formatNumber(target.moneyPerSecond)}`);
    ns.print(`RAM Needed: ${formatNumber(target.ramNeeded)}GB`);
    ns.print("\nThread Ratios:");
    ns.print(`Grow: ${(target.ratio.grow * 100).toFixed(1)}%`);
    ns.print(`Weaken: ${(target.ratio.weaken * 100).toFixed(1)}%`);
    ns.print(`Hack: ${(target.ratio.hack * 100).toFixed(1)}%`);
    ns.print("\nIdeal Threads:");
    ns.print(`Grow: ${target.idealThreads.grow}`);
    ns.print(`Weaken: ${target.idealThreads.weaken}`);
    ns.print(`Hack: ${target.idealThreads.hack}`);
    ns.print("\nScaled Threads (maintaining ratios):");
    ns.print(`Grow: ${target.threads.grow}`);
    ns.print(`Weaken: ${target.threads.weaken}`);
    ns.print(`Hack: ${target.threads.hack}`);

    const serverRamUsage = new Map(availableServers.map(server => [server, 0]));
    await distributeThreads(ns, target.hostname, target.threads, availableServers, serverRamUsage);

    ns.print(`\n=== Final Status ===`);
    ns.print(`RAM Used: ${formatNumber(target.ramNeeded)}GB of ${formatNumber(totalRamAvailable)}GB`);
}

function calculateMoneyPerSecond(ns, server, desiredHackPercent) {
    const maxMoney = ns.getServerMaxMoney(server);
    const hackChance = ns.hackAnalyzeChance(server);
    const hackTime = ns.getHackTime(server);
    const moneyPerHack = maxMoney * desiredHackPercent;
    const timePerCycle = hackTime * 4;
    return (moneyPerHack * hackChance) / (timePerCycle / 1000);
}

async function distributeThreads(ns, target, threads, availableServers, serverRamUsage) {
    const scripts = {
        grow: "/remote/grow.js",
        weaken: "/remote/weaken.js",
        hack: "/remote/hack.js"
    };

    // Calculate total threads and create a queue of all threads needed
    const threadQueue = [];
    
    if (threads.hack > 0) {
        threadQueue.push({
            name: scripts.hack,
            threads: threads.hack,
            ramPerThread: ns.getScriptRam(scripts.hack),
            priority: 1
        });
    }

    if (threads.weaken > 0) {
        threadQueue.push({
            name: scripts.weaken,
            threads: threads.weaken,
            ramPerThread: ns.getScriptRam(scripts.weaken),
            priority: 2
        });
    }
    
    if (threads.grow > 0) {
        threadQueue.push({
            name: scripts.grow,
            threads: threads.grow,
            ramPerThread: ns.getScriptRam(scripts.grow),
            priority: 3
        });
    }

    // Sort by priority (hack first, then weaken, then grow)
    threadQueue.sort((a, b) => a.priority - b.priority);

    // First pass: Allocate hack threads to smallest servers that can fit them
    const smallestServer = availableServers[0];
    const hackRamPerThread = ns.getScriptRam(scripts.hack);
    const smallestServerRam = ns.getServerMaxRam(smallestServer);
    const threadsPerSmallServer = Math.floor(smallestServerRam / hackRamPerThread);

    // If hack threads can fit on smallest servers, prioritize that
    if (threadsPerSmallServer > 0) {
        for (const task of threadQueue) {
            if (task.name === scripts.hack) {
                let remainingHackThreads = task.threads;
                for (const server of availableServers) {
                    if (remainingHackThreads <= 0) break;
                    
                    const serverMaxRam = ns.getServerMaxRam(server);
                    const possibleThreads = Math.floor(serverMaxRam / task.ramPerThread);
                    const threadsToUse = Math.min(possibleThreads, remainingHackThreads);

                    if (threadsToUse > 0) {
                        const pid = ns.exec(task.name, server, threadsToUse, target);
                        if (pid > 0) {
                            remainingHackThreads -= threadsToUse;
                            task.threads -= threadsToUse;
                            serverRamUsage.set(server, threadsToUse * task.ramPerThread);
                            ns.print(`Launched ${threadsToUse} hack threads on ${server}`);
                        }
                    }
                }
                break;
            }
        }
    }

    // Second pass: Distribute remaining threads
    let remainingThreads = threadQueue.reduce((sum, task) => sum + task.threads, 0);
    let lastRemainingThreads = Infinity;

    while (remainingThreads > 0 && remainingThreads < lastRemainingThreads) {
        lastRemainingThreads = remainingThreads;

        for (const server of availableServers) {
            const serverMaxRam = ns.getServerMaxRam(server);
            let serverAvailableRam = serverMaxRam - (serverRamUsage.get(server) || 0);

            for (const task of threadQueue) {
                if (task.threads <= 0) continue;

                const possibleThreads = Math.floor(serverAvailableRam / task.ramPerThread);
                const threadsToUse = Math.min(possibleThreads, task.threads);

                if (threadsToUse > 0) {
                    const pid = ns.exec(task.name, server, threadsToUse, target);
                    if (pid > 0) {
                        task.threads -= threadsToUse;
                        remainingThreads -= threadsToUse;
                        serverAvailableRam -= threadsToUse * task.ramPerThread;
                        serverRamUsage.set(server, serverMaxRam - serverAvailableRam);
                        ns.print(`Launched ${threadsToUse} threads of ${task.name} on ${server}`);
                    }
                }
            }
        }
    }

    // Report any unallocated threads
    for (const task of threadQueue) {
        if (task.threads > 0) {
            ns.print(`WARNING: Could not allocate all threads for ${task.name}. ${task.threads} threads remaining.`);
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

function formatNumber(num) {
    return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}