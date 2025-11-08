import { ethers } from 'ethers';

export async function getTokenBalance(tokenContract, address) {
  try {
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    return '0';
  }
}

export async function getTokenSymbol(tokenContract) {
  try {
    return await tokenContract.symbol();
  } catch (error) {
    console.error('Error obteniendo símbolo:', error);
    return 'TOKEN';
  }
}

export async function approveTokens(tokenContract, spender, amount) {
  try {
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    const tx = await tokenContract.approve(spender, amountInWei);
    await tx.wait();
    
    return { success: true, tx };
  } catch (error) {
    console.error('Error aprobando tokens:', error);
    return { success: false, error: error.message };
  }
}

export async function createOrder(escrowContract, supplier, validator, amount, tokenContract) {
  try {
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    const tx = await escrowContract.createOrder(supplier, validator, amountInWei);
    const receipt = await tx.wait();
    
    // Extraer el orderId del evento
    const event = receipt.events?.find(e => e.event === 'OrderCreated');
    const orderId = event?.args?.orderId?.toNumber();
    
    return { success: true, orderId, tx };
  } catch (error) {
    console.error('Error creando orden:', error);
    return { success: false, error: error.message };
  }
}

export async function confirmDelivery(escrowContract, orderId) {
  try {
    const tx = await escrowContract.confirmDelivery(orderId);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error('Error confirmando entrega:', error);
    return { success: false, error: error.message };
  }
}

export async function withdrawFunds(escrowContract, orderId) {
  try {
    const tx = await escrowContract.withdrawFunds(orderId);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error('Error retirando fondos:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelOrder(escrowContract, orderId) {
  try {
    const tx = await escrowContract.cancelOrder(orderId);
    await tx.wait();
    return { success: true, tx };
  } catch (error) {
    console.error('Error cancelando orden:', error);
    return { success: false, error: error.message };
  }
}

export async function getOrder(escrowContract, orderId) {
  try {
    const order = await escrowContract.getOrder(orderId);
    return {
      purchaser: order.purchaser,
      supplier: order.supplier,
      validator: order.validator,
      amount: order.amount,
      state: order.state
    };
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    return null;
  }
}

export async function getNextOrderId(escrowContract) {
  try {
    const nextId = await escrowContract.nextOrderId();
    return nextId.toNumber();
  } catch (error) {
    console.error('Error obteniendo nextOrderId:', error);
    return 1;
  }
}