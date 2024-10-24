import React from 'react';
import { ethers } from "ethers";

export const getContractWithSigner = async (contractAddress, contractABI) => {

    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    let contract = new ethers.Contract(contractAddress, contractABI, signer);

    return contract;
}

export const connectMetamask = async () => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Please install MetaMask");
            alert("Please install Metamask!");
            return -1;
        }

        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
            const account = accounts[0];
            return accounts[0];
        }
        else {
            console.log("Make sure Metamask is connected.");
            return -1;
        }

    } catch (error) {
        console.log(error);
    }
}
