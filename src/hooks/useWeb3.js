import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, TOKEN_ABI, ESCROW_ABI } from '../config';

export function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      // Escuchar cambios de cuenta
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Escuchar cambios de red
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }

      // Solicitar cuentas
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Obtener chain ID
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      // Verificar que estamos en Base Sepolia
      if (network.chainId !== CONTRACTS.CHAIN_ID) {
        await switchNetwork();
        return;
      }

      // Configurar signer
      const web3Signer = provider.getSigner();
      setSigner(web3Signer);
      setAccount(accounts[0]);

      // Inicializar contratos
      const token = new ethers.Contract(CONTRACTS.TOKEN, TOKEN_ABI, web3Signer);
      const escrow = new ethers.Contract(CONTRACTS.ESCROW, ESCROW_ABI, web3Signer);
      
      setTokenContract(token);
      setEscrowContract(escrow);

      return { success: true, account: accounts[0] };
    } catch (error) {
      console.error('Error conectando wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACTS.CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      // Si la red no está agregada, agregarla
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CONTRACTS.CHAIN_ID_HEX,
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [CONTRACTS.RPC_URL],
              blockExplorerUrls: [CONTRACTS.EXPLORER_URL]
            }],
          });
        } catch (addError) {
          throw new Error('Error agregando Base Sepolia a MetaMask');
        }
      } else {
        throw switchError;
      }
    }
  };

  return {
    provider,
    signer,
    account,
    chainId,
    tokenContract,
    escrowContract,
    connectWallet,
    switchNetwork
  };
}