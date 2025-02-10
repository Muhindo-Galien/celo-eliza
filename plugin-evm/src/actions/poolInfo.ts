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
import {
  addLiquidityTemplate,
  faucetTemplate,
  pooInfoTemplate,
} from "../templates";
import type { InfoParams, SupportedChain, Transaction } from "../types";
import { getTxData, sendTransaction } from "./services";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../contracts/artifacts";
import { Abi, Address, formatUnits, parseEther } from "viem";

export class PoolInfoAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async getPoolInfo(params: InfoParams): Promise<string | null> {
    try {
      // Log current block before sending transaction
      const publicClient = this.walletProvider.getPublicClient(params.chain);

      if (params.amountToSwap?.toLowerCase().includes("celo")) {
        const amountOfTokens = await publicClient.readContract({
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_CONTRACT_ABI,
          functionName: "getAmountOfTokens",
          args: [
            params.amountToSwap?.match(/\d+(\.\d+)?/)[0],
            params.celoBalance,
            params.reservedIcebear,
          ],
        });
        return amountOfTokens.toString();
      } else {
        const amountOfTokens = await publicClient.readContract({
          address: EXCHANGE_CONTRACT_ADDRESS,
          abi: EXCHANGE_CONTRACT_ABI,
          functionName: "getAmountOfTokens",
          args: [
            params.amountToSwap?.match(/\d+(\.\d+)?/)[0],
            params.reservedIcebear,
            params.celoBalance,
          ],
        });
        return amountOfTokens.toString();
      }
    } catch (error) {
      throw new Error(`pool info failed: ${error.message}`);
    }
  }
}
// ==========Get celo balance =================
export const getCeloBalance = async (
  walletProvider: WalletProvider,
  currentChain: SupportedChain,
  isContract: boolean
) => {
  try {
    const client = walletProvider.getPublicClient(currentChain);
    if (isContract) {
      const balance = await client.getBalance({
        address: EXCHANGE_CONTRACT_ADDRESS,
      });
      const balanceFormatted = formatUnits(balance, 18);
      return balanceFormatted;
    } else {
      const balance = await client.getBalance({
        address: walletProvider.account.address,
      });
      const balanceFormatted = balance;
      return balanceFormatted;
    }
  } catch (error) {
    console.log("Error getting celo balance:", error.message);
  }
};
// ==========Get icebar balance =================

export const getIcebearTokensBalance = async (
  walletProvider: WalletProvider,
  currentChain: SupportedChain,
  accountAddress: Address
) => {
  const client = walletProvider.getPublicClient(currentChain);
  try {
    const balanceOfIcebearTokens = await client.readContract({
      address: TOKEN_CONTRACT_ADDRESS,
      abi: TOKEN_CONTRACT_ABI,
      functionName: "balanceOf",
      args: [accountAddress],
    });

    return balanceOfIcebearTokens;
  } catch (error) {
    console.log("Error getting icebar balance:", error.message);
  }
};

// ========== Get Icebear LP Token balance ================

export const getLPTokensBalance = async (
  walletProvider: WalletProvider,
  currentChain: SupportedChain,
  accountAddress: Address
) => {
  const client = walletProvider.getPublicClient(currentChain);
  try {
    const balanceOfIcebearTokens = await client.readContract({
      address: EXCHANGE_CONTRACT_ADDRESS,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "balanceOf",
      args: [accountAddress],
    });

    return balanceOfIcebearTokens;
  } catch (error) {
    console.log("Error getting Icebear LP Token balance:", error.message);
  }
};

// ========== Get the reserve of Icebear tokens held by the pool ================

export const getReserveOfIcebearTokens = async (
  walletProvider: WalletProvider,
  currentChain: SupportedChain
) => {
  const client = walletProvider.getPublicClient(currentChain);
  try {
    const balanceOfIcebearTokens = await client.readContract({
      address: EXCHANGE_CONTRACT_ADDRESS,
      abi: EXCHANGE_CONTRACT_ABI,
      functionName: "getReserve",
      args: [],
    });

    return balanceOfIcebearTokens;
  } catch (error) {
    console.log(
      "Error getting the reserve of Icebear tokens held by the pool:",
      error.message
    );
  }
};
// =================================================================

export const poolInfoAction = {
  name: "poolInfo",
  description: "Get pool information",
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    state: State,
    _options: any,
    callback?: any
  ) => {
    elizaLogger.log("poolInfo action handler called");

    // Compose poolInfo context
    const poolInfoContext = composeContext({
      state,
      template: pooInfoTemplate,
    });
    const content = await generateObjectDeprecated({
      runtime,
      context: poolInfoContext,
      modelClass: ModelClass.LARGE,
    });

    // Add options gotten from thw template
    const addPoolInfoOptions: InfoParams = {
      chain: content.chain,
      amountToSwap: content.amountToSwap,
    };

    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY") as `0x${string}`;
    const walletProvider = new WalletProvider(privateKey, runtime.cacheManager);

    try {
      // Convert options to InfoParams
      const infoParams: InfoParams = {
        chain: "celoAlfajores" as SupportedChain,
        amountToSwap: String(addPoolInfoOptions.amountToSwap),
      };

      // Prints information
      console.log("addPooInfoParamslInfoOptions", infoParams);
      console.log(
        "If celo is selected",
        infoParams.amountToSwap?.toLowerCase().includes("celo")
      );

      console.log(
        "User celo  balance:",
        await getCeloBalance(walletProvider, infoParams.chain, false)
      );

      console.log(
        "User icebar balance:",
        await getIcebearTokensBalance(
          walletProvider,
          infoParams.chain,
          walletProvider.account.address
        )
      );

      console.log(
        "Pool celo  balance:",
        await getCeloBalance(walletProvider, infoParams.chain, true)
      );

      console.log(
        "Pool icebar balance:",
        await getIcebearTokensBalance(
          walletProvider,
          infoParams.chain,
          EXCHANGE_CONTRACT_ADDRESS
        )
      );

      console.log(
        "User Icebear LP Token balance:",
        await getLPTokensBalance(
          walletProvider,
          infoParams.chain,
          walletProvider.account.address
        )
      );

      console.log(
        "The reserve of Icebear tokens held by the pool:",
        await getReserveOfIcebearTokens(walletProvider, infoParams.chain)
      );

      const action = new PoolInfoAction(walletProvider);
      // const amountToReceive = await action.getPoolInfo(infoParams);

      // if (callback) {
      //   callback({
      //     text: `You'll get ${
      //       infoParams.amountToSwap?.toLowerCase().includes("celo")
      //         ? amountToReceive + "Celo"
      //         : amountToReceive + "icebar"
      //     } tokens`,
      //     content: {
      //       success: true,
      //       chain: content.chain,
      //     },
      //   });
      // }
      return true;
    } catch (error) {
      console.error("Error in poo info handler:", error.message);
      if (callback) {
        callback({ text: `Error: ${error.message}` });
      }
      return false;
    }
  },
  template: pooInfoTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "i want to swap 1 celo for icebar tokens ",
          action: "POOL_INFORMATION",
        },
      },
    ],
  ],
  similes: ["POOL_INFORMATION", "GET_POOL_INFORMATION", "GET_POOL_INFO"],
};
