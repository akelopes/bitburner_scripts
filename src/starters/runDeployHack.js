
import { selectBestTarget } from "./utils/serverScanner.js";

/** @param {import(".").NS} ns */
export async function main(ns) {
    function deployHack(target) {
        ns.exec('deployHack.js', 'home', 1, '--s', target);
    }
    let t = selectBestTarget(ns);
    let target = t ? t : 'n00dles';
    let new_target = ''
    while (ns.getHackingLevel() <= 100) {
        deployHack(target);
        do {
            t = selectBestTarget(ns);
            new_target = t ? t : 'n00dles';
            await ns.sleep(6e4);
        }
        while (target === new_target);
    }
}