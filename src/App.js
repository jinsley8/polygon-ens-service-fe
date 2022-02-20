import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'joninsley';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');

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
			const account = accounts[1];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}
	}

	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<button className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
  );

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
					</header>
				</div>

        {renderNotConnectedContainer()}

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
