# Bitburner toolkit scripts

These are the scripts I used to beat the BitBurner game.

## Disclaimer

Those were all quick scripts developed to beat the challenges of the game. Time being the biggest constraint, I was not
able to optimize the scripts. However, they get the job done. :)

There are a couple of scripts I borrowed, credit is given at the scripts first lines.

## Strategy

I did not want to create an autopilot, but rather have a more active role while using scripts as tools to beat the game.

The main strategy used was to start out by running `spiderCracker.js` to kick start the hacking of servers.
From there, I will either activate `infiltrate.js` to infiltrate companies for fast money and faction rep, or start training
my hacking level with either `levelUpHacking.js` or simply training on university depending on the bitNode. I will also
manualy buy port apps to liberate the cracking of servers.

Goals change according to BitNote, but generally teh early game goal is to max out private servers at 8Tb RAM, while
backdooring faction servers and farming up faction rep through infiltration. Once there, I switch gears to maxing out
the requirements to beat the BitNode.

### Scripts

#### deployHack.js

Used to deploy a calculated distributino of grow, weaken and hack commands that will loop across all servers to get
money from the targeted server.

Scripts are deployed following an arbitrary proportion of 10 `grow` threads and 2 `weaken` threads for each `hack` thread. The
max thread capacity of the server being deployed is measured by the script prior to executing each of the `/remote/` scripts.

Once I reach the end game, I just either `levelUpHacking.js` to maximize hacking skill or
`run deployHack.js --s harakiri-sushi` followed by `run deployHack.js --max` to maximize profits. After this I start
working on the requirements to beat the bitNode.

**Usage:**

`run deployHack.js --s Target`

This will deploy scripts on all hacked and private servers to hack the `<target>`

**Parameters:**

`--s Target [Servers...]`

Deploy scripts on all servers for the Target. If you want to specify servers that will have the scripts deploy for the target
simply name them after target, separated by spaces

`--t Target [Target2] [Targets...]`

Iterates across private servers, deploying hacking scripts on one private server for each target.

`--o Target Server`

Deploy hacking scripts on a single server for a single target.

`--max`

Iterates across private servers, deploying hacking scripts against a list of top 24 money servers.

### spiderCracker.js

The most automatic script of the toolkit. You just run it and it will iterate through all servers every 10 seconds, cracking
any server it can. A terminal message will be output for every server it cracks into.

### purchaseServer.js

`run purchaseServer.js [RamPotency]`

An automation to buy and upgrade private servers. It runs on a loop, initially buying servers with 8GB ram until it reachs
the limit of servers. Once the limit it reached, it will raise the ram based on the amount you can buy for all servers.
The default maximum RAM is 16Tb `ramMaxPotency = 14`. I found it enough for the first phases of a bitNode. If you want to
go higher, just run the command with the factor you want to upgrade to (game maximum being 20).

If scripts are running on the server as it is getting upgraded, they will be re-initialized with threads adjusted. The
trade-off being that if you are in the middle of a long hack/weaken/grow, than it will be rebooted, so it is recommended
that you keep those for after you reached maximum RAM.

## Borrowed Scripts

### infiltrate.js

This scripts hacks the UI in order to automagically solve all puzzles in order to infiltrate any company. This was developed
by multiple people in the game's discord server.

### scan.js

This script will give you all the servers, their hack status and commands to directly connect and backdoor the servers.
It was developed by [alainbryden](https://github.com/alainbryden).
