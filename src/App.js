import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import abi from "./constants/abi.json";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import ClipLoader from "react-spinners/ClipLoader";

// Constants
const TWITTER_HANDLE = "RoneeYu";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/randomnft-i01p74j2zd";

const App = () => {
  // Render Methods
  const [currentAccount, setCurrentAccount] = useState("");
  const [minted, setMinted] = useState(0);
  const { enableWeb3 } = useMoralis();
  const contractAddress = "0xf103736b30708591b25C6e04F7212bADE1632904";
  const goerliChainId = "0x5";

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    let chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
      await enableWeb3();
      setMinted((await checkMinted()).toString());
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      let chainId = await ethereum.request({ method: "eth_chainId" });
      if (chainId !== goerliChainId) {
        alert("You are not connected to the Goerli Test Network!");
      }

      console.log("connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
      await enableWeb3();
      setMinted((await checkMinted()).toString());
    } catch (error) {
      console.error(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintButton = () => (
    <button
      onClick={async () => {
        await enableWeb3();
        await mintNow({
          onSuccess: console.log("success"),
          onError: (error) => console.log(error),
        });
      }}
      className="cta-button connect-wallet-button"
      disabled={isLoading || isFetching}
    >
      {isLoading || isFetching ? (
        <ClipLoader
          color={"#ffffff"}
          loading={true}
          size={20}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        "Mint"
      )}
    </button>
  );

  const {
    runContractFunction: mintNow,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "makeAnEpicNFT",
    params: {},
    msgValue: ethers.utils.parseEther("0.001"),
  });

  const { runContractFunction: checkMinted } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "getTotalNFTsMintedSoFar",
    params: {},
  });

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">Minted so far {minted} / 50</p>
          {currentAccount === "" ? renderNotConnectedContainer() : mintButton()}
        </div>
        <div className="footer-container">
          <div className="flex1">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
          <div className="flex1">
            🌊
            <a
              className="footer-text"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >{` View Collection on OpenSea`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
