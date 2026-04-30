"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("Not connected");
  const [balance, setBalance] = useState("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);

  // ===== BASE CONFIG =====
  const BASE_MAINNET = {
    chainId: "0x2105",
    chainName: "Base Mainnet",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
  };

  // ===== INIT =====
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
    }
    loadHistory();
  }, []);

  // ===== CONNECT =====
  const connectWallet = async () => {
    if (!provider) return alert("Install MetaMask");

    await provider.send("eth_requestAccounts", []);
    const s = await provider.getSigner();
    const addr = await s.getAddress();

    setSigner(s);
    setAddress(addr);

    await switchToBase();
    getBalance(s, addr);
  };

  // ===== SWITCH NETWORK =====
  const switchToBase = async () => {
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
  };

  // ===== BALANCE =====
  const getBalance = async (s, addr) => {
    const bal = await provider.getBalance(addr);
    setBalance(ethers.formatEther(bal));
  };

  // ===== SEND TX =====
  const sendTx = async () => {
    if (!to || !amount) return alert("Fill all fields");

    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });

    saveTx(tx.hash);
    loadHistory();

    alert("Tx sent: " + tx.hash);
  };

  // ===== STORAGE =====
  const saveTx = (hash) => {
    let txs = JSON.parse(localStorage.getItem("txs") || "[]");
    txs.unshift(hash);
    localStorage.setItem("txs", JSON.stringify(txs));
  };

  const loadHistory = () => {
    let txs = JSON.parse(localStorage.getItem("txs") || "[]");
    setHistory(txs);
  };

  return (
    <div style={styles.container}>
      <h2>🚀 Base Wallet (Next.js)</h2>

      <div style={styles.card}>
        <button onClick={connectWallet}>Connect Wallet</button>
        <p>{address}</p>
      </div>

      <div style={styles.card}>
        <h3>Balance</h3>
        <p>{balance} ETH</p>
      </div>

      <div style={styles.card}>
        <h3>Send Transaction</h3>
        <input
          placeholder="Recipient"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendTx}>Send</button>
      </div>

      <div style={styles.card}>
        <h3>History</h3>
        {history.map((tx, i) => (
          <div key={i}>
            🔗{" "}
            <a
              href={`https://basescan.org/tx/${tx}`}
              target="_blank"
              rel="noreferrer"
            >
              {tx.slice(0, 12)}...
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  container: {
    fontFamily: "Arial",
    background: "#0b0f19",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
    textAlign: "center"
  },
  card: {
    background: "#151a2e",
    padding: "15px",
    margin: "15px auto",
    borderRadius: "10px",
    maxWidth: "400px"
  }
};
