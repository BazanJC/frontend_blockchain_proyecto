# 🎨 Escrow Automático - Frontend

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-5.7.2-2535A0)](https://docs.ethers.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Interfaz de usuario descentralizada (dApp) para el Sistema de Escrow Automático en Base Sepolia. Permite gestionar transacciones seguras entre comprador, proveedor y validador sin intermediarios.

## 🔗 Links del Proyecto

- **Frontend (Este Repo)**: https://github.com/BazanJC/frontend_blockchain_proyecto
- **Smart Contracts**: https://github.com/BazanJC/contrato_proyecto_blockchain
- **Demo en Vivo**: frontend-blockchain-proyecto-dtdddc7kq-jcbazans-projects.vercel.app

## 📖 ¿Qué es este Frontend?

Esta es la interfaz web que permite a los usuarios interactuar con los smart contracts de escrow desplegados en Base Sepolia. Proporciona una experiencia intuitiva para:

- 💰 **Comprador**: Crear órdenes y depositar fondos
- 📦 **Proveedor**: Enviar productos y retirar pagos
- ✅ **Validador**: Confirmar entregas

## ✨ Características

### 🔐 Conexión Web3
- Integración completa con MetaMask
- Detección automática de red
- Cambio automático a Base Sepolia
- Manejo de múltiples cuentas

### 🎭 Sistema de Roles
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Comprador  │    │  Proveedor  │    │  Validador  │
│             │    │             │    │             │
│ Crea orden  │───▶│ Envía prod. │───▶│ Confirma    │
│ Deposita $$ │    │ Retira $$   │    │ entrega     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 📊 Gestión de Órdenes
- Creación de órdenes con formulario validado
- Vista de órdenes filtradas por rol
- Estados visuales (Pendiente, Entregado, Cancelado)
- Barra de progreso de envío
- Tracking de ubicaciones (origen/destino)

### 🎨 UI/UX Moderna
- Diseño responsive (móvil y desktop)
- Tema moderno con gradientes
- Animaciones fluidas
- Notificaciones toast
- Loading states
- Feedback visual en todas las acciones

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js v16 o superior
- MetaMask instalado
- ETH de testnet en Base Sepolia

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/BazanJC/frontend_blockchain_proyecto.git
cd frontend_blockchain_proyecto

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

### Build para Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                 React Frontend                      │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │   UI     │  │  Ethers  │  │   MetaMask   │    │
│  │Components│──│   .js    │──│  Integration │    │
│  └──────────┘  └──────────┘  └──────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│            Base Sepolia Blockchain                  │
│                                                     │
│  Token:  0x7Cfa80f3aAa0FB7880A951eF5B39B930...    │
│  Escrow: 0x1431d20901AecF05A8192498E0A7D635...    │
└─────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
frontend_blockchain_proyecto/
├── public/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html               # HTML base
├── package.json             # Dependencias
├── vite.config.js           # Configuración Vite
├── tailwind.config.js       # Configuración Tailwind
└── vercel.json              # Configuración Vercel
```

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.2.0 | Framework UI |
| **Vite** | 5.0.8 | Build tool |
| **Ethers.js** | 5.7.2 | Web3 library |
| **Tailwind CSS** | 3.3.6 | Estilos |
| **Lucide React** | 0.294.0 | Iconos |
| **MetaMask** | - | Wallet |

## 🎯 Configuración de Contratos

Los contratos están configurados en `src/App.jsx`:

```javascript
const CONTRACTS = {
  TOKEN: '0x7Cfa80f3aAa0FB7880A951eF5B39B930A8DA7e51',
  ESCROW: '0x1431d20901AecF05A8192498E0A7D635F4ca76ea',
  CHAIN_ID: 84532, // Base Sepolia
  RPC_URL: 'https://sepolia.base.org',
  EXPLORER_URL: 'https://sepolia.basescan.org'
};
```

## 💡 Uso de la Aplicación

### 1️⃣ Conectar Wallet

```
1. Click en "Conectar Wallet"
2. Aprobar en MetaMask
3. La app detectará/cambiará a Base Sepolia automáticamente
```

### 2️⃣ Como Comprador

```
1. Seleccionar rol "Comprador"
2. Llenar formulario de nueva orden:
   - Dirección del proveedor
   - Dirección del validador
   - Monto en tokens
   - Detalles del producto (opcional)
3. Click "Crear Orden"
4. Aprobar tokens en MetaMask (tx 1)
5. Confirmar creación en MetaMask (tx 2)
```

### 3️⃣ Como Validador

```
1. Cambiar cuenta en MetaMask
2. Seleccionar rol "Validador"
3. Ver orden pendiente
4. Click "Confirmar Entrega"
5. Aprobar en MetaMask
```

### 4️⃣ Como Proveedor

```
1. Cambiar cuenta en MetaMask
2. Seleccionar rol "Proveedor"
3. Ver orden entregada
4. Click "Retirar Fondos"
5. Aprobar en MetaMask
```

## 🔐 Seguridad

### Características de Seguridad Implementadas

- ✅ Validación de direcciones Ethereum
- ✅ Verificación de red (Base Sepolia)
- ✅ Manejo seguro de transacciones
- ✅ Sin almacenamiento de private keys
- ✅ Firma de transacciones vía MetaMask
- ✅ Validación de formularios client-side

### Buenas Prácticas

- Las transacciones siempre requieren aprobación del usuario
- No se almacenan private keys ni datos sensibles
- Todas las operaciones críticas se firman con MetaMask
- El frontend solo lee datos de la blockchain

## 🚀 Deploy en Vercel

### Método Automático (Recomendado)

1. Conecta este repo con Vercel
2. Configura el proyecto:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
3. Click Deploy

### Método CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🌐 Variables de Entorno (Opcional)

Si quieres externalizar la configuración:

```env
VITE_TOKEN_ADDRESS=0x7Cfa80f3aAa0FB7880A951eF5B39B930A8DA7e51
VITE_ESCROW_ADDRESS=0x1431d20901AecF05A8192498E0A7D635F4ca76ea
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
```

## 🐛 Troubleshooting

### MetaMask no se conecta

**Solución:**
```
1. Verifica que MetaMask esté instalado
2. Refresca la página
3. Verifica que estés en Base Sepolia
```

### Las transacciones fallan

**Solución:**
```
1. Verifica que tengas ETH para gas
2. Verifica que hayas aprobado los tokens
3. Revisa la consola del navegador
```

### No veo mis órdenes

**Solución:**
```
1. Verifica que estés en el rol correcto
2. Las órdenes se filtran por tu dirección
3. Prueba cambiar de rol y volver
```

## 📊 Características Futuras

- [ ] Integración real con contratos (actualmente simulado)
- [ ] Sistema de notificaciones push
- [ ] Modo oscuro
- [ ] Soporte multi-idioma
- [ ] Historial de transacciones
- [ ] Exportar datos a CSV
- [ ] Integración con IPFS para documentos
- [ ] Chat entre participantes

## 🤝 Contribución

Las contribuciones son bienvenidas:

```bash
# Fork el proyecto
git clone https://github.com/TU-USUARIO/frontend_blockchain_proyecto.git

# Crear rama
git checkout -b feature/nueva-caracteristica

# Commit
git commit -m "Agrega nueva característica"

# Push
git push origin feature/nueva-caracteristica

# Abrir Pull Request
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Bazán J.C.**

- 🎓 Proyecto de bootCamp Blockchain 2025
- 📧 GitHub: [@BazanJC](https://github.com/BazanJC)
- 🔗 Smart Contracts: [contrato_proyecto_blockchain](https://github.com/BazanJC/contrato_proyecto_blockchain)

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Framework UI
- [Vite](https://vitejs.dev/) - Build tool
- [Ethers.js](https://docs.ethers.org/) - Web3 library
- [Tailwind CSS](https://tailwindcss.com/) - Estilos
- [Base](https://base.org/) - Layer 2 blockchain
- [MetaMask](https://metamask.io/) - Wallet

## 🔗 Enlaces Útiles

- **Documentación Base**: https://docs.base.org/
- **Base Sepolia Faucet**: https://docs.base.org/tools/network-faucets
- **Ethers.js Docs**: https://docs.ethers.org/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/

---

⭐ Si este proyecto te resultó útil, considera darle una estrella!

**Desarrollado con ❤️ para demostrar el potencial de blockchain en cadenas de suministro**
