/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	ns.disableLog('sleep');
	let target = ns.args[0];
	while(true) {
		if(ns.getServerMaxMoney(target) * 0.75 <= ns.getServerMoneyAvailable(target)) {
			await ns.hack(target);
		}
		await ns.sleep(1e3);
	}
}