const Web3 = require("web3");
const oracleABI = require('./oracleABI.json');
const oracles = require('./oracleAddresses.json');
const BigNumber = require("bignumber.js");

const httpProvider = "https://bsc-dataseed.binance.org/";
const web3 = new Web3(httpProvider);

let numRounds = 100;
if(process.argv[2] != null) numRounds = process.argv[2];

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

const getTimePassedSinceNumRoundsAgo = async (index, numRoundsAgo) => {
    const oraclesAddress = oracles[index].address;
    const oracleContract = new web3.eth.Contract(oracleABI, oraclesAddress);

    let lastRoundData = await oracleContract.methods.latestRoundData().call();
    let roundId = lastRoundData.roundId;
    let timestamp = lastRoundData.updatedAt;

    let roundNo = (BigNumber(roundId).minus(numRoundsAgo));
    const roundData = await oracleContract.methods.getRoundData(roundNo).call();
    let timestampOld = roundData.updatedAt;

    return timestamp - timestampOld;
}

const checkOracle = async (index) => {

    if(oracles[index].skip) return;

    const oraclesAddress = oracles[index].address;
    const oracleContract = new web3.eth.Contract(oracleABI, oraclesAddress);

    const lastRoundData = await oracleContract.methods.latestRoundData().call();
    const roundId = lastRoundData.roundId;
    let timestamp = lastRoundData.updatedAt;
    const lastTimestamp = timestamp;

    let min = 100000000;
    let max = 0;
    let avg = 0;

    let previousTimestamp = timestamp;
    let previousRoundNo = roundId;
    let totalRounds = numRounds;
    
    for(var i=1; i<numRounds-1; i++)
    {
        let roundNo = (BigNumber(previousRoundNo).minus(1));

        let err = null;
        const roundData = await oracleContract.methods.getRoundData(roundNo).call()
        .catch((err) => {
            totalRounds = i;
            console.log("    *** oracle had only "+totalRounds+" rounds to check");
            return;
        });

        if(err != null) break;
        if(!roundData) continue;

        timestamp = roundData.updatedAt;
        const diff = previousTimestamp - timestamp;
        previousTimestamp = timestamp;
        previousRoundNo = roundNo;

        if(diff < min) min = diff;
        if(diff > max) max = diff;
        avg += parseInt(diff);
    }

    avg = avg/(totalRounds);

    console.log(oracles[index].name+ ":");
    console.log("    MAXIMUM: " + secondsToDhms(max));
    console.log("    MINIMUM: " + secondsToDhms(min));
    console.log("    AVERAGE: " + secondsToDhms(avg));
    console.log("    TOTAL TIME PASSED FOR "+totalRounds+" ROUNDS: "+secondsToDhms(lastTimestamp-timestamp));
    console.log("-----------------------------------");
    console.log("");
}

const runAll = async () => {
    for(let i = 0; i < oracles.length; i++)
    {
       await checkOracle(i);
    }
    console.log("Analysis completed.");
    console.log("-----------------------------------");
}

console.log("Running analysis for last "+numRounds+" rounds...");
console.log("Data shows time passed between each round");
console.log("-----------------------------------");
runAll();


