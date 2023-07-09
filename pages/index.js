import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [walletBalance, setWalletBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const atmBalance = (await atm.getBalance()).toNumber();
      setBalance(atmBalance);

      if (account) {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const wallet = provider.getSigner(account);
        const walletBalance = ethers.utils.formatEther(await wallet.getBalance());
        setWalletBalance(walletBalance);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      if (depositAmount <= 0) {
        // Display an error message or perform any desired error handling
        return <p>Please enter a valid deposit amount.</p>;
      }
  
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };
  
  const withdraw = async () => {
    if (atm) {
      if (withdrawAmount <= 0) {
        // Display an error message or perform any desired error handling
        return <p>Please enter a valid withdraw amount.</p>;
      }
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
    }
  };  
  const divideValue = async () => {
    if (atm) {
      try {
        const tx = await atm.divideBalance(2); 
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error(error);
      }
    }
  };
  const multiplyValue = async () => {
    if (atm) {
      try {
        const tx = await atm.multiplyBalance(2); 
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error(error);
      }
    }
  };
  


  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
      <p>Your Account: {account}</p>
      <p>ATM Balance: {balance} ETH</p>
      {walletBalance && <p>Wallet Balance: {walletBalance} ETH</p>}
      <div>
        <button onClick={deposit}>Deposit</button>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
      </div>
      <div>
        <button onClick={withdraw}>Withdraw</button>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
      </div>

      <button onClick={divideValue}>Divide ETH Value by 2</button>
      &nbsp; &nbsp;
      <button onClick={multiplyValue}>Multiply ETH Value by 2</button>
     </div>

    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          font-size: 25px;
        }
        .button {
          padding: 10px 20px;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
        }
      `}
      </style>
    </main>
  )
}