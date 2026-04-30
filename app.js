// ===== AUTO UI CREATION =====
document.body.style = `
  font-family: Arial;
  background:#0b0f19;
  color:white;
  text-align:center;
  padding:20px;
`;

document.body.innerHTML = `
<h2>🚀 Base Wallet App</h2>

<div class="card">
  <button id="connectBtn">Connect Wallet</button>
  <p id="address">Not connected</p>
</div>

<div class="card">
  <h3>Balance</h3>
  <p id="balance">0 ETH</p>
</div>

<div class="card">
  <h3>Send Transaction</h3>
  <input id="to" placeholder="Recipient Address"/><br/>
  <input id="amount" placeholder="Amount in ETH"/><br/>
  <button id="sendBtn">Send</button>
</div>

<div class="card">
  <h3>Transaction History</h3>
  <div id="history"></div>
</div>
`;

// ===== STYLE =====
const style = document.createElement("style");
style.innerHTML = `
.card {
  background:#151a2e;
  padding:15px;
  margin:15px auto;
  border-radius:10px;
  max-width:400px;
}
input, button {
  padding:10px;
  margin:5px;
  width:90%;
  border-radius:8px;
  border:none;
}
button {
  background:#4a7cff;
  color:white;
  cursor:pointer;
}
button:hover {
  background:#6a92ff;
}
a { color:#8ab4ff; }
`;
document.head.appendChild(style);

// ===== BASE CONFIG =====
const BASE_MAINNET = {
  chainId: "0x2105",
  chainName: "Base Mainnet",
  rpcUrls: ["https://mainnet.base.org"],
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
};

// ===== STATE =====
let provider, signer, userAddress;

// ===== INIT =====
async function init() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  renderHistory();
}

// ===== CONNECT =====
async function connectWallet() {
  try {
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("address").innerText = userAddress;

    await switchToBase();
    await getBalance();
  } catch (err) {
    console.error(err);
    alert("Connection failed");
  }
}

// ===== SWITCH NETWORK =====
async function switchToBase() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_MAINNET.chainId }]
    });
  } catch (err) {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [BASE_MAINNET]
    });
  }
}

// ===== BALANCE =====
async function getBalance() {
  try {
    const balance = await provider.getBalance(userAddress);
    const eth = ethers.formatEther(balance);
    document.getElementById("balance").innerText = eth + " ETH";
  } catch (err) {
    console.error(err);
  }
}

// ===== SEND TX =====
async function sendTx() {
  try {
    const to = document.getElementById("to").value;
    const amount = document.getElementById("amount").value;

    if (!to || !amount) return alert("Fill all fields");

    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });

    saveTx(tx.hash);
    renderHistory();

    alert("Tx sent: " + tx.hash);
  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  }
}

// ===== STORAGE =====
function saveTx(hash) {
  let txs = JSON.parse(localStorage.getItem("txs") || "[]");
  txs.unshift(hash);
  localStorage.setItem("txs", JSON.stringify(txs));
}

// ===== HISTORY =====
function renderHistory() {
  const txs = JSON.parse(localStorage.getItem("txs") || "[]");
  const container = document.getElementById("history");

  container.innerHTML = txs
    .map(
      (tx) =>
        `<div>🔗 <a href="https://basescan.org/tx/${tx}" target="_blank">
        ${tx.slice(0, 12)}...</a></div>`
    )
    .join("");
}

// ===== EVENTS =====
document.addEventListener("DOMContentLoaded", () => {
  init();

  document
    .getElementById("connectBtn")
    .addEventListener("click", connectWallet);

  document
    .getElementById("sendBtn")
    .addEventListener("click", sendTx);
});
