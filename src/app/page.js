'use client'
import abi from '/context/BuyMeACoffee.json';
import { ethers } from "ethers";
// import Head from 'next/head'
// import Image from 'next/image'
import React, { useEffect, useState } from "react";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x4cb854E239094Dfd599959B40fF4377512d06D90";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum, "any");
        const signer = await provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };


  //Function to withdra tips
  const withdrawCoffee = async () => {
    try {

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum, "any");
        const signer = await provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const withdrawTxn = await buyMeACoffee.withdrawCoffee();
        await withdrawTxn.wait();

        console.log("Mined", withdrawTxn.hash);
        console.log("Tips withdrawn by Owner");
      }
    } catch (error) {
      console.log(error);
    }
  }



  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const callNewMemo = async () => {
      const { ethereum } = window;

      // Listen for new memo events.
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum, "any");
        const signer = await provider.getSigner();
        buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        if (buyMeACoffee) {
          buyMeACoffee.on("newMemo", onNewMemo);
        }
      }

      return () => {
        if (buyMeACoffee) {
          buyMeACoffee.off("newMemo", onNewMemo);
        }
      }
    }

    callNewMemo();

  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <main className="flex flex-col w-full justify-center items-center gap-y-2 pb-5">
        <h1 className="flex justify-center items-center w-2/5 text-2xl tracking-widest font-semibold m-5">
          BUY PRIYA A COFFEE!
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label className='text-white'>
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  className='bg-slate-100 py-2 px-2 w-full rounded-lg text-gray-800 focus:outline-blue-300'
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label className='text-white'>
                  Send Priya a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                  className=' bg-slate-100 py-2 px-2 w-full rounded-lg text-gray-800 focus:outline-blue-300'
                >
                </textarea>
              </div>
              <div className='flex flex-col'>
                <button
                  type="button"
                  onClick={buyCoffee}
                  className='text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm'
                >
                  Send 1 Coffee for 0.001ETH
                </button>

                <button
                  type="button"
                  onClick={withdrawCoffee}
                  className='text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm'
                >
                  Withdraw Tips
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className='text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5'
          >
            Connect your wallet
          </button>
        )}
      </main>

      {currentAccount && (
        <h1 className='flex items-center justify-center text-lg tracking-wide font-semibold pt-4 m-5 w-3/5 border-t-2'>
          MEMOS RECEIVED
        </h1>
      )}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} className='flex flex-col w-3/5 justify-center items-center gap-y-2 py-2 px-2 bg-slate-600 border-white border-solid border-2'>
            <p>"{memo.message}"</p>
            <p><span className='font-semibold'>From:</span> {memo.name} at <span className='italic text-gray-400'>{Date(memo.timestamp).toLocaleString()}</span></p>
          </div>
        )
      }))}

    </div>
  )
}
