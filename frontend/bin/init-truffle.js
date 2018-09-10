// Initialize the truffle environment however we want, web3 is available
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const contractsDir = path.resolve(__dirname, '../client/lib/contracts');

const CONTRACTS_REPO_BASE_PATH = path.resolve(
    __dirname,
    '../../contract',
);

const externalBuildContractsDir = path.join(
    CONTRACTS_REPO_BASE_PATH,
    '/build/contracts',
);

module.exports = function (done) {
    // Remove the old contracts
    rimraf.sync(contractsDir);

    // Fund ETH accounts
    const ethAccounts = process.env.FUND_ETH_ADDRESSES
        ? process.env.FUND_ETH_ADDRESSES.split(',').map(a => a.trim())
        : [];

    if (ethAccounts.length) {
        console.info('Sending 50 ETH to the following addresses...');
        ethAccounts.forEach((addr, i) => {
            web3.eth.sendTransaction({
                to: addr,
                from: web3.eth.accounts[i],
                value: web3.toWei('50', 'ether'),
            });
            console.info(`    ${addr} <- from ${web3.eth.accounts[i]}`);
        });
    } else {
        console.info('No accounts specified for funding in .env file...');
    }

    console.info('Changing working directory to: ' + process.cwd());
    console.info('Compiling smart contracts...');
    childProcess.execSync('yarn build', {cwd: CONTRACTS_REPO_BASE_PATH});
    console.info('Running migrations...');
    childProcess.execSync('truffle migrate', {cwd: CONTRACTS_REPO_BASE_PATH});
    console.info('Linking contracts to client/lib/contracts...');
    fs.symlinkSync(externalBuildContractsDir, contractsDir);
    console.info('Truffle initialized, starting repl console!');
    done();
};
