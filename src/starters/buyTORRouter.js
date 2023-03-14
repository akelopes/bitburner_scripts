import {click, findRetry} from "./utils/borrowedHelpers.js";

/** @param {import(".").NS} ns */
export async function main(ns) {
    let money = ns.getServerMoneyAvailable('home');
    let servers = ns.scan('home');
    if (!servers.includes('darkweb')) {
        while (money < 200000) {
            money = ns.getServerMoneyAvailable('home');
            await ns.sleep(6e4);
        }
        await click(await findRetry(ns, "//div[(@role = 'button') and (contains(., 'City'))]"));
        await click(await findRetry(ns, "//span[@aria-label = 'Alpha Enterprises']"));
        await click(await findRetry(ns, "//button[contains(., 'Purchase TOR router')]"));
        await click(await findRetry(ns, "//div[(@role = 'button') and (contains(., 'Terminal'))]"));
    }

    ns.exec('starters/buyExecutables.js', 'home', 1);

}