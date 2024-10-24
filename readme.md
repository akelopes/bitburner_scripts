# Bitburner toolkit scripts

These are the scripts I used to beat the BitBurner game.

## Update: Oct-2024

Major updates have been made to the codebase, introducing a new automated workflow based around the `01.js` startup script. This update shifts away from manual deployment towards a more streamlined approach.

Key additions:
* New automated startup system via `01.js`
* Added `hackerSpider.js` for intelligent hacking management
* Enhanced `serverScanner.js`
* Added a few contract solvers for the contracts I have done. 

## Strategy

The core workflow is now:

1. Run `01.js` to initialize all core systems:
   - `crackerSpider.js` for getting rootAccess 
   - `hackerSpider.js` for optimizing the hack loop
   - `purchaseServers.js` for private server purchasing
   - `starters/buyTORRouter.js` to automate the purchase of TOR Router, which then triggers the automation of Executables purchase.

After this, I just start with mugging, then faction rep farming once available.

### Legacy Tools

`deployHack.js` remains available as a legacy tool for manual deployment when needed, but is no longer part of the primary workflow.

### Core Scripts

#### 01.js
The primary entry point for the system:
```javascript
run 01.js
```
This single command initializes the core scripts and begins automated operations.

#### hackerSpider.js
Advanced resource management that:
- Automatically calculates optimal thread distribution
- Selects the most profitable targets
- Maintains efficient RAM usage across all servers
- Periodically reviews and adjusts strategy

#### purchaseServer.js
Server infrastructure management:
```javascript
run purchaseServer.js [ramPotency]
```
- Automatically purchases and upgrades servers
- Scales based on available resources
- Supports custom RAM growth targets

### Utility Scripts

- `info.js`: Server analysis
- `serverScanner.js`: Network scanning functions
- `logManager.js`: Logging tool, right now only used for crackerSpider

### Contract Solvers

Located in `/contracts/`:
- `caesar_cypher.py`: Encryption solver
- `max_subarray_sum.py`: Array optimization
- `triangle-minimum-path.py`: Path finding

## Disclaimer

Those were all quick scripts developed to beat the challenges of the game. Time is the biggest constraint, 
I was not focused on optimization, but just getting the job done. :)

There are a couple of scripts I borrowed, credit is given to the script's first lines.
