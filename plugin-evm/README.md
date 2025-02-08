# **Eliza AI Agent Starter for Celo Alfajores**  

This project provides a **starter AI agent using Eliza**, capable of interacting with **smart contracts deployed on Celo Alfajores**. It serves as a **hackathon guide** for building AI-driven blockchain applications with seamless contract interactions.  

## **Features**  
- ✅ **AI-powered smart contract execution** using Eliza  
- ✅ **Calls contracts on Celo Alfajores** testnet   
- ✅ **Uses `viem` for efficient blockchain interactions**  
- ✅ **Easily extendable for hackathon projects**  

## **Setup Instructions**  

### **1️⃣ Clone the Repository**  
```bash  
https://github.com/Muhindo-Galien/celo-eliza
cd eliza-ai-agent-celo  
```

### **2️⃣ Install Dependencies**  
```bash  
pnpm install  
```

### **3️⃣ Configure Environment Variables**  
Create a `.env` file and add:  

```ini  
EVM_PRIVATE_KEY=your_private_key  
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org  
```

### **4️⃣ Run the AI Agent**  
```bash  
cd plugin-evm
pnpm i && pnpm build
```

```bash  
cd ..
pnpm i && pnpm build

pnpm start
```
After running the above commands , you'll be able to interact with our AI agent.
Use the following query to see  interaction:

```bash
Get ICB tokens from the faucet   on celoAlfajore
```
This Send you 1000 ICB tokens you wallet


```bash
send 10 CELO tokens to <0x00000>
```


## **How It Works**  
- **Eliza AI Agent** processes **user prompts** and converts them into **smart contract calls**.  
- Interacts with **Celo’s Alfajores testnet** using `viem`.  
- Supports **token transactions, and contract interactions** with simple commands.  

## Guide to run the AI Agent


## **Hackathon Guide**  
- 🔹 **Extend Eliza AI** to support more contracts and DeFi use cases.  
- 🔹 **Automate DeFi transactions** with AI-powered smart contract execution.  
- 🔹 **Experiment with staking, swaps, and lending** on Celo Alfajores.  
- 🔹 **Build dApps that integrate AI-driven smart contract interactions.**  

## **Contributing**  
Fork the repo, make improvements, and submit a PR!   



**Happy hacking!**