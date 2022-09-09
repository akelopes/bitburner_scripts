
/*
 This function is meant to be executed with a object that contains the functions
 to be ran. e.g.:
    argsFn = { 'argName1': fn1, 'argName2': fn2 }
    args = argParser(ns.args)
    args.keys(obj).forEach(key => {
        if(argsFn[key]) { argsFn[key](ns, obj[key]) }
    })

 The trade-off is we no longer rely on ns.args inside scripts that use it.
*/ 
export function argParser(argsInput) {
    let args;
    if (argsInput.length > 0) {
        args = {};
        for (let i = 0; i < argsInput.length; i++) {
            if (argsInput[i].includes('--')) {
                let argName = argsInput[i].replace('--', '');

                /* By turning this into a list I can run auto-complete on the 
                 server names. */
                let argValues = []
                for (let j = i + 1; j < argsInput.length; j++) {
                    
                    /* adjusts i to the right index
                      if it finds something, it will increment i until 
                      next '--'
                     The reason for -1 is due ot the i++ in the for loop.*/
                    i = j - 1
                    if (argsInput[j].includes('--')) { break; }
                    else { argValues.push(argsInput[j]); }
                }

                /* this ternary condition will make the arg True if it doesnt
                have values */
                args[argName] = argValues ? argValues : true;
            }
        }
    }
    return args;
}
