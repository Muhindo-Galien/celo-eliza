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
import { addLiquidityTemplate, faucetTemplate } from "../templates";
import type { LiquidityParams, SupportedChain, Transaction } from "../types";
import { getTxData, sendTransaction } from "./services";
import {
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

      const hash = await sendTransaction(
        walletClient,
        walletClient.account,
        TOKEN_CONTRACT_ADDRESS,
        BigInt(0),
        getTxData(TOKEN_CONTRACT_ABI as Abi, "approve", [
          EXCHANGE_CONTRACT_ADDRESS,
          parseEther(params.icebear),
        ]),
        chainConfig
      );

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      return {
        hash,
        from: walletClient.account.address,
        to: TOKEN_CONTRACT_ADDRESS,
        value: BigInt(0),
        data: getTxData(TOKEN_CONTRACT_ABI as Abi, "approve", [
          EXCHANGE_CONTRACT_ADDRESS,
          parseEther(params.icebear),
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
  description: "Add liquidity to the exchange",
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
      icebear: content.icebear,
      celo: content.celo,
    };

    try {
      // Convert options to LiquidityParams
      const liquidityParams: LiquidityParams = {
        chain: "celoAlfajores" as SupportedChain,
        celo: String(addLiquidityOptions.celo),
        icebear: String(addLiquidityOptions.icebear),
      };

      const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
      const walletProvider = new WalletProvider(
        privateKey,
        runtime.cacheManager
      );
      const action = new AddLiquidityAction(walletProvider);
      const approvalResp=  await action.addLiquidity(liquidityParams);

      if (callback) {
        callback({
          text: `Successfully approved ${liquidityParams.icebear} icebar tokens approved \nTransaction Hash: ${approvalResp.hash}`,
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
  template: faucetTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Add liquidity for 1 celo 1000 icebear on celoAlfajores",
          action: "ADD_ICB_LIQUIDITY",
        },
      },
    ],
  ],
  similes: ["ADD_ICB_LIQUIDITY", "ADD_ICB_CELO_LIQUIDITY"],
}; // TODO: add more examples
