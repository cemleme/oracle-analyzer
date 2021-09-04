Analysis script for Chainlink Oracles
addresses can be found at: https://docs.chain.link/docs/binance-smart-chain-addresses/

given oracle addresses belong to binance smart chain, if you wish to check other chains simply update the addresses
at oracleAddresses.json

and set the http provider link at index.js
example:
const httpProvider = "https://bsc-dataseed.binance.org/";

----

The script shows the max, min and avg time between each round of an oracle. The analysis can be used on dapps that depend on the time passed between rounds.

How to install:
npm install

How to use:

default command checks for last 100 rounds
node index.js

command checks for given last rounds
node index.js 5

save the output into a text file
node index.js 5 > 5rounds.txt

example data can be found at 5rounds.txt
