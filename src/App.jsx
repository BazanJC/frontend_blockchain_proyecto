import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Package, Truck, MapPin, User, Wallet, Clock, XCircle, ExternalLink } from 'lucide-react';

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONTRACTS = {
  TOKEN: '0x7Cfa80f3aAa0FB7880A951eF5B39B930A8DA7e51',
  ESCROW: '0x1431d20901AecF05A8192498E0A7D635F4ca76ea',
  CHAIN_ID: 84532,
  CHAIN_ID_HEX: '0x14A34',
  RPC_URL: 'https://sepolia.base.org',
  EXPLORER_URL: 'https://sepolia.basescan.org'
};

// ==========================================
// UTILIDADES
// ==========================================
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat('es-BO').format(parseFloat(amount));
};

const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// ==========================================
// ESTADOS DE ORDEN
// ==========================================
const ORDER_STATES = {
  0: { label: 'Pendiente', color: 'yellow', icon: Clock },
  1: { label: 'Entregado', color: 'green', icon: CheckCircle },
  2: { label: 'Cancelado', color: 'red', icon: XCircle }
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function EscrowDApp() {
  // Estados principales
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState('purchaser');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('TOKEN');
  const [notification, setNotification] = useState(null);
  
  // Estado para las órdenes
  const [orders, setOrders] = useState([]);
  
  // Estado de formulario
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    validator: '',
    amount: '',
    productName: '',
    originCity: '',
    destinationCity: ''
  });

  // ==========================================
  // EFECTOS
  // ==========================================
  
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // ==========================================
  // FUNCIONES DE CONEXIÓN
  // ==========================================
  
  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleConnection(accounts[0]);
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setConnected(false);
      setAccount(null);
    } else {
      handleConnection(accounts[0]);
    }
  };

  const handleConnection = async (address) => {
    setAccount(address);
    setConnected(true);
    await loadUserData(address);
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        showNotification('Por favor instala MetaMask para continuar', 'error');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      if (parseInt(chainId, 16) !== CONTRACTS.CHAIN_ID) {
        showNotification('Cambiando a Base Sepolia...', 'info');
        await switchToBaseSepolia();
        return;
      }

      await handleConnection(accounts[0]);
      showNotification('Wallet conectada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error conectando wallet:', error);
      if (error.code === 4001) {
        showNotification('Conexión rechazada por el usuario', 'error');
      } else {
        showNotification('Error al conectar wallet', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACTS.CHAIN_ID_HEX }],
      });
      showNotification('Red cambiada exitosamente', 'success');
      window.location.reload();
    } catch (switchError) {
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
          showNotification('Red agregada exitosamente', 'success');
          window.location.reload();
        } catch (addError) {
          console.error('Error agregando red:', addError);
          showNotification('Error al agregar la red Base Sepolia', 'error');
        }
      } else {
        console.error('Error cambiando red:', switchError);
        showNotification('Error al cambiar de red', 'error');
      }
    }
  };

  // ==========================================
  // FUNCIONES DE DATOS
  // ==========================================
  
  const loadUserData = async (address) => {
    try {
      setTokenBalance('1000');
      setTokenSymbol('TUSDC');
      
      const mockOrders = loadOrdersFromStorage(address);
      setOrders(mockOrders);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const loadOrdersFromStorage = (address) => {
    try {
      const stored = localStorage.getItem(`escrow_orders_${address.toLowerCase()}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveOrdersToStorage = (address, orders) => {
    try {
      localStorage.setItem(`escrow_orders_${address.toLowerCase()}`, JSON.stringify(orders));
    } catch (error) {
      console.error('Error guardando órdenes:', error);
    }
  };

  // ==========================================
  // FUNCIONES DE CONTRATO (Simuladas)
  // ==========================================
  
  const createOrder = async () => {
    if (!validateOrderForm()) return;
    
    setLoading(true);
    try {
      showNotification('Preparando transacción...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Aprobando tokens...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification('Creando orden en el contrato...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newOrderData = {
        id: Date.now(),
        orderId: orders.length + 1,
        purchaser: account,
        supplier: newOrder.supplier,
        validator: newOrder.validator,
        amount: newOrder.amount,
        state: 0,
        productName: newOrder.productName,
        originCity: newOrder.originCity,
        destinationCity: newOrder.destinationCity,
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      const updatedOrders = [...orders, newOrderData];
      setOrders(updatedOrders);
      saveOrdersToStorage(account, updatedOrders);
      
      showNotification('¡Orden creada exitosamente!', 'success');
      
      setNewOrder({
        supplier: '',
        validator: '',
        amount: '',
        productName: '',
        originCity: '',
        destinationCity: ''
      });
      
    } catch (error) {
      console.error('Error creando orden:', error);
      showNotification('Error al crear la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async (orderId) => {
    setLoading(true);
    try {
      showNotification('Confirmando entrega en el contrato...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, state: 1, progress: 100 } : order
      );
      setOrders(updatedOrders);
      saveOrdersToStorage(account, updatedOrders);
      
      showNotification('¡Entrega confirmada exitosamente!', 'success');
    } catch (error) {
      console.error('Error confirmando entrega:', error);
      showNotification('Error al confirmar la entrega', 'error');
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (orderId) => {
    setLoading(true);
    try {
      showNotification('Retirando fondos del contrato...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification('¡Fondos retirados exitosamente!', 'success');
    } catch (error) {
      console.error('Error retirando fondos:', error);
      showNotification('Error al retirar los fondos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setLoading(true);
    try {
      showNotification('Cancelando orden en el contrato...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, state: 2 } : order
      );
      setOrders(updatedOrders);
      saveOrdersToStorage(account, updatedOrders);
      
      showNotification('¡Orden cancelada exitosamente!', 'success');
    } catch (error) {
      console.error('Error cancelando orden:', error);
      showNotification('Error al cancelar la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VALIDACIONES
  // ==========================================
  
  const validateOrderForm = () => {
    if (!newOrder.supplier || !isValidAddress(newOrder.supplier)) {
      showNotification('Dirección del proveedor inválida', 'error');
      return false;
    }
    if (!newOrder.validator || !isValidAddress(newOrder.validator)) {
      showNotification('Dirección del validador inválida', 'error');
      return false;
    }
    if (!newOrder.amount || parseFloat(newOrder.amount) <= 0) {
      showNotification('El monto debe ser mayor a 0', 'error');
      return false;
    }
    if (newOrder.supplier.toLowerCase() === account.toLowerCase()) {
      showNotification('El proveedor no puede ser el comprador', 'error');
      return false;
    }
    if (newOrder.validator.toLowerCase() === account.toLowerCase()) {
      showNotification('El validador no puede ser el comprador', 'error');
      return false;
    }
    return true;
  };

  // ==========================================
  // UTILIDADES DE UI
  // ==========================================
  
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getFilteredOrders = () => {
    if (!account) return [];
    
    return orders.filter(order => {
      const addr = account.toLowerCase();
      if (currentRole === 'purchaser') return order.purchaser.toLowerCase() === addr;
      if (currentRole === 'supplier') return order.supplier.toLowerCase() === addr;
      if (currentRole === 'validator') return order.validator.toLowerCase() === addr;
      return false;
    });
  };

  const getRoleName = (role) => {
    const names = {
      purchaser: 'Comprador',
      supplier: 'Proveedor',
      validator: 'Validador'
    };
    return names[role] || role;
  };

  const getActionButtons = (order) => {
    const actions = [];
    
    if (currentRole === 'purchaser' && order.state === 0) {
      actions.push(
        <button
          key="confirm"
          onClick={() => confirmDelivery(order.id)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Confirmar Entrega
        </button>
      );
    }
    
    if (currentRole === 'supplier' && order.state === 1) {
      actions.push(
        <button
          key="withdraw"
          onClick={() => withdrawFunds(order.id)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          Retirar Fondos
        </button>
      );
    }
    
    if ((currentRole === 'purchaser' || currentRole === 'supplier') && order.state === 0) {
      actions.push(
        <button
          key="cancel"
          onClick={() => cancelOrder(order.id)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Cancelar Orden
        </button>
      );
    }
    
    return actions;
  };

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}>
          {notification.type === 'success' && <CheckCircle size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          <span className="flex-1">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Escrow Automático</h1>
                <p className="text-sm text-gray-600">Sistema Descentralizado de Pagos Seguros</p>
              </div>
            </div>
            
            {connected ? (
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
                  <p className="text-lg font-bold text-indigo-600">{formatAmount(tokenBalance)} {tokenSymbol}</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                  <Wallet size={20} />
                  <span className="font-mono font-semibold">{formatAddress(account)}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg font-semibold"
              >
                <Wallet size={20} />
                {loading ? 'Conectando...' : 'Conectar Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!connected ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Package size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Bienvenido al Escrow Automático</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Conecta tu wallet de MetaMask para gestionar transacciones de forma segura y descentralizada
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Pagos Seguros</p>
                    <p className="text-sm text-gray-600">Los fondos se mantienen en escrow hasta la confirmación</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Sin Intermediarios</p>
                    <p className="text-sm text-gray-600">Smart contracts automatizados en Base Sepolia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Transparencia Total</p>
                    <p className="text-sm text-gray-600">Todas las transacciones son verificables en blockchain</p>
                  </div>
                </div>
              </div>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 inline-flex items-center gap-3 text-lg font-semibold shadow-xl transition-all"
              >
                <Wallet size={24} />
                Conectar MetaMask
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selector de Rol */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Selecciona tu Rol</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['purchaser', 'supplier', 'validator'].map(role => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      currentRole === role
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <User className={`mx-auto mb-2 ${currentRole === role ? 'text-indigo-600' : 'text-gray-400'}`} size={28} />
                    <p className={`font-semibold ${currentRole === role ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {getRoleName(role)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de Nueva Orden */}
            {currentRole === 'purchaser' && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                  <Package size={24} className="text-indigo-600" />
                  Crear Nueva Orden de Escrow
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      value={newOrder.productName}
                      onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Ej: Laptop Dell XPS 15"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monto (Tokens) *
                    </label>
                    <input
                      type="number"
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="1000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección del Proveedor *
                    </label>
                    <input
                      type="text"
                      value={newOrder.supplier}
                      onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección del Validador *
                    </label>
                    <input
                      type="text"
                      value={newOrder.validator}
                      onChange={(e) => setNewOrder({...newOrder, validator: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad de Origen
                    </label>
                    <input
                      type="text"
                      value={newOrder.originCity}
                      onChange={(e) => setNewOrder({...newOrder, originCity: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Santa Cruz, Bolivia"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad de Destino
                    </label>
                    <input
                      type="text"
                      value={newOrder.destinationCity}
                      onChange={(e) => setNewOrder({...newOrder, destinationCity: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="La Paz, Bolivia"
                    />
                  </div>
                </div>
                
                <button
                  onClick={createOrder}
                  disabled={loading}
                  className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
                >
                  {loading ? 'Procesando...' : '✨ Crear Orden de Escrow'}
                </button>
              </div>
            )}

            {/* Lista de Órdenes */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
                <Truck size={24} className="text-indigo-600" />
                Mis Órdenes como {getRoleName(currentRole)}
              </h3>
              
              {getFilteredOrders().length === 0 ? (
                <div className="text-center py-16">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">No tienes órdenes en este rol</p>
                  <p className="text-gray-400 text-sm mt-2">Las órdenes aparecerán aquí cuando se creen</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {getFilteredOrders().map(order => {
                    const StateIcon = ORDER_STATES[order.state].icon;
                    const stateColor = ORDER_STATES[order.state].color;
                    
                    return (
                      <div key={order.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-gray-800">Orden #{order.orderId}</h4>
                              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                stateColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                                stateColor === 'green' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                                'bg-red-100 text-red-800 border-2 border-red-300'
                              }`}>
                                <StateIcon size={16} />
                                {ORDER_STATES[order.state].label}
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium text-lg">{order.productName || 'Sin especificar'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatAmount(order.amount)}
                            </p>
                            <p className="text-gray-600 font-medium">{tokenSymbol}</p>
                          </div>
                        </div>
                        
                        {/* Información de ubicación */}
                        {(order.originCity || order.destinationCity) && (
                          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 mb-5 border border-indigo-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="bg-green-500 p-2 rounded-full">
                                  <MapPin size={16} className="text-white" />
                                </div>
                                <span className="font-semibold text-gray-800">{order.originCity || 'Origen'}</span>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-indigo-500 transition-all duration-500"
                                    style={{ width: `${order.progress || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-indigo-500 p-2 rounded-full">
                                  <MapPin size={16} className="text-white" />
                                </div>
                                <span className="font-semibold text-gray-800">{order.destinationCity || 'Destino'}</span>
                              </div>
                            </div>
                            <p className="text-center text-sm text-gray-600">
                              Progreso del envío: {order.progress || 0}%
                            </p>
                          </div>
                        )}
                        
                        {/* Información de direcciones */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Comprador</p>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded-lg">
                              {formatAddress(order.purchaser)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Proveedor</p>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded-lg">
                              {formatAddress(order.supplier)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Validador</p>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded-lg">
                              {formatAddress(order.validator)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex flex-wrap gap-3 justify-end">
                          {getActionButtons(order)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Package size={20} className="text-indigo-600" />
              <span className="text-gray-700 font-semibold">Escrow Automático</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Red: Base Sepolia</span>
              <span>•</span>
              <span>Contrato: {formatAddress(CONTRACTS.ESCROW)}</span>
              <span>•</span>
              <span>Token: {formatAddress(CONTRACTS.TOKEN)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}