# Bitburner toolkit scripts

These are the scripts I used to beat the BitBurner game.

## Update: Mar-2023

After getting back into the game a few months ago, I updated some scripts and created a few more.

Special mention to the `starter.js` script and its children in the `starters``/` folder. They kind of break the no-full-automation clause of this repo, but the essence is not to fully automate anything here, just to get rid of some repetitive tasks.

Changes:

* Fixed bugs on `spiderCracker.js`
* rebranded `logWriter` to `logManger` and added a `readLog` function.
* Added a few new `serverScanner` functions
* Refactored `deployHack` a little
* Removed the annoying sleep log on `remote/hack.js`
* Refactored `purchaseServers` a bit
* Added an `info` script to grab some information from servers on demand.
* Borrowed `loopInfiltrate` to remove some repetitive work out of infiltration.
* Refactored `levelupHack` and renamed it.

## Disclaimer

Those were all quick scripts developed to beat the challenges of the game. Time is the biggest constraint, I was not
able to optimize the scripts. However, they get the job done. :)

There are a couple of scripts I borrowed, credit is given to the script's first lines.

## Strategy

I did not want to create an autopilot, but rather have a more active role while using scripts as tools to beat the game.

The main strategy used was to start by running `spiderCracker.js` to kick-start the hacking of servers.
From there, I will either activate `infiltrate.js` to infiltrate companies for fast money and faction rep or start training
my hacking level with either `levelUpHacking.js` or simply training on university depending on the bitNode. I will also
manually buy port apps to liberate the cracking of servers.

Goals change according to BitNote, but generally, the early game goal is to max out private servers at 8Tb RAM, while
backdooring faction servers and farming up faction rep through infiltration. Once there, I switch gears to maxing out
the requirements to beat the BitNode.

### Scripts

#### deployHack.js

Used to deploy a calculated distribution of grow, weaken and hack commands that will loop across all servers to get
money from the targeted server.

Scripts are deployed following an arbitrary proportion of 10 `grow` threads and 2 `weaken` threads for each `hack` thread. The
max thread capacity of the server being deployed is measured by the script before executing each of the `remote/` scripts.

Once I reach the end game, I just either `levelUpHacking.js` to maximize hacking skill or
`run deployHack.js --s harakiri-sushi` followed by `run deployHack.js --max` to maximize profits. After this, I start
working on the requirements to beat the bitNode.

**Usage:**

`run deployHack.js --s Target`

This will deploy scripts on all hacked and private servers to hack the `<target>`

**Parameters:**

`--s Target [Servers...]`

Deploy scripts on all servers for Target. If you want to specify servers that will have the scripts deploy for the target
simply name them after the target, separated by spaces

`--t Target [Target2] [Targets...]`

Iterates across private servers, deploying hacking scripts on one private server for each target.

`--o Target Server`

Deploy hacking scripts on a single server for a single target.

`--max`

This will select the server with the most money that has a required hacking level that is below a third of your current hacking level.

### spiderCracker.js

The most automatic script of the toolkit. You just run it and it will iterate through all servers every 10 seconds, cracking
any server it can. A terminal message will be output for every server it cracks into.

### purchaseServer.js

`run purchaseServer.js [RamPotency]`

Automation to buy and upgrade private servers. It runs on a loop, initially buying servers with 8GB ram until it reaches
the limit of servers. Once the limit is reached, it will raise the ram based on the amount you can buy for all servers.
The default maximum RAM is 16Tb `ramMaxPotency = 14`. I found it enough for the first phases of a bitNode. If you want to
go higher, just run the command with the factor you want to upgrade to (game maximum being 20).

If scripts are running on the server as it is getting upgraded, they will be re-initialized with threads adjusted. The trade-off is that if you are in the middle of a long hack/weaken/grow, then it will be rebooted, so it is recommended
that you keep those for after you reached maximum RAM.

### info.js

```shell
run info.js --[money|server] <target>
```

`money`: will provide you with current and max money, as well as a current / max ratio.
`server`: will provide you with some hacking-related information on the server.

## Borrowed Scripts

### infiltrate.js

This script hacks the UI to _automagically_ solve all puzzles to infiltrate any company. This was developed
by multiple people in the game's discord server.

### loopInfiltrate.js

Script borrowed from [abarnert](https://github.com/abarnert) that loops the `infiltrate.js` script, giving rep to the defined faction.

You need to modify the `argsSchema`` variable for the script to run right now. I intend on refactoring it to work as intended and to also be able to correctly kill the script while looping without having to go into the dev console.

### scan.js

This script will give you all the servers, their hack status and commands to directly connect and backdoor the servers.
It was developed by [alainbryden](https://github.com/alainbryden).
