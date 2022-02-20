import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from './utils/contractABI.json';
import { networks } from './utils/networks';

import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';

// Constants
const TWITTER_HANDLE = 'joninsley';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// Add the domain you will be minting
const tld = '.pshhh';
const CONTRACT_ADDRESS = '0xfe60ac78eA40d5430c11A47078AB195FA8738FFd';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [network, setNetwork] = useState('');

  const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Download MetaMask -> https://metamask.io/");
				return;
			}

			// Request access to account.
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			// print out public address once Metamask is authorized.
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	const checkIfWalletIsConnected = async () => {
		// First make sure we have access to window.ethereum
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you connect to MetaMask!");
			return;
		} else {
			console.log("Ethereum object is good!", ethereum);
		}

    // Check if we're authorized to access the user's wallet
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Users can have multiple authorized accounts, grab the 2nd account at index 1
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}

    // check user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);

		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	}

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) { return }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }
    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...");

        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
  
        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();
  
          console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          setRecord('');
          setDomain('');
        }
        else {
          alert("Transaction failed! Please try again");
        }
      }
    }
    catch(error){
      console.log(error);
    }
  }

  // Switch netowrks if not Polygon
  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }],
        });
      } catch (error) {
        // The chain we want has not been added to MetaMask
        // Ssk the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {	
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                      name: "Mumbai Matic",
                      symbol: "MATIC",
                      decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
  );

  // Form to enter domain name and data
	const renderInputForm = () =>{

    // If not on Polygon Mumbai Testnet, render the switch button
  	if (network !== 'Polygon Mumbai Testnet') {
  		return (
  			<div className="connect-wallet-container">
  				<h2>Please switch to Polygon Mumbai Testnet</h2>
  				{/* Call switch network function */}
  				<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
  			</div>
  		);
  	}

		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder="What's on your mind?"
					onChange={e => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className='cta-button mint-button' onClick={mintDomain}>
						Mint
					</button>
				</div>

			</div>
		);
	}

	// This runs our function when the page loads.
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

  return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
            <div className="left">
              <p className="title">🤫 PSHHH Name Service</p>
              <p className="subtitle">Your own PSHHH domain on the blockchain!</p>
            </div>
            {/* Display a logo and wallet connection status*/}
        		<div className="right">
        			<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
        			{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
        		</div>
					</header>
				</div>

        {/* Hide the connect button if currentAccount isn't empty*/}
				{!currentAccount && renderNotConnectedContainer()}
        {/* Render the input form if an account is connected */}
				{currentAccount && renderInputForm()}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
