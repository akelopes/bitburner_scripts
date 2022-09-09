function convertToCSV(arr, header=True) {
  let array = [Object.keys(arr[0])]
  if(header) {
    array = array.concat(arr)
  }

  return array.map(it => {
    return Object.values(it).toString()
  }).join('\n')
}

/** @param {import("..").NS} ns */
export function logFile(ns, logFilename, data, mode='w') {
    ns.write('/logs/' + logFilename, data, mode)
}

/** @param {import("..").NS} ns */
export function logObject(ns, logFilename, obj, mode='w') {
    let header = mode == 'a' ? false : true;
    let logData = convertToCSV(obj, header);
    logFile(ns, logFilename,logData,mode);

}