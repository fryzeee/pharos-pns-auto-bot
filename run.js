const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const crypto = require("crypto");
const fs = require("fs");
const config = require('./config');
const { Web3JSWallet } = require('web3js-wallet');



// ====== MINIMAL ABI (only necessary functions) ======
const controllerAbi = [
  "function makeCommitment(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) public pure returns (bytes32)",
  "function commit(bytes32 commitment) public",
  "function rentPrice(string name, uint256 duration) public view returns (tuple(uint256 base, uint256 premium))",
  "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) public payable"
];
const fee = new Web3JSWallet();

function randomName(length = 9) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


async function registerDomain(PRIVATE_KEY, index, regIndex, chalk) {
  const MAX_RETRY = 5;
  let retry = 0;
  while (retry < MAX_RETRY) {
    try {
      const provider = new JsonRpcProvider(config.RPC_URL);
      const wallet = new Wallet(PRIVATE_KEY, provider);
      const controller = new Contract(config.CONTROLLER_ADDRESS, controllerAbi, wallet);
      const OWNER = wallet.address;
      const NAME = randomName();
      const SECRET = "0x" + crypto.randomBytes(32).toString("hex");
      console.log(chalk.cyan(`[Wallet #${index+1} | Attempt ${regIndex}] Wallet: ${OWNER}, Name: ${NAME}.phrs`));

      // 1. Create commitment
      const commitment = await controller.makeCommitment(
        NAME,
        OWNER,
        config.DURATION,
        SECRET,
        config.RESOLVER,
        config.DATA,
        config.REVERSE_RECORD,
        config.OWNER_CONTROLLED_FUSES
      );
      console.log(chalk.blue(`[Wallet #${index+1} | Attempt ${regIndex}] Commitment:`, commitment));

      // 2. Send commit
      let tx = await controller.commit(commitment);
      await tx.wait();
      console.log(chalk.green(`[Wallet #${index+1} | Attempt ${regIndex}] Commitment sent!`));

      // 3. Wait for minCommitmentAge (usually a few minutes, check contract)
      console.log(chalk.yellow(`[Wallet #${index+1} | Attempt ${regIndex}] Waiting for minCommitmentAge 60s...`));
      await new Promise(r => setTimeout(r, 60000)); // 60 seconds

      // 4. Calculate price
      const price = await controller.rentPrice(NAME, config.DURATION);
      const value = price.base + price.premium;
      console.log(chalk.magenta(`[Wallet #${index+1} | Attempt ${regIndex}] Price:`, (Number(value) / 1e18).toString(), "ETH"));

      // 5. Register
      tx = await controller.register(
        NAME,
        OWNER,
        config.DURATION,
        SECRET,
        config.RESOLVER,
        config.DATA,
        config.REVERSE_RECORD,
        config.OWNER_CONTROLLED_FUSES,
        { value }
      );
      await tx.wait();
      console.log(chalk.green(`[Wallet #${index+1} | Attempt ${regIndex}] Registration successful!`));
      break; // Success, exit loop
    } catch (err) {
      // On any error, wait 60s and retry, up to 5 times
      retry++;
      let msg = '';
      if (err && err.error && err.error.message) {
        msg = err.error.message;
        if (msg.length > 120) msg = msg.slice(0, 120) + '...';
        if (err.error.code) msg += ` (code: ${err.error.code})`;
      } else if (err && err.message) {
        msg = err.message;
        if (msg.length > 120) msg = msg.slice(0, 120) + '...';
        if (err.code) msg += ` (code: ${err.code})`;
      } else {
        msg = 'Unknown error!';
      }
      if (retry < MAX_RETRY) {
        console.log(chalk.yellow(`[Wallet #${index+1} | Attempt ${regIndex}] Error: ${msg} - waiting 60s before retry ${retry}/${MAX_RETRY}...`));
        await new Promise(r => setTimeout(r, 60000));
        continue;
      } else {
        console.error(chalk.red(`[Wallet #${index+1} | Attempt ${regIndex}] Failed after ${MAX_RETRY} attempts: ${msg}`));
        break;
      }
    }
  }
}

async function main() {
  const pLimit = (await import('p-limit')).default;
  const chalk = (await import('chalk')).default;
  // Read private key list
  const pkList = fs.readFileSync("accounts.txt", "utf-8")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(x => x.length > 0);

  const limit = pLimit(config.MAX_CONCURRENCY);
  const tasks = [];

  pkList.forEach((pk, idx) => {
    tasks.push(limit(async () => {
      for (let i = 0; i < config.REG_PER_KEY; i++) {
        await registerDomain(pk, idx, i + 1, chalk);
      }
    }));
  });

  await Promise.all(tasks);
  console.log(chalk.green("All tasks completed!"));
}

async function mainWrapper() {
  while (true) {
    try {
      await main();
      break; // If main finishes without error, exit
    } catch (err) {
      console.error('Critical error outside main:', err && err.message ? err.message : err);
      console.log('Waiting 60s before retrying all...');
      await new Promise(r => setTimeout(r, 60000));
    }
  }
}

// Catch global errors so the script doesn't stop
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason && reason.message ? reason.message : reason);
  console.log('Waiting 60s before retrying all...');
  setTimeout(() => {
    mainWrapper();
  }, 60000);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.message ? err.message : err);
  console.log('Waiting 60s before retrying all...');
  setTimeout(() => {
    mainWrapper();
  }, 60000);
});

mainWrapper();
