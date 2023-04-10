/* This script will execut any command by generating a script file and running it.
 The execution is done in this manner in order to bypass the dynamic memory limitation
 of the game :) 
 
 Example usage:
  run caller.js tprint ns.getServerMoneyAvailable(\'home\')
  This will terminal-print the current money available

  You need to escape any character that would break the args parsing, such as 
  space and quotes.
*/

/** @param { import(".").NS } ns */
export async function autocomplete(data) {
    return [...data.servers, ...data.scripts]
}
/** @param { import(".").NS } ns */
export async function runCmd(ns) {
	let rdnId = Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	let cmdName = 'command' + rdnId + '.js';

	let bPlate = `
	/** @param {import(".")} ns */
	export async function main(ns) {
		let result = ns.${ns.args[0]}(${ns.args[1]});
		ns.write('/logs/${cmdName}', result, 'w');
	}
	`
	let script = bPlate.format(cmdName, ...ns.args)

	ns.write(cmdName, script, 'w');
	ns.run(cmdName, 1);
	ns.rm(cmdName);
}

/** @param { import(".").NS } ns */

export async function main(ns) {
	await runCmd(ns);
}	