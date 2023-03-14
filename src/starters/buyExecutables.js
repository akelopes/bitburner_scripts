import { findRetry, click } from "./utils/borrowedHelpers.js";

let wnd = eval('window');
let doc = wnd['document'];

/** @param {import(".").NS} ns */
export async function main(ns) {

    const exeList = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "NUKE.exe", "SQLInject.exe", "relaySMTP.exe"]
    
    for (let exe of exeList) {
        while (ns.fileExists(exe) == false) {
            await click(await findRetry(ns, "//div[(@role = 'button') and (contains(., 'Terminal'))]"));
            const terminalInput = doc.getElementById("terminal-input");
            terminalInput.value = `home;connect darkweb;buy ${exe};home;`;
            const handler = Object.keys(terminalInput)[1];
            terminalInput[handler].onChange({ target: terminalInput });
            terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
            await ns.sleep(6e4)
        }
        ns.toast(`${exe} purchased.`)
    }
    ns.toast("All exe's purchased.")
}