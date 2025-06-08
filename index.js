import "dotenv/config";
import blessed from "blessed";
import figlet from "figlet";
import { ethers } from "ethers";
import axios from "axios";

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ATH_ADDRESS = process.env.ATH_ADDRESS;
const AI16Z_ADDRESS = process.env.AI16Z_ADDRESS;
const USDE_ADDRESS = process.env.USDE_ADDRESS;
const VANA_ADDRESS = process.env.VANA_ADDRESS;
const VIRTUAL_ADDRESS = process.env.VIRTUAL_ADDRESS;
const LULUSD_ADDRESS = process.env.LULUSD_ADDRESS;
const AZUSD_ADDRESS = process.env.AZUSD_ADDRESS;
const VANAUSD_ADDRESS = process.env.VANAUSD_ADDRESS;
const AUSD_ADDRESS = process.env.AUSD_ADDRESS;
const VUSD_ADDRESS = process.env.VUSD_ADDRESS;
const OG_ADDRESS = "0xFBBDAb7684A4Da0CFAE67C5c13fA73402008953e";
const OUSD_ADDRESS = "0xD23016Fd7154d9A6F2830Bfb4eA3F3106AAE0E88";
const USD1_ADDRESS = "0x16a8A3624465224198d216b33E825BcC3B80abf7";
const ROUTER_ADDRESS_AUSD = "0x2cFDeE1d5f04dD235AEA47E1aD2fB66e3A61C13e";
const ROUTER_ADDRESS_VUSD = "0x3dCACa90A714498624067948C092Dd0373f08265";
const ROUTER_ADDRESS_AZUSD = "0xB0b53d8B4ef06F9Bbe5db624113C6A5D35bB7522";
const ROUTER_ADDRESS_VANAUSD = "0xEfbAE3A68b17a61f21C7809Edfa8Aa3CA7B2546f";
const ROUTER_ADDRESS_OUSD = "0x0b4301877A981e7808A8F4B6E277C376960C7641";
const STAKING_ADDRESS_AZUSD = "0xf45Fde3F484C44CC35Bdc2A7fCA3DDDe0C8f252E";
const STAKING_ADDRESS_VANAUSD = "0x2608A88219BFB34519f635Dd9Ca2Ae971539ca60";
const STAKING_ADDRESS_VUSD = "0x5bb9Fa02a3DCCDB4E9099b48e8Ba5841D2e59d51";
const STAKING_ADDRESS_AUSD = "0x054de909723ECda2d119E31583D40a52a332f85c";
const STAKING_ADDRESS_LULUSD = "0x5De3fBd40D4c3892914c3b67b5B529D776A1483A";
const STAKING_ADDRESS_USDE = "0x3988053b7c748023a1aE19a8ED4c1Bf217932bDB";
const STAKING_ADDRESS_OUSD = "0xF8F951DA83dAC732A2dCF207B644E493484047eB";
const STAKING_ADDRESS_USD1 = "0x7799841734Ac448b8634F1c1d7522Bc8887A7bB9";
const NETWORK_NAME = "Arbitrum Sepolia";
const DEBUG_MODE = false;

const ERC20ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
];

const ROUTER_ABI_MINT = [
  {
    "inputs": [{ "type": "uint256", "name": "amount" }],
    "name": "customMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const STAKING_ABI = [
  {
    "inputs": [{ "type": "uint256", "name": "amount" }],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "selector": "0xa694fc3a"
  },
  {
    "inputs": [],
    "name": "vault",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ausd",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const TOKEN_CONFIG = {
  AUSD: {
    routerAddress: ROUTER_ADDRESS_AUSD,
    selector: "0x1bf6318b",
    inputTokenAddress: ATH_ADDRESS,
    outputTokenAddress: AUSD_ADDRESS,
    inputTokenName: "ATH",
    minAmount: 50
  },
  VUSD: {
    routerAddress: ROUTER_ADDRESS_VUSD,
    selector: "0xa6d67510",
    inputTokenAddress: VIRTUAL_ADDRESS,
    outputTokenAddress: VUSD_ADDRESS,
    inputTokenName: "Virtual",
    minAmount: 2
  },
  AZUSD: {
    routerAddress: ROUTER_ADDRESS_AZUSD,
    selector: "0xa6d67510",
    inputTokenAddress: AI16Z_ADDRESS,
    outputTokenAddress: AZUSD_ADDRESS,
    inputTokenName: "Ai16Z",
    minAmount: 5
  },
  VANAUSD: {
    routerAddress: ROUTER_ADDRESS_VANAUSD,
    selector: "0xa6d67510",
    inputTokenAddress: VANA_ADDRESS,
    outputTokenAddress: VANAUSD_ADDRESS,
    inputTokenName: "VANA",
    minAmount: 0.2
  },
  OUSD: {
    routerAddress: ROUTER_ADDRESS_OUSD,
    selector: "0xa6d67510",
    inputTokenAddress: OG_ADDRESS,
    outputTokenAddress: OUSD_ADDRESS,
    inputTokenName: "0G",
    minAmount: 1
  }
};

const STAKING_CONFIG = {
  AZUSD: {
    stakingAddress: STAKING_ADDRESS_AZUSD,
    tokenAddress: AZUSD_ADDRESS,
    tokenName: "azUSD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  VANAUSD: {
    stakingAddress: STAKING_ADDRESS_VANAUSD,
    tokenAddress: VANAUSD_ADDRESS,
    tokenName: "VANAUSD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  VUSD: {
    stakingAddress: STAKING_ADDRESS_VUSD,
    tokenAddress: VUSD_ADDRESS,
    tokenName: "vUSD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  AUSD: {
    stakingAddress: STAKING_ADDRESS_AUSD,
    tokenAddress: AUSD_ADDRESS,
    tokenName: "AUSD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: false,
    requiresTokenFunction: false
  },
  LULUSD: {
    stakingAddress: STAKING_ADDRESS_LULUSD,
    tokenAddress: LULUSD_ADDRESS,
    tokenName: "LULUSD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  USDE: {
    stakingAddress: STAKING_ADDRESS_USDE,
    tokenAddress: USDE_ADDRESS,
    tokenName: "USDe",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  OUSD: {
    stakingAddress: STAKING_ADDRESS_OUSD,
    tokenAddress: OUSD_ADDRESS,
    tokenName: "0USD",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  },
  USD1: {
    stakingAddress: STAKING_ADDRESS_USD1,
    tokenAddress: USD1_ADDRESS,
    tokenName: "USD1",
    minAmount: 0.0001,
    requiresTransferFeeCheck: true,
    requiresTokenFunction: true
  }
};

const FAUCET_APIS = {
  ATH: "https://app.x-network.io/maitrix-faucet/faucet",
  USDe: "https://app.x-network.io/maitrix-usde/faucet",
  LULUSD: "https://app.x-network.io/maitrix-lvl/faucet",
  Ai16Z: "https://app.x-network.io/maitrix-ai16z/faucet",
  Virtual: "https://app.x-network.io/maitrix-virtual/faucet",
  Vana: "https://app.x-network.io/maitrix-vana/faucet",
  USD1: "https://app.x-network.io/maitrix-usd1/faucet",
  OG: "https://app.x-network.io/maitrix-0g/faucet"
};

let walletInfo = {
  address: "",
  balanceEth: "0.00",
  balanceAth: "0.00",
  balanceAi16z: "0.00",
  balanceUsde: "0.00",
  balanceVana: "0.00",
  balanceVirtual: "0.00",
  balanceLulusd: "0.00",
  balanceAzusd: "0.00",
  balanceVanausd: "0.00",
  balanceAusd: "0.00",
  balanceVusd: "0.00",
  balanceOg: "0.00",
  balanceOusd: "0.00",
  balanceUsd1: "0.00",
  network: NETWORK_NAME,
  status: "Initializing",
};

let transactionLogs = [];
let actionRunning = false;
let actionCancelled = false;
let globalWallet = null;
let provider = null;
let transactionQueue = Promise.resolve();
let transactionQueueList = [];
let transactionIdCounter = 0;

function getShortAddress(address) {
  return address ? address.slice(0, 6) + "..." + address.slice(-4) : "N/A";
}

function addLog(message, type) {
  if (type === "debug" && !DEBUG_MODE) return;
  const timestamp = new Date().toLocaleTimeString();
  let coloredMessage = message;
  if (type === "system") coloredMessage = `{bright-white-fg}${message}{/bright-white-fg}`;
  else if (type === "error") coloredMessage = `{bright-red-fg}${message}{/bright-red-fg}`;
  else if (type === "success") coloredMessage = `{bright-green-fg}${message}{/bright-green-fg}`;
  else if (type === "warning") coloredMessage = `{bright-yellow-fg}${message}{/bright-yellow-fg}`;
  else if (type === "debug") coloredMessage = `{bright-magenta-fg}${message}{/bright-magenta-fg}`;

  transactionLogs.push(`{bright-cyan-fg}[{/bright-cyan-fg} {bold}{grey-fg}${timestamp}{/grey-fg}{/bold} {bright-cyan-fg}]{/bright-cyan-fg} {bold}${coloredMessage}{/bold}`);
  updateLogs();
}

function updateLogs() {
  logsBox.setContent(transactionLogs.join("\n"));
  logsBox.setScrollPerc(100);
  safeRender();
}

function clearTransactionLogs() {
  transactionLogs = [];
  logsBox.setContent("");
  logsBox.setScroll(0);
  updateLogs();
  safeRender();
  addLog("Transaction logs telah dihapus.", "system");
}

async function waitWithCancel(delay, type) {
  return Promise.race([
    new Promise((resolve) => setTimeout(resolve, delay)),
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (type === "action" && actionCancelled) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }),
  ]);
}

async function addTransactionToQueue(transactionFunction, description = "Transaksi") {
  const transactionId = ++transactionIdCounter;
  transactionQueueList.push({
    id: transactionId,
    description,
    timestamp: new Date().toLocaleTimeString(),
    status: "queued",
  });
  addLog(`Transaksi [${transactionId}] ditambahkan ke antrean: ${description}`, "system");
  updateQueueDisplay();

  transactionQueue = transactionQueue.then(async () => {
    updateTransactionStatus(transactionId, "processing");
    try {
      const result = await transactionFunction();
      updateTransactionStatus(transactionId, "completed");
      addLog(`Transaksi [${transactionId}] Selesai.`, "debug");
      return result;
    } catch (error) {
      updateTransactionStatus(transactionId, "error");
      addLog(`Transaksi [${transactionId}] gagal: ${error.message}`, "error");
      return null;
    } finally {
      removeTransactionFromQueue(transactionId);
      updateQueueDisplay();
    }
  });
  return transactionQueue;
}

function updateTransactionStatus(id, status) {
  transactionQueueList.forEach((tx) => {
    if (tx.id === id) tx.status = status;
  });
  updateQueueDisplay();
}

function removeTransactionFromQueue(id) {
  transactionQueueList = transactionQueueList.filter((tx) => tx.id !== id);
  updateQueueDisplay();
}

function getTransactionQueueContent() {
  if (transactionQueueList.length === 0) return "Tidak ada transaksi dalam antrean.";
  return transactionQueueList
    .map((tx) => `ID: ${tx.id} | ${tx.description} | ${tx.status} | ${tx.timestamp}`)
    .join("\n");
}

let queueMenuBox = null;
let queueUpdateInterval = null;

function showTransactionQueueMenu() {
  const container = blessed.box({
    label: " Antrian Transaksi ",
    top: "10%",
    left: "center",
    width: "80%",
    height: "80%",
    border: { type: "line" },
    style: { border: { fg: "blue" } },
    keys: true,
    mouse: true,
    interactive: true,
  });
  const contentBox = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: "90%",
    content: getTransactionQueueContent(),
    scrollable: true,
    keys: true,
    mouse: true,
    alwaysScroll: true,
    scrollbar: { ch: " ", inverse: true, style: { bg: "blue" } },
  });
  const exitButton = blessed.button({
    content: " [Keluar] ",
    bottom: 0,
    left: "center",
    shrink: true,
    padding: { left: 1, right: 1 },
    style: { fg: "white", bg: "red", hover: { bg: "blue" } },
    mouse: true,
    keys: true,
    interactive: true,
  });
  exitButton.on("press", () => {
    addLog("Keluar Dari Menu Antrian Transaksi.", "system");
    clearInterval(queueUpdateInterval);
    container.destroy();
    queueMenuBox = null;
    mainMenu.show();
    mainMenu.focus();
    screen.render();
  });
  container.key(["a", "s", "d"], () => {
    addLog("Keluar Dari Menu Antrian Transaksi.", "system");
    clearInterval(queueUpdateInterval);
    container.destroy();
    queueMenuBox = null;
    mainMenu.show();
    mainMenu.focus();
    screen.render();
  });
  container.append(contentBox);
  container.append(exitButton);
  queueUpdateInterval = setInterval(() => {
    contentBox.setContent(getTransactionQueueContent());
    screen.render();
  }, 1000);
  mainMenu.hide();
  screen.append(container);
  container.focus();
  screen.render();
}

function updateQueueDisplay() {
  if (queueMenuBox) {
    queueMenuBox.setContent(getTransactionQueueContent());
    screen.render();
  }
}

const screen = blessed.screen({
  smartCSR: true,
  title: "Maitrix Auto Bot",
  fullUnicode: true,
  mouse: true,
});

let renderTimeout;

function safeRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    screen.render();
  }, 50);
}

const headerBox = blessed.box({
  top: 0,
  left: "center",
  width: "100%",
  tags: true,
  style: { fg: "white", bg: "default" },
});

figlet.text("Airdrop Seeker".toUpperCase(), { font: "ANSI Shadow" }, (err, data) => {
  if (err) headerBox.setContent("{center}{bold}Airdrop Seeker{/bold}{/center}");
  else headerBox.setContent(`{center}{bold}{bright-cyan-fg}${data}{/bright-cyan-fg}{/bold}{/center}`);
  safeRender();
});

const descriptionBox = blessed.box({
  left: "center",
  width: "100%",
  content: "{center}{bold}{bright-yellow-fg}✦ ✦ MAITRIX AUTO BOT ✦ ✦{/bright-yellow-fg}{/bold}{/center}",
  tags: true,
  style: { fg: "white", bg: "default" },
});

const logsBox = blessed.box({
  label: " Transaction Logs ",
  left: 0,
  border: { type: "line" },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
  vi: true,
  tags: true,
  style: { border: { fg: "red" }, fg: "white" },
  scrollbar: { ch: " ", inverse: true, style: { bg: "blue" } },
  content: "",
});

const walletBox = blessed.box({
  label: " Informasi Wallet ",
  border: { type: "line" },
  tags: true,
  style: { border: { fg: "magenta" }, fg: "white", bg: "default" },
  content: "Loading data wallet...",
});

const mainMenu = blessed.list({
  label: " Menu ",
  left: "60%",
  keys: true,
  vi: true,
  mouse: true,
  border: { type: "line" },
  style: { fg: "white", bg: "default", border: { fg: "red" }, selected: { bg: "green", fg: "black" } },
  items: getMainMenuItems(),
});

function getMainMenuItems() {
  let items = [];
  if (actionRunning) items.push("Stop Transaction");
  items = items.concat(["Auto Mint Token", "Auto Claim Faucet", "Auto Stake", "Antrian Transaksi", "Clear Transaction Logs", "Refresh", "Exit"]);
  return items;
}

const autoMintSubMenu = blessed.list({
  label: " Auto Mint Sub Menu ",
  left: "60%",
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  border: { type: "line" },
  style: { fg: "white", bg: "default", border: { fg: "red" }, selected: { bg: "cyan", fg: "black" } },
  items: getAutoMintMenuItems(),
});
autoMintSubMenu.hide();

function getAutoMintMenuItems() {
  let items = [];
  if (actionRunning) items.push("Stop Transaction");
  items = items.concat(["Auto Mint AUSD", "Auto Mint vUSD", "Auto Mint VANAUSD", "Auto Mint azUSD", "Auto Mint 0USD", "Clear Transaction Logs", "Refresh", "Back to Main Menu"]);
  return items;
}

const autoClaimSubMenu = blessed.list({
  label: " Auto Claim Faucet Sub Menu ",
  left: "60%",
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  border: { type: "line" },
  style: { fg: "white", bg: "default", border: { fg: "red" }, selected: { bg: "cyan", fg: "black" } },
  items: getAutoClaimMenuItems(),
});
autoClaimSubMenu.hide();

function getAutoClaimMenuItems() {
  let items = [];
  if (actionRunning) items.push("Stop Transaction");
  items = items.concat(["Auto Claim All Faucet", "Clear Transaction Logs", "Refresh", "Back to Main Menu"]);
  return items;
}

const autoStakeSubMenu = blessed.list({
  label: " Auto Stake Sub Menu ",
  left: "60%",
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  border: { type: "line" },
  style: { fg: "white", bg: "default", border: { fg: "red" }, selected: { bg: "cyan", fg: "black" } },
  items: getAutoStakeMenuItems(),
});
autoStakeSubMenu.hide();

function getAutoStakeMenuItems() {
  let items = [];
  if (actionRunning) items.push("Stop Transaction");
  items = items.concat(["Auto Stake azUSD", "Auto Stake AUSD", "Auto Stake VANAUSD", "Auto Stake vUSD", "Auto Stake USDe", "Auto Stake LULUSD", "Auto Stake 0USD", "Auto Stake USD1", "Clear Transaction Logs", "Refresh", "Back to Main Menu"]);
  return items;
}

const promptBox = blessed.prompt({
  parent: screen,
  border: "line",
  height: 5,
  width: "60%",
  top: "center",
  left: "center",
  label: "{bright-blue-fg}Prompt{/bright-blue-fg}",
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  style: { fg: "bright-red", bg: "default", border: { fg: "red" } },
});

screen.append(headerBox);
screen.append(descriptionBox);
screen.append(logsBox);
screen.append(walletBox);
screen.append(mainMenu);
screen.append(autoMintSubMenu);
screen.append(autoClaimSubMenu);
screen.append(autoStakeSubMenu);

function adjustLayout() {
  const screenHeight = screen.height;
  const screenWidth = screen.width;
  const headerHeight = Math.max(8, Math.floor(screenHeight * 0.15));
  headerBox.top = 0;
  headerBox.height = headerHeight;
  headerBox.width = "100%";
  descriptionBox.top = "22%";
  descriptionBox.height = Math.floor(screenHeight * 0.05);
  logsBox.top = headerHeight + descriptionBox.height;
  logsBox.left = 0;
  logsBox.width = Math.floor(screenWidth * 0.6);
  logsBox.height = screenHeight - (headerHeight + descriptionBox.height);
  walletBox.top = headerHeight + descriptionBox.height;
  walletBox.left = Math.floor(screenWidth * 0.6);
  walletBox.width = Math.floor(screenWidth * 0.4);
  walletBox.height = Math.floor(screenHeight * 0.35);
  mainMenu.top = headerHeight + descriptionBox.height + walletBox.height;
  mainMenu.left = Math.floor(screenWidth * 0.6);
  mainMenu.width = Math.floor(screenWidth * 0.4);
  mainMenu.height = screenHeight - (headerHeight + descriptionBox.height + walletBox.height);
  autoMintSubMenu.top = mainMenu.top;
  autoMintSubMenu.left = mainMenu.left;
  autoMintSubMenu.width = mainMenu.width;
  autoMintSubMenu.height = mainMenu.height;
  autoClaimSubMenu.top = mainMenu.top;
  autoClaimSubMenu.left = mainMenu.left;
  autoClaimSubMenu.width = mainMenu.width;
  autoClaimSubMenu.height = mainMenu.height;
  autoStakeSubMenu.top = mainMenu.top;
  autoStakeSubMenu.left = mainMenu.left;
  autoStakeSubMenu.width = mainMenu.width;
  autoStakeSubMenu.height = mainMenu.height;
  safeRender();
}

screen.on("resize", adjustLayout);
adjustLayout();

async function getTokenBalance(tokenAddress) {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    const balance = await contract.balanceOf(globalWallet.address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    addLog(`Gagal mengambil saldo token ${tokenAddress}: ${error.message}`, "error");
    return "0";
  }
}

async function updateWalletData() {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    globalWallet = wallet;
    walletInfo.address = wallet.address;

    const ethBalance = await provider.getBalance(wallet.address);
    walletInfo.balanceEth = ethers.formatEther(ethBalance);

    const tokenAddresses = [
      ATH_ADDRESS,
      AI16Z_ADDRESS,
      USDE_ADDRESS,
      VANA_ADDRESS,
      VIRTUAL_ADDRESS,
      LULUSD_ADDRESS,
      AZUSD_ADDRESS,
      VANAUSD_ADDRESS,
      AUSD_ADDRESS,
      VUSD_ADDRESS,
      OG_ADDRESS,
      OUSD_ADDRESS,
      USD1_ADDRESS,
    ];

    const balancePromises = tokenAddresses.map(async (address) => {
      try {
        const contract = new ethers.Contract(address, ERC20ABI, provider);
        const balance = await contract.balanceOf(wallet.address);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
      } catch (error) {
        addLog(`Gagal mengambil saldo token ${address}: ${error.message}`, "error");
        return "0";
      }
    });

    const balances = await Promise.all(balancePromises);

    walletInfo.balanceAth = balances[0];
    walletInfo.balanceAi16z = balances[1];
    walletInfo.balanceUsde = balances[2];
    walletInfo.balanceVana = balances[3];
    walletInfo.balanceVirtual = balances[4];
    walletInfo.balanceLulusd = balances[5];
    walletInfo.balanceAzusd = balances[6];
    walletInfo.balanceVanausd = balances[7];
    walletInfo.balanceAusd = balances[8];
    walletInfo.balanceVusd = balances[9];
    walletInfo.balanceOg = balances[10];
    walletInfo.balanceOusd = balances[11];
    walletInfo.balanceUsd1 = balances[12];

    updateWallet();
    addLog("Wallet Information Updated !!", "system");
  } catch (error) {
    addLog("Gagal mengambil data wallet: " + error.message, "system");
  }
}


function updateWallet() {
  const shortAddress = walletInfo.address ? getShortAddress(walletInfo.address) : "N/A";
  const eth = walletInfo.balanceEth ? Number(walletInfo.balanceEth).toFixed(4) : "0.0000";
  const ath = walletInfo.balanceAth ? Number(walletInfo.balanceAth).toFixed(4) : "0.0000";
  const ai16z = walletInfo.balanceAi16z ? Number(walletInfo.balanceAi16z).toFixed(4) : "0.0000";
  const usde = walletInfo.balanceUsde ? Number(walletInfo.balanceUsde).toFixed(4) : "0.0000";
  const vana = walletInfo.balanceVana ? Number(walletInfo.balanceVana).toFixed(4) : "0.0000";
  const virtual = walletInfo.balanceVirtual ? Number(walletInfo.balanceVirtual).toFixed(4) : "0.0000";
  const lulusd = walletInfo.balanceLulusd ? Number(walletInfo.balanceLulusd).toFixed(4) : "0.0000";
  const azusd = walletInfo.balanceAzusd ? Number(walletInfo.balanceAzusd).toFixed(4) : "0.0000";
  const vanausd = walletInfo.balanceVanausd ? Number(walletInfo.balanceVanausd).toFixed(4) : "0.0000";
  const ausd = walletInfo.balanceAusd ? Number(walletInfo.balanceAusd).toFixed(4) : "0.0000";
  const vusd = walletInfo.balanceVusd ? Number(walletInfo.balanceVusd).toFixed(4) : "0.0000";
  const og = walletInfo.balanceOg ? Number(walletInfo.balanceOg).toFixed(4) : "0.0000";
  const ousd = walletInfo.balanceOusd ? Number(walletInfo.balanceOusd).toFixed(4) : "0.0000";
  const usd1 = walletInfo.balanceUsd1 ? Number(walletInfo.balanceUsd1).toFixed(4) : "0.0000";

  const content = ` Address: {bright-yellow-fg}${shortAddress}{/bright-yellow-fg}
 ETH    : {bright-green-fg}${eth.padStart(8)}{/bright-green-fg} | azUSD  : {bright-green-fg}${azusd.padStart(8)}{/bright-green-fg}
 ATH    : {bright-green-fg}${ath.padStart(8)}{/bright-green-fg} | VANAUSD: {bright-green-fg}${vanausd.padStart(8)}{/bright-green-fg}
 Ai16Z  : {bright-green-fg}${ai16z.padStart(8)}{/bright-green-fg} | aUSD   : {bright-green-fg}${ausd.padStart(8)}{/bright-green-fg}
 USDE   : {bright-green-fg}${usde.padStart(8)}{/bright-green-fg} | vUSD   : {bright-green-fg}${vusd.padStart(8)}{/bright-green-fg}
 Vana   : {bright-green-fg}${vana.padStart(8)}{/bright-green-fg} | LULUSD : {bright-green-fg}${lulusd.padStart(8)}{/bright-green-fg}
 Virtual: {bright-green-fg}${virtual.padStart(8)}{/bright-green-fg} | 0G     : {bright-green-fg}${og.padStart(8)}{/bright-green-fg}
 0USD   : {bright-green-fg}${ousd.padStart(8)}{/bright-green-fg} | USD1   : {bright-green-fg}${usd1.padStart(8)}{/bright-green-fg}
 Network: {bright-cyan-fg}${NETWORK_NAME}{/bright-cyan-fg}`;
  walletBox.setContent(content);
  safeRender();
}

function secondsToHoursMinutes(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} jam ${minutes} menit`;
}

function generateRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0 (Edition cdf)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function claimFaucet(token) {
  const apiUrl = FAUCET_APIS[token];
  if (!apiUrl) {
    throw new Error(`API untuk token ${token} tidak ditemukan.`);
  }

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": generateRandomUserAgent(),
    "Authorization": "Bearer",
    "Pragma": "no-cache",
    "Priority": "u=1, i",
    "Sec-Ch-Ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Opera";v="119"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "cross-site",
    "Origin": "https://app.testnet.themaitrix.ai",
    "Referer": "https://app.testnet.themaitrix.ai/",
  };

  const payload = {
    address: globalWallet.address,
  };

  try {
    const response = await axios.post(apiUrl, payload, { headers });
    const { code, message, data } = response.data;

    if (code === 200) {
      addLog(`Berhasil claim ${token}: ${data.amount} token. TxHash: ${data.txHash}`, "success");
      return { receipt: { status: 1 }, txHash: data.txHash };
    } else if (code === 202) {
      const waitTime = secondsToHoursMinutes(parseInt(data.remainTime));
      addLog(`Gagal claim ${token}: ${message.replace(/\d+ seconds/, waitTime)}`, "warning");
      return { receipt: { status: 0 } };
    } else {
      addLog(`Gagal claim ${token}: ${message}`, "error");
      return { receipt: { status: 0 } };
    }
  } catch (error) {
    addLog(`Error saat claim ${token}: ${error.message}. Melanjutkan ke token berikutnya.`, "error");
    return { receipt: { status: 0 } };
  }
}

async function mintToken(token, amount) {
  try {
    const config = TOKEN_CONFIG[token];
    if (!config) {
      throw new Error(`Token ${token} tidak didukung.`);
    }

    const { routerAddress, selector, inputTokenAddress, outputTokenAddress, inputTokenName } = config;

    if (!ethers.isAddress(inputTokenAddress) || !ethers.isAddress(outputTokenAddress) || !ethers.isAddress(routerAddress)) {
      throw new Error(`Alamat kontrak tidak valid: Input=${inputTokenAddress}, Output=${outputTokenAddress}, Router=${routerAddress}`);
    }

    const inputContract = new ethers.Contract(inputTokenAddress, ERC20ABI, globalWallet);
    const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI_MINT, globalWallet);
    let decimals;
    try {
      decimals = await inputContract.decimals();
      addLog(`Desimal token ${inputTokenName}: ${decimals}`, "debug");
    } catch (error) {
      throw new Error(`Gagal mengambil desimal ${inputTokenName}: ${error.message}`);
    }

    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    const balance = await inputContract.balanceOf(globalWallet.address);

    if (balance < amountWei) {
      throw new Error(`Saldo ${inputTokenName} tidak cukup: ${ethers.formatUnits(balance, decimals)} tersedia, ${amount} diperlukan`);
    }

    const allowance = await inputContract.allowance(globalWallet.address, routerAddress);
    if (allowance < amountWei) {
      addLog(`Requesting Approval For ${amount} ${inputTokenName}...`, "warning");
      const approveTx = await inputContract.approve(routerAddress, amountWei);
      await approveTx.wait();
      addLog(`Approval Successfully!`, "success");
    }

    const paddedAmount = ethers.zeroPadValue(ethers.toBeHex(amountWei), 32);
    const txData = selector + paddedAmount.slice(2);

    try {
      addLog(`Mensimulasikan transaksi dengan selector ${selector}`, "debug");
      await provider.call({
        to: routerAddress,
        data: txData,
        from: globalWallet.address,
      });
      addLog(`Simulasi transaksi berhasil`, "debug");
    } catch (error) {
      let revertReason = error.data ? (routerContract.interface.parseError(error.data)?.name || error.data) : "Tidak dapat menentukan alasan revert";
      addLog(`Simulasi transaksi gagal: ${revertReason}`, "warning");
      if (token !== "AUSD") {
        throw new Error(`Simulasi transaksi gagal: ${revertReason}`);
      }
    }

    addLog(`Mengirim transaksi mint dengan selector ${selector}`, "debug");
    const tx = await globalWallet.sendTransaction({
      to: routerAddress,
      data: txData,
      gasLimit: 250000,
    });
    addLog(`Transaksi dikirim. TxHash: ${tx.hash}`, "warning");
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      const txHash = receipt.transactionHash || receipt.hash;
      addLog(`Berhasil Mint ${token}: ${amount} ${inputTokenName}. TxHash: ${txHash}`, "success");
      return txHash;
    } else {
      throw new Error(`Transaksi gagal: TxHash: ${receipt.transactionHash || receipt.hash}`);
    }
  } catch (error) {
    throw new Error(`Gagal mint ${token}: ${error.message}`);
  }
}

async function checkTokenTransferFee(tokenAddress, amountWei, decimals, stakingAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, globalWallet);
    const balanceBefore = await tokenContract.balanceOf(stakingAddress);
    const tempAmount = ethers.parseUnits("0.01", decimals);
    const walletBalance = await tokenContract.balanceOf(globalWallet.address);
    addLog(`Saldo wallet untuk ${tokenAddress}: ${ethers.formatUnits(walletBalance, decimals)}`, "debug");
    if (walletBalance < tempAmount) {
      addLog(`Saldo tidak cukup untuk uji coba transfer: ${ethers.formatUnits(walletBalance, decimals)} < ${ethers.formatUnits(tempAmount, decimals)}`, "debug");
      return true;
    }
    const allowance = await tokenContract.allowance(globalWallet.address, stakingAddress);
    addLog(`Allowance untuk ${tokenAddress} ke ${stakingAddress}: ${ethers.formatUnits(allowance, decimals)}`, "debug");
    if (allowance < tempAmount) {
      addLog(`Menyetujui allowance untuk pengujian biaya transfer...`, "debug");
      const approveTx = await tokenContract.approve(stakingAddress, tempAmount, { gasLimit: 100000 });
      await approveTx.wait();
      addLog(`Allowance untuk pengujian disetujui. TxHash: ${approveTx.hash}`, "debug");
    }
    try {
      await tokenContract.estimateGas.transferFrom(globalWallet.address, stakingAddress, tempAmount);
    } catch (error) {
      return true;
    }
    const transferTx = await tokenContract.transferFrom(globalWallet.address, stakingAddress, tempAmount, { gasLimit: 150000 });
    await transferTx.wait();
    const balanceAfter = await tokenContract.balanceOf(stakingAddress);
    const expectedBalance = balanceBefore + tempAmount;
    const hasFee = balanceAfter < expectedBalance;
    addLog(`Token ${tokenAddress} ${hasFee ? 'memiliki biaya transfer' : 'tidak memiliki biaya transfer'}`, "debug");
    return hasFee;
  } catch (error) {
    if (error.data && error.data.startsWith("0xfb8f41b2")) {
      addLog(`Custom error (0xfb8f41b2) terdeteksi, menganggap tidak ada biaya transfer`, "debug");
      return false;
    }
    return true;
  }
}

async function checkVault(stakingAddress, token) {
  try {
    const config = STAKING_CONFIG[token];
    if (!config) {
      throw new Error(`Konfigurasi untuk token ${token} tidak ditemukan.`);
    }
    const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);
    const vaultAddress = await stakingContract.vault();
    const tokenAddress = config.requiresTokenFunction
      ? await stakingContract.token()
      : await stakingContract.ausd();
    if (!ethers.isAddress(vaultAddress) || vaultAddress === ethers.ZeroAddress) {
      throw new Error(`Vault tidak valid atau belum disetel: ${vaultAddress}`);
    }
    if (!ethers.isAddress(tokenAddress) || tokenAddress === ethers.ZeroAddress) {
      throw new Error(`Token tidak valid atau belum disetel: ${tokenAddress}`);
    }
    const vaultCode = await provider.getCode(vaultAddress);
    if (vaultCode === "0x") {
      throw new Error(`Vault bukan kontrak: ${vaultAddress}`);
    }
    return vaultAddress;
  } catch (error) {
    throw new Error(`Gagal memeriksa vault: ${error.message}`);
  }
}

async function stakeToken(token, amount) {
  try {
    const config = STAKING_CONFIG[token];
    if (!config) {
      throw new Error(`Token ${token} tidak didukung untuk staking.`);
    }

    const { stakingAddress, tokenAddress, tokenName, requiresTransferFeeCheck } = config;

    if (!ethers.isAddress(tokenAddress) || !ethers.isAddress(stakingAddress)) {
      throw new Error(`Alamat kontrak tidak valid: Token=${tokenAddress}, Staking=${stakingAddress}`);
    }

    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, globalWallet);
    const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, globalWallet);
    let decimals;
    try {
      decimals = await tokenContract.decimals();
      addLog(`Desimal token ${tokenName}: ${decimals}`, "debug");
    } catch (error) {
      throw new Error(`Gagal mengambil desimal ${tokenName}: ${error.message}`);
    }
    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    const balance = await tokenContract.balanceOf(globalWallet.address);
    addLog(`Saldo ${tokenName}: ${ethers.formatUnits(balance, decimals)} ${tokenName}`, "debug");
    if (balance < amountWei) {
      throw new Error(`Saldo ${tokenName} tidak cukup: ${ethers.formatUnits(balance, decimals)} tersedia, ${amount} diperlukan`);
    }

    let hasTransferFee = false;
    if (requiresTransferFeeCheck) {
      hasTransferFee = await checkTokenTransferFee(tokenAddress, amountWei, decimals, stakingAddress);
    }

    await checkVault(stakingAddress, token);

    const allowance = await tokenContract.allowance(globalWallet.address, stakingAddress);
    if (allowance < amountWei) {
      addLog(`Requesting Approval ${amount} ${tokenName}...`, "warning");
      const approveTx = await tokenContract.approve(stakingAddress, amountWei, { gasLimit: 100000 });
      await approveTx.wait();
      addLog(`Approval Successfully`, "success");
    }

    try {
      await provider.call({
        to: stakingAddress,
        data: stakingContract.interface.encodeFunctionData("stake", [amountWei]),
        from: globalWallet.address,
      });
    } catch (error) {
      let revertReason = error.data ? ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + error.data.slice(10))[0] : "Tidak dapat menentukan alasan revert";
      throw new Error(`Simulasi transaksi gagal: ${revertReason}`);
    }

    try {
      addLog(`Mengirim transaksi stake`, "debug");
      const tx = await stakingContract.stake(amountWei, { gasLimit: 300000 });
      addLog(`Transaksi dikirim. TxHash: ${tx.hash}`, "warning");
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        const txHash = receipt.transactionHash || receipt.hash;
        addLog(`Berhasil stake ${amount} ${tokenName}. TxHash: ${txHash}`, "success");
        return txHash;
      } else {
        throw new Error(`Transaksi gagal: TxHash: ${receipt.transactionHash || receipt.hash}`);
      }
    } catch (error) {
      let revertReason = error.data ? ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + error.data.slice(10))[0] : error.message;
      throw new Error(`Gagal stake ${token}: ${revertReason}`);
    }
  } catch (error) {
    throw new Error(`Gagal stake ${token}: ${error.message}`);
  }
}

async function autoMintFunction(token, amount) {
  addLog(`Minting ${token}...`, "system");
  const result = await addTransactionToQueue(() => mintToken(token, amount), `Mint ${token} ${amount}`);
  if (result && (typeof result === "string" || (result.receipt && result.receipt.status === 1))) {
    addLog(`Minted ${token} successfully.`, "success");
    return true;
  } else {
    addLog(`Failed to mint ${token}.`, "error");
    return false;
  }
}

async function autoStakeFunction(token, amount) {
  addLog(`Staking ${token}...`, "system");
  const result = await addTransactionToQueue(() => stakeToken(token, amount), `Stake ${token} ${amount}`);
  if (result && (typeof result === "string" || (result.receipt && result.receipt.status === 1))) {
    addLog(`Staked ${token} successfully.`, "success");
    return true;
  } else {
    addLog(`Failed to stake ${token}.`, "error");
    return false;
  }
}

async function runAutoMint(token) {
  promptBox.setFront();
  const config = TOKEN_CONFIG[token];
  if (!config) {
    addLog(`Token ${token} tidak didukung untuk minting.`, "error");
    return;
  }
  const { inputTokenName, minAmount } = config;
  promptBox.readInput(`Masukkan jumlah mint ${token} (minimal ${minAmount} ${inputTokenName})`, "", async (err, value) => {
    promptBox.hide();
    safeRender();
    if (err || !value) {
      addLog(`Auto Mint ${token}: Input tidak valid atau dibatalkan.`, "system");
      return;
    }
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < minAmount) {
      addLog(`Auto Mint ${token}: Jumlah minimal harus ${minAmount} ${inputTokenName}.`, "warning");
      return;
    }
    const loopCount = 1;
    addLog(`Auto Mint: Mulai mint ${amount} ${token}.`, "system");
    actionRunning = true;
    actionCancelled = false;
    mainMenu.setItems(getMainMenuItems());
    autoMintSubMenu.setItems(getAutoMintMenuItems());
    autoMintSubMenu.show();
    safeRender();
    for (let i = 1; i <= loopCount; i++) {
      if (actionCancelled) {
        addLog(`Auto Mint: Dihentikan pada iterasi ${i}.`, "system");
        break;
      }
      const success = await autoMintFunction(token, amount);
      if (success) {
        await updateWalletData();
      }
    }
    actionRunning = false;
    mainMenu.setItems(getMainMenuItems());
    autoMintSubMenu.setItems(getAutoMintMenuItems());
    safeRender();
    addLog(`Auto Mint: Selesai untuk ${token}.`, "system");
  });
}

async function runAutoStake(token) {
  promptBox.setFront();
  const config = STAKING_CONFIG[token];
  if (!config) {
    addLog(`Token ${token} tidak didukung untuk staking.`, "error");
    return;
  }
  const { tokenName, minAmount } = config;
  promptBox.readInput(`Masukkan jumlah stake ${token} (minimal ${minAmount} ${tokenName})`, "", async (err, value) => {
    promptBox.hide();
    safeRender();
    if (err || !value) {
      addLog(`Auto Stake ${token}: Input tidak valid atau dibatalkan.`, "system");
      return;
    }
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < minAmount) {
      addLog(`Auto Stake ${token}: Jumlah harus minimal ${minAmount} ${tokenName}.`, "system");
      return;
    }
    const loopCount = 1;
    addLog(`Auto Stake: Mulai stake ${amount} ${token}.`, "system");
    actionRunning = true;
    actionCancelled = false;
    mainMenu.setItems(getMainMenuItems());
    autoStakeSubMenu.setItems(getAutoStakeMenuItems());
    autoStakeSubMenu.show();
    safeRender();
    for (let i = 1; i <= loopCount; i++) {
      if (actionCancelled) {
        addLog(`Auto Stake: Dihentikan pada iterasi ${i}.`, "system");
        break;
      }
      const success = await autoStakeFunction(token, amount);
      if (success) {
        await updateWalletData();
      }
    }
    actionRunning = false;
    mainMenu.setItems(getMainMenuItems());
    autoStakeSubMenu.setItems(getAutoStakeMenuItems());
    safeRender();
    addLog(`Auto Stake: Selesai untuk ${token}.`, "system");
  });
}

async function runAutoClaimAllFaucet() {
  addLog("Memulai Auto Claim All Faucet...", "system");
  const tokens = ["ATH", "USDe", "LULUSD", "Ai16Z", "Virtual", "Vana", "USD1", "OG"];
  actionRunning = true;
  actionCancelled = false;
  mainMenu.setItems(getMainMenuItems());
  autoClaimSubMenu.setItems(getAutoClaimMenuItems());
  autoClaimSubMenu.show();
  safeRender();

  for (const token of tokens) {
    if (actionCancelled) {
      addLog("Auto Claim All Faucet: Dihentikan.", "system");
      break;
    }
    addLog(`Mengklaim faucet untuk ${token}...`, "system");
    const result = await addTransactionToQueue(() => claimFaucet(token), `Claim ${token}`);
    if (!actionCancelled && token !== tokens[tokens.length - 1]) {
      addLog(`Claim ${token} selesai. Menunggu 5 detik sebelum claim berikutnya.`, "system");
      await waitWithCancel(5000, "action");
    }
  }

  if (!actionCancelled) {
    await updateWalletData();
  }

  actionRunning = false;
  mainMenu.setItems(getMainMenuItems());
  autoClaimSubMenu.setItems(getAutoClaimMenuItems());
  safeRender();
  addLog("Auto Claim All Faucet selesai.", "system");
}

mainMenu.on("select", (item) => {
  const selected = item.getText();
  if (selected === "Auto Mint Token") {
    autoMintSubMenu.show();
    autoMintSubMenu.focus();
    safeRender();
  } else if (selected === "Auto Claim Faucet") {
    autoClaimSubMenu.show();
    autoClaimSubMenu.focus();
    safeRender();
  } else if (selected === "Auto Stake") {
    autoStakeSubMenu.show();
    autoStakeSubMenu.focus();
    safeRender();
  } else if (selected === "Antrian Transaksi") {
    showTransactionQueueMenu();
  } else if (selected === "Stop Transaction") {
    if (actionRunning) {
      actionCancelled = true;
      addLog("Stop Transaction: Transaksi akan dihentikan.", "system");
    }
  } else if (selected === "Clear Transaction Logs") {
    clearTransactionLogs();
  } else if (selected === "Refresh") {
    updateWalletData();
    safeRender();
    addLog("Refreshed", "system");
  } else if (selected === "Exit") {
    process.exit(0);
  }
});

autoMintSubMenu.on("select", (item) => {
  const selected = item.getText();
  if (selected === "Auto Mint AUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoMint("AUSD");
    }
  } else if (selected === "Auto Mint vUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoMint("VUSD");
    }
  } else if (selected === "Auto Mint VANAUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoMint("VANAUSD");
    }
  } else if (selected === "Auto Mint azUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoMint("AZUSD");
    }
  } else if (selected === "Auto Mint 0USD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoMint("OUSD");
    }
  } else if (selected === "Stop Transaction") {
    if (actionRunning) {
      actionCancelled = true;
      addLog("Perintah Stop Transaction diterima.", "system");
    } else {
      addLog("Tidak ada transaksi yang berjalan.", "system");
    }
  } else if (selected === "Clear Transaction Logs") {
    clearTransactionLogs();
  } else if (selected === "Refresh") {
    updateWalletData();
    safeRender();
    addLog("Refreshed", "system");
  } else if (selected === "Back to Main Menu") {
    autoMintSubMenu.hide();
    mainMenu.show();
    mainMenu.focus();
    safeRender();
  }
});

autoClaimSubMenu.on("select", (item) => {
  const selected = item.getText();
  if (selected === "Auto Claim All Faucet") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoClaimAllFaucet();
    }
  } else if (selected === "Stop Transaction") {
    if (actionRunning) {
      actionCancelled = true;
      addLog("Perintah Stop Transaction diterima.", "system");
    } else {
      addLog("Tidak ada transaksi yang berjalan.", "system");
    }
  } else if (selected === "Clear Transaction Logs") {
    clearTransactionLogs();
  } else if (selected === "Refresh") {
    updateWalletData();
    safeRender();
    addLog("Refreshed", "system");
  } else if (selected === "Back to Main Menu") {
    autoClaimSubMenu.hide();
    mainMenu.show();
    mainMenu.focus();
    safeRender();
  }
});

autoStakeSubMenu.on("select", (item) => {
  const selected = item.getText();
  if (selected === "Auto Stake azUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("AZUSD");
    }
  } else if (selected === "Auto Stake AUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("AUSD");
    }
  } else if (selected === "Auto Stake VANAUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("VANAUSD");
    }
  } else if (selected === "Auto Stake vUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("VUSD");
    }
  } else if (selected === "Auto Stake USDe") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("USDE");
    }
  } else if (selected === "Auto Stake LULUSD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("LULUSD");
    }
  } else if (selected === "Auto Stake 0USD") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("OUSD");
    }
  } else if (selected === "Auto Stake USD1") {
    if (actionRunning) {
      addLog("Transaksi sedang berjalan. Hentikan transaksi terlebih dahulu.", "warning");
    } else {
      runAutoStake("USD1");
    }
  } else if (selected === "Stop Transaction") {
    if (actionRunning) {
      actionCancelled = true;
      addLog("Perintah Stop Transaction diterima.", "system");
    } else {
      addLog("Tidak ada transaksi yang berjalan.", "system");
    }
  } else if (selected === "Clear Transaction Logs") {
    clearTransactionLogs();
  } else if (selected === "Refresh") {
    updateWalletData();
    safeRender();
    addLog("Refreshed", "system");
  } else if (selected === "Back to Main Menu") {
    autoStakeSubMenu.hide();
    mainMenu.show();
    mainMenu.focus();
    safeRender();
  }
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));
screen.key(["C-up"], () => {
  logsBox.scroll(-1);
  safeRender();
});
screen.key(["C-down"], () => {
  logsBox.scroll(1);
  safeRender();
});

safeRender();
mainMenu.focus();
addLog("Dont Forget To Join Telegram @AirdropSeeker_Official!!", "system");
updateWalletData();
