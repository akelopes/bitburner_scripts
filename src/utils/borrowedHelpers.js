export function checkNsInstance(ns, fnName = "this function") {
    if (!ns.print) throw new Error(`The first argument to ${fnName} should be a 'ns' instance.`);
    return ns;
}

export async function autoRetry(ns, fnFunctionThatMayFail, fnSuccessCondition, errorContext = "Success condition not met",
    maxRetries = 5, initialRetryDelayMs = 50, backoffRate = 3, verbose = false, tprintFatalErrors = true) {
    checkNsInstance(ns, '"autoRetry"');
    let retryDelayMs = initialRetryDelayMs, attempts = 0;
    while (attempts++ <= maxRetries) {
        try {
            const result = await fnFunctionThatMayFail()
            const error = typeof errorContext === 'string' ? errorContext : errorContext();
            if (!fnSuccessCondition(result))
                throw (typeof error === 'string' ? new Error(error) : error);
            return result;
        }
        catch (error) {
            const fatal = attempts >= maxRetries;
            log(ns, `${fatal ? 'FAIL' : 'INFO'}: Attempt ${attempts} of ${maxRetries} failed` +
                (fatal ? `: ${String(error)}` : `. Trying again in ${retryDelayMs}ms...`),
                tprintFatalErrors && fatal, !verbose ? undefined : (fatal ? 'error' : 'info'))
            if (fatal) throw error;
            await ns.sleep(retryDelayMs);
            retryDelayMs *= backoffRate;
        }
    }
}

function find(xpath) {
    return document.evaluate(xpath, document, null, XPathResult
            .FIRST_ORDERED_NODE_TYPE,
            null)
        .singleNodeValue;
}

export async function findRetry(ns, xpath, expectFailure = false, retries = null) {
    try {
        return await autoRetry(
            ns, () => find(xpath), e => e !== undefined,
            () => expectFailure ?
            `It's looking like the element with xpath: ${xpath} isn't present...` :
            `Could not find the element with xpath: ${xpath}\nSomething may have re-routed the UI`,
            retries != null ? retries : expectFailure ? 3 : 10, 1, 2);
    } catch (e) {
        if (!expectFailure) throw e;
    }
}

export async function click(elem) {
    await elem[Object.keys(elem)[1]].onClick({
        isTrusted: true
    });
}