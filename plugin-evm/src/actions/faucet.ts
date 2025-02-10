import type {
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { faucetTemplate } from "../templates";
import type { SupportedChain, Transaction, FaucetParams } from "../types";

import { TOKEN_CONTRACT_ADDRESS } from "../contracts/artifacts";
import { getFaucetTxData, sendTransaction } from "./services";

export class FaucetAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async getICB(params: FaucetParams): Promise<Transaction> {
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
        getFaucetTxData("faucet", []),
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
        data: getFaucetTxData("faucet", []),
        chainId: this.walletProvider.getChainConfigs(params.chain).id,
        logs: receipt.logs,
      };
    } catch (error) {
      throw new Error(`Faucet failed: ${error.message}`);
    }
  }
}

export const faucetAction = {
  name: "faucet",
  description: "Get ICB tokens from the faucet ",
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    options: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      // Convert options to FaucetParams
      const faucetParams: FaucetParams = {
        chain: "celoAlfajores" as SupportedChain,
      };

      const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
      const walletProvider = new WalletProvider(
        privateKey,
        runtime.cacheManager
      );
      const action = new FaucetAction(walletProvider);
      return await action.getICB(faucetParams);
    } catch (error) {
      console.error("Error in faucet handler:", error.message);
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
          text: "Get ICB tokens from the faucet on celoAlfajores",
          action: "FAUCET",
        },
      },
    ],
    [
      {
        user: "user",
        content: {
          text: "Send ICB tokens from the faucet on celoAlfajores",
          action: "FAUCET",
        },
      },
    ],
  ],
  similes: ["FAUCET", "FAUCET", "FAUCET"],
}; // TODO: add more examples
