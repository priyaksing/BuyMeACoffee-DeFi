'use client'
import ABI from '/context/BuyMeACoffee.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { getContractWithSigner, connectMetamask } from "./interact.js";
import Memo from './components/Memo.js';

export default function Home() {

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [owner, setOwner] = useState(false);
  const [balance, setBalance] = useState(0);


  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  const checkBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    let _balance = await provider.getBalance(ABI.contractAddress);
    _balance = ethers.formatEther(_balance);
    _balance = _balance.substring(0, 6);

    setBalance(_balance);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const account = await connectMetamask();
      if (account === -1) {
        return;
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }


  const connectWallet = async () => {
    try {

      const account = await connectMetamask();
      setCurrentAccount(account);

      // 0xC484C5Fe5923F90FBd86803ae2B771A7e733468f
      const buyMeACoffee = await getContractWithSigner(ABI.contractAddress, ABI.abi);
      let owner = await buyMeACoffee.getOwner();

      if (owner.toLowerCase() === account.toLowerCase()) {
        setOwner(true);
        checkBalance();
      }

    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const buyMeACoffee = await getContractWithSigner(ABI.contractAddress, ABI.abi);
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.parseEther("0.001") }
        );

        await coffeeTxn.wait();
        alert("Succesfully bought coffee!");

        // Clear the form fields.
        setName("");
        setMessage("");
        checkBalance();
      }
    } catch (error) {
      console.log(error);
    }
  };


  //Function to withdra tips
  const withdrawCoffee = async () => {
    try {
      const buyMeACoffee = await getContractWithSigner(ABI.contractAddress, ABI.abi);
      const withdrawTxn = await buyMeACoffee.withdrawCoffee();
      await withdrawTxn.wait();

      alert("Successfully withdrawn tips!");
      checkBalance();

    } catch (error) {
      console.log(error);
    }
  }

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {

      const buyMeACoffee = await getContractWithSigner(ABI.contractAddress, ABI.abi);
      const memos = await buyMeACoffee.getMemos();

      setMemos(memos);

    } catch (error) {
      console.log(error);
    }
  };

  // Create an event handler function for when someone sends us a new memo.
  const onNewMemo = (from, timestamp, name, message) => {
    console.log(from, timestamp, name, message);

    setMemos((prevState) => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(Number(timestamp) * 1000),
        message,
        name
      }
    ]);
  };

  const callNewMemo = async () => {

    const buyMeACoffee = await getContractWithSigner(ABI.contractAddress, ABI.abi);

    if (buyMeACoffee) {
      buyMeACoffee.on("newMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("newMemo", onNewMemo);
      }
    }
  }

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();
    callNewMemo();

    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.replace(location.pathname)
    })

  }, [currentAccount, balance, owner]);

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3 bg-gradient-to-r from-red-200 to-blue-500 min-h-screen">
      <main className="flex flex-col w-full justify-center items-center gap-y-2 pb-5">
        <h1 className="flex justify-center items-center w-2/5 text-2xl tracking-widest font-semibold m-5 text-white">
          BUY PRIYA A COFFEE!
        </h1>

        {currentAccount ? (
          <div>
            <form className='bg-white px-8 pb-8 pt-4 rounded shadow-md'>
              <div className='mb-4'>
                <label className='block text-base font-bold text-blue-500 mb-2'>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  className='bg-slate-100 py-2 px-2 w-full shadow appearance-none rounded text-gray-700 focus:outline-blue-300'
                  onChange={onNameChange}
                />
              </div>

              <div className='mb-2'>
                <label className='block text-base font-bold text-blue-500 mb-2'>
                  Send Priya a message
                </label>
                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                  className=' bg-slate-100 py-2 px-2 w-full shadow appearance-none rounded text-gray-700 focus:outline-blue-300'
                >
                </textarea>
              </div>
              <div className='flex flex-col'>
                <button
                  type="button"
                  onClick={buyCoffee}
                  className='text-white bg-blue-400 hover:bg-blue-600 px-4 py-2 mt-3 rounded'
                >
                  Send 1 Coffee for 0.001ETH
                </button>

                {owner ? (
                  <div className='flex flex-col'>
                    <button
                      type="button"
                      onClick={withdrawCoffee}
                      className='text-white bg-blue-400 hover:bg-blue-600 px-4 py-2 mt-3 rounded'
                    >
                      Withdraw Tips
                    </button>
                    <h6 className='flex justify-center items-center font-bold text-sm text-purple-500 mt-3'>
                      Tips received: {balance} ETH
                    </h6>
                  </div>
                ) : ("")}


              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className='text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 mt-3 rounded w-1/5'
          >
            Connect your wallet
          </button>
        )}
      </main>

      <Memo
        currentAccount={currentAccount}
        memos={memos}
      />

    </div>
  )
}
