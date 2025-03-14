import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  elizaLogger,
  composeContext,
  generateObjectDeprecated,
  ModelClass,
} from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { addLiquidityTemplate } from "../templates";
import type { LiquidityParams, SupportedChain, Transaction } from "../types";
import { getTxData, sendTransaction } from "./services";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../contracts/artifacts";
import { Abi, parseEther } from "viem";

export class AddLiquidityAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async addLiquidity(params: LiquidityParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.chain);

    try {
      const chainConfig = this.walletProvider.getChainConfigs(params.chain);

      // Log current block before sending transaction
      const publicClient = this.walletProvider.getPublicClient(params.chain);

      const approvalHash = await sendTransaction(
        walletClient,
        walletClient.account,
        TOKEN_CONTRACT_ADDRESS,
        BigInt(0),
        getTxData(TOKEN_CONTRACT_ABI as Abi, "approve", [
          EXCHANGE_CONTRACT_ADDRESS,
          parseEther(params.olame),
        ]),
        chainConfig
      );

      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approvalHash,
      });

      console.log("Successfully approved ✅");
      

      let hash;
      if (approvalReceipt) {
        hash = await sendTransaction(
          walletClient,
          walletClient.account,
          EXCHANGE_CONTRACT_ADDRESS,
          BigInt(0),
          getTxData(EXCHANGE_CONTRACT_ABI as Abi, "addLiquidity", [
            parseEther(params.olame),
          ]),
          chainConfig
        );
      }

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      console.log("Successfully added ✅");
      
      return {
        hash,
        from: walletClient.account.address,
        to: EXCHANGE_CONTRACT_ADDRESS,
        value: BigInt(0),
        data: getTxData(EXCHANGE_CONTRACT_ABI as Abi, "addLiquidity", [
          parseEther(params.olame),
        ]),
        chainId: this.walletProvider.getChainConfigs(params.chain).id,
        logs: receipt.logs,
      };
    } catch (error) {
      throw new Error(`addLiquidity failed: ${error.message}`);
    }
  }
}

export const addLiquidityAction = {
  name: "addLiquidity",
  description: "Add liquidity to the pool",
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    state: State,
    _options: any,
    callback?: any
  ) => {
    elizaLogger.log("addLiquidity action handler called");

    // Compose addLiquidity context
    const addLiquidityContext = composeContext({
      state,
      template: addLiquidityTemplate,
    });
    const content = await generateObjectDeprecated({
      runtime,
      context: addLiquidityContext,
      modelClass: ModelClass.LARGE,
    });

    const addLiquidityOptions: LiquidityParams = {
      chain: content.chain,
      olame: content.olame,
      celo: content.celo,
    };

    try {
      // Convert options to LiquidityParams
      const liquidityParams: LiquidityParams = {
        chain: "celo" as SupportedChain,
        celo: String(addLiquidityOptions.celo),
        olame: String(addLiquidityOptions.olame),
      };

      const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
      const walletProvider = new WalletProvider(
        privateKey,
        runtime.cacheManager
      );
      const action = new AddLiquidityAction(walletProvider);
      console.log("liquidityParams", liquidityParams);

      const approvalResp = await action.addLiquidity(liquidityParams);

      if (callback) {
        callback({
          text: `Successfully added ${liquidityParams.olame} olame tokens approved ✅  \nTransaction Hash: ${approvalResp.hash}`,
          content: {
            success: true,
            hash: approvalResp.hash,
            recipient: approvalResp.to,
            chain: content.chain,
          },
        });
      }
      return true;
    } catch (error) {
      console.error("Error in add liquidity handler:", error.message);
      if (callback) {
        callback({ text: `Error: ${error.message}` });
      }
      return false;
    }
  },
  template: addLiquidityTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Add liquidity for 5 olame",
          action: "ADD_OLAME_LIQUIDITY",
        },
      },
    ],
    [
      {
        user: "user",
        content: {
          text: "Add liquidity for 01 celo",
          action: "ADD_OLAME_LIQUIDITY",
        },
      },
    ],
  ],
  similes: ["ADD_OLAME_LIQUIDITY", "ADD_OLAME_CELO_LIQUIDITY"],
}; // TODO: add more examples
