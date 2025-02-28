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
import { removeLiquidityTemplate } from "../templates";
import type { LiquidityParams, SupportedChain, Transaction } from "../types";
import { getTxData, sendTransaction } from "./services";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../contracts/artifacts";
import { Abi, parseEther } from "viem";

export class RemoveLiquidityAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async removeLiquidity(params: LiquidityParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.chain);

    try {
      const chainConfig = this.walletProvider.getChainConfigs(params.chain);

      // Log current block before sending transaction
      const publicClient = this.walletProvider.getPublicClient(params.chain);

      let hash = await sendTransaction(
        walletClient,
        walletClient.account,
        EXCHANGE_CONTRACT_ADDRESS,
        BigInt(0),
        getTxData(EXCHANGE_CONTRACT_ABI as Abi, "removeLiquidity", [
          parseEther(params.olameLp),
        ]),
        chainConfig
      );

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

export const removeLiquidityAction = {
  name: "removeLiquidity",
  description: "Add liquidity to the pool",
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    state: State,
    _options: any,
    callback?: any
  ) => {
    elizaLogger.log("removeLiquidity action handler called");

    // Compose addLiquidity context
    const addLiquidityContext = composeContext({
      state,
      template: removeLiquidityTemplate,
    });
    const content = await generateObjectDeprecated({
      runtime,
      context: addLiquidityContext,
      modelClass: ModelClass.LARGE,
    });

    const removeLiquidityOptions: LiquidityParams = {
      chain: content.chain,
      olameLp: content.olameLp,
    };

    try {
      // Convert options to LiquidityParams
      const liquidityParams: LiquidityParams = {
        chain: "celo" as SupportedChain,
        olameLp: String(removeLiquidityOptions.olameLp),
      };

      const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
      const walletProvider = new WalletProvider(
        privateKey,
        runtime.cacheManager
      );
      const action = new RemoveLiquidityAction(walletProvider);
      console.log("liquidityParams", liquidityParams);

      // const approvalResp = await action.removeLiquidity(liquidityParams);

      // if (callback) {
      //   callback({
      //     text: `Successfully removed ${liquidityParams.olameLp} olame tokens ✅  \nTransaction Hash: ${approvalResp.hash}`,
      //     content: {
      //       success: true,
      //       hash: approvalResp.hash,
      //       recipient: approvalResp.to,
      //       chain: content.chain,
      //     },
      //   });
      // }
      return true;
    } catch (error) {
      console.error("Error in add liquidity handler:", error.message);
      if (callback) {
        callback({ text: `Error: ${error.message}` });
      }
      return false;
    }
  },
  template: removeLiquidityTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "remove liquidity of 0.1 OLAME-LP",
          action: "REMOVE_LIQUIDITY",
        },
      },
    ],
    [
      {
        user: "user",
        content: {
          text: "remove 1 OLAME-LP",
          action: "REMOVE_LIQUIDITY",
        },
      },
    ],
  ],
  similes: ["REMOVE_LIQUIDITY", "REMOVE_LIQUIDITY"],
}; // TODO: add more examples
