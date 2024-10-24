export function autocomplete(data) {
    return [...data.servers]
}
/** @param {NS} ns */
export async function main(ns) {
    const targetServer = ns.args[0];
    const desiredHackPercent = ns.args[1] || 0.75;

    if (!targetServer) {
        ns.tprint("Usage: run script.js [target-server] [hack-percent]");
        return;
    }

    const maxMoney = ns.getServerMaxMoney(targetServer);
    const currentMoney = ns.getServerMoneyAvailable(targetServer);
    const minSecurity = ns.getServerMinSecurityLevel(targetServer);
    const currentSecurity = ns.getServerSecurityLevel(targetServer);
    const hackDifficulty = ns.getServerRequiredHackingLevel(targetServer);
    const playerHackingLevel = ns.getHackingLevel();
    const playerHackingMult = ns.getPlayer().hacking_money_mult;

    ns.tprint(`\n=== Player Status ===`);
    ns.tprint(`Hacking Level: ${playerHackingLevel}`);
    ns.tprint(`Hacking Money Multiplier: ${playerHackingMult}x`);

    if (playerHackingLevel < hackDifficulty) {
        ns.tprint(`\nWARNING: Server requires hacking level ${hackDifficulty}, but your level is only ${playerHackingLevel}`);
        return;
    }

    ns.tprint(`\n=== Current Server Status: ${targetServer} ===`);
    ns.tprint(`Current Money: $${formatNumber(currentMoney)}`);
    ns.tprint(`Max Money: $${formatNumber(maxMoney)}`);
    ns.tprint(`Current Security: ${currentSecurity.toFixed(2)}`);
    ns.tprint(`Min Security: ${minSecurity}`);
    ns.tprint(`Required Hacking Level: ${hackDifficulty}`);

    const difficultyFactor = calculateDifficultyFactor(playerHackingLevel, hackDifficulty);
    const idealThreads = calculateIdealThreads(ns, targetServer, desiredHackPercent);

    const totalThreads = idealThreads.grow + idealThreads.weaken + idealThreads.hack;
    const threadRatio = {
        grow: idealThreads.grow / totalThreads,
        weaken: idealThreads.weaken / totalThreads,
        hack: idealThreads.hack / totalThreads
    };

    ns.tprint("\n=== Thread Ratios ===");
    ns.tprint(`Grow: ${(threadRatio.grow * 100).toFixed(1)}%`);
    ns.tprint(`Weaken: ${(threadRatio.weaken * 100).toFixed(1)}%`);
    ns.tprint(`Hack: ${(threadRatio.hack * 100).toFixed(1)}%`);

    ns.tprint("\n=== Ideal Thread Counts ===");
    ns.tprint(`Grow: ${idealThreads.grow}`);
    ns.tprint(`Weaken: ${idealThreads.weaken}`);
    ns.tprint(`Hack: ${idealThreads.hack}`);

    const scriptRam = {
        grow: ns.getScriptRam("remote/grow.js"),
        weaken: ns.getScriptRam("remote/weaken.js"),
        hack: ns.getScriptRam("remote/hack.js")
    };

    const totalRamNeeded = (idealThreads.grow * scriptRam.grow) +
                          (idealThreads.weaken * scriptRam.weaken) +
                          (idealThreads.hack * scriptRam.hack);

    ns.tprint("\n=== RAM Requirements ===");
    ns.tprint(`Grow RAM: ${formatNumber(idealThreads.grow * scriptRam.grow)}GB`);
    ns.tprint(`Weaken RAM: ${formatNumber(idealThreads.weaken * scriptRam.weaken)}GB`);
    ns.tprint(`Hack RAM: ${formatNumber(idealThreads.hack * scriptRam.hack)}GB`);
    ns.tprint(`Total RAM needed: ${formatNumber(totalRamNeeded)}GB`);

    ns.tprint("\n=== Timing ===");
    ns.tprint(`Hack Time: ${formatTime(getAdjustedHackTime(ns, targetServer, difficultyFactor))}`);
    ns.tprint(`Grow Time: ${formatTime(getAdjustedGrowTime(ns, targetServer, difficultyFactor))}`);
    ns.tprint(`Weaken Time: ${formatTime(getAdjustedWeakenTime(ns, targetServer, difficultyFactor))}`);

    const hackAnalyzeResult = ns.hackAnalyze(targetServer);
    const hackChance = ns.hackAnalyzeChance(targetServer);
    
    ns.tprint("\n=== Hack Analysis ===");
    ns.tprint(`Per-thread hack: ${(hackAnalyzeResult * 100).toFixed(2)}%`);
    ns.tprint(`Hack chance: ${(hackChance * 100).toFixed(2)}%`);
    ns.tprint(`Target hack amount: ${(desiredHackPercent * 100).toFixed(2)}% ($${formatNumber(maxMoney * desiredHackPercent)})`);
}

function calculateIdealThreads(ns, target, percentToSteal) {
    // Calculate hack threads
    const hackThreads = calculateHackThreads(ns, target, percentToSteal);
    
    // Calculate grow threads needed for worst case (server at $0)
    const growThreads = calculateGrowThreads(ns, target);
    
    // Calculate weaken threads needed for both operations
    const hackSecurityIncrease = hackThreads * 0.002;
    const growSecurityIncrease = growThreads * 0.004;
    const weakenThreads = Math.ceil((hackSecurityIncrease + growSecurityIncrease) / 0.05);

    return {
        grow: growThreads,
        weaken: weakenThreads,
        hack: hackThreads
    };
}

function calculateHackThreads(ns, target, percentToSteal) {
    const hackAmount = ns.hackAnalyze(target);
    return Math.ceil(percentToSteal / hackAmount);
}

function calculateGrowThreads(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    // Calculate grow threads needed to grow from $0 to max money
    const growthRequired = maxMoney;
    return Math.ceil(ns.growthAnalyze(target, growthRequired));
}

function calculateDifficultyFactor(playerLevel, requiredLevel) {
    return Math.max(1, playerLevel / requiredLevel);
}

function getAdjustedHackTime(ns, target, difficultyFactor) {
    return ns.getHackTime(target) / difficultyFactor;
}

function getAdjustedGrowTime(ns, target, difficultyFactor) {
    return ns.getGrowTime(target) / difficultyFactor;
}

function getAdjustedWeakenTime(ns, target, difficultyFactor) {
    return ns.getWeakenTime(target) / difficultyFactor;
}

function formatNumber(num) {
    return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function formatTime(milliseconds) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
}