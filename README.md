# PNS Auto Bot 🤖
<img width="918" height="485" alt="image" src="https://github.com/user-attachments/assets/a6be3c59-b7dd-4610-9dae-68dd89795f4c" />


A Node.js automation bot for registering PNS (Pharos Name Service) domains on the Ethereum blockchain. This bot automatically registers random domain names using multiple wallet private keys with configurable concurrency and retry mechanisms.

## 🚀 Features

- **Automated Domain Registration**: Automatically registers random PNS domains
- **Multi-Wallet Support**: Process multiple private keys simultaneously
- **Concurrent Processing**: Configurable concurrency for optimal performance
- **Retry Mechanism**: Built-in error handling with automatic retries
- **Real-time Logging**: Color-coded console output for easy monitoring
- **Gas Optimization**: Efficient transaction handling with proper gas management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Ethereum testnet/mainnet RPC endpoint
- Private keys for wallet accounts (stored in `pk.txt`)

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the directory
   cd Pns-Auto-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your settings**
   - Edit `config.js` to set your RPC URL and other parameters
   - Add your private keys to `pk.txt` (one per line)

## ⚙️ Configuration

### config.js
```javascript
module.exports = {
  RPC_URL: "https://testnet.dplabs-internal.com", // Your RPC endpoint
  CONTROLLER_ADDRESS: "0x51be1ef20a1fd5179419738fc71d95a8b6f8a175", // PNS Controller contract
  DURATION: 31536000, // Registration duration in seconds (1 year)
  RESOLVER: "0x9a43dcA1C3BB268546b98eb2AB1401bFc5b58505", // Resolver contract
  DATA: [], // Additional data for registration
  REVERSE_RECORD: true, // Enable reverse record
  OWNER_CONTROLLED_FUSES: 0, // Fuse settings
  REG_PER_KEY: 1, // Number of registrations per private key
  MAX_CONCURRENCY: 10 // Maximum concurrent operations
};
```

### pk.txt
Create a file named `pk.txt` with your private keys (one per line):
```


## 🚀 Usage

### Method 1: Using the batch file (Windows)
```bash
Run.bat
```

### Method 2: Using Node.js directly
```bash
node run.js
```


## 📊 How It Works

1. **Initialization**: Reads private keys from `pk.txt`
2. **Domain Generation**: Creates random domain names (9 characters)
3. **Commitment Phase**: 
   - Generates commitment hash
   - Sends commit transaction
   - Waits for minCommitmentAge (60 seconds)
4. **Registration Phase**:
   - Calculates registration price
   - Sends registration transaction
   - Confirms successful registration
5. **Error Handling**: Retries failed operations up to 5 times with 60-second delays

## 🔧 Customization

### Registration Parameters
- **Domain Length**: Modify `randomName(length = 9)` in `index.js`
- **Registration Duration**: Change `DURATION` in `config.js`
- **Concurrency**: Adjust `MAX_CONCURRENCY` for performance
- **Retries per Key**: Modify `REG_PER_KEY` for multiple registrations per wallet

### Network Configuration
- **Testnet**: Use testnet RPC URL and ensure sufficient testnet ETH
- **Mainnet**: Change RPC URL and ensure sufficient mainnet ETH for gas fees

## 📝 Logging

The bot provides detailed logging with color-coded output:
- 🔵 **Blue**: Commitment information
- 🟢 **Green**: Successful operations
- 🟡 **Yellow**: Waiting periods and retries
- 🔴 **Red**: Errors and failures
- 🟣 **Magenta**: Price information

## ⚠️ Important Notes

1. **Gas Fees**: Ensure wallets have sufficient ETH for gas fees
2. **Network**: Verify RPC URL is correct for your target network
3. **Private Keys**: Keep your `pk.txt` file secure and never share it
4. **Rate Limiting**: The bot includes built-in delays to avoid rate limiting
5. **Testnet vs Mainnet**: Configure appropriately for your target network

## 🛡️ Security

- **Private Key Security**: Store private keys securely and never commit them to version control
- **Network Security**: Use HTTPS RPC endpoints
- **Environment Variables**: Consider using environment variables for sensitive data

## 🔍 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure wallets have sufficient ETH for gas fees
   - Check network configuration

2. **"Nonce too low"**
   - Wait for pending transactions to confirm
   - Restart the bot

3. **"Commitment not found"**
   - Ensure minCommitmentAge has passed
   - Check commitment generation logic

4. **"Domain already registered"**
   - The bot will automatically retry with a new random name

### Debug Mode
Add console.log statements in the code for detailed debugging:
```javascript
console.log('Debug info:', variable);
```

## 📦 Dependencies

- **ethers**: Ethereum library for blockchain interaction
- **chalk**: Terminal color output
- **p-limit**: Concurrency control
- **crypto**: Cryptographic functions for secret generation
- **fs**: File system operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## ⚡ Performance Tips

- **Optimal Concurrency**: Start with `MAX_CONCURRENCY: 5` and adjust based on network performance
- **RPC Selection**: Use reliable, fast RPC endpoints
- **Network Monitoring**: Monitor gas prices and adjust timing if needed
- **Batch Processing**: Consider processing during low-activity periods

## 🔗 Related Links

- [Ethereum Documentation](https://ethereum.org/developers/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [PNS Documentation](https://docs.pharos.com/)

---

**⚠️ Disclaimer**: This bot is for educational and automation purposes. Use at your own risk and ensure compliance with applicable laws and regulations.
