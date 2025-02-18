import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  composeContext,
  generateObjectDeprecated,
  ModelClass,
  elizaLogger,
} from "@elizaos/core";
import { opportunitiesTemplate } from "../templates";
import axios, { AxiosResponse } from "axios";
import { Pool } from "../utils";
import { OpportunityParams } from "../types";

class MerklService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = "https://api.merkl.xyz/v4/opportunities?chainId=42220";
  }

  public async fetchOpportunities(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(this.apiUrl);
      const processPools = (pools: any[]): Pool[] => {
        return pools.map((pool) => ({
          tvl: pool.tvl,
          apr: pool.apr,
          dailyRewards: pool.dailyRewards,
          tokens: pool?.tokens.map((token) => ({
            price: token.price,
            symbol: token.symbol,
          })),
        }));
      };
      const results = processPools(response.data);
      return results;
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  }
}

export const opportunitiesAction = {
  name: "opportunities",
  description: "Gets opportunities ",
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
      template: opportunitiesTemplate,
    });
    const content = await generateObjectDeprecated({
      runtime,
      context: poolInfoContext,
      modelClass: ModelClass.LARGE,
    });

    // Add options gotten from thw template
    const addPoolDataOptions: OpportunityParams = {
      chain: content.chain,
      apr: String(content.apr),
      rewards: String(content.rewards),
      moreTvl: String(content.moreTvl),
    };


    try {

      const merklService = new MerklService();
      const poolData = await merklService.fetchOpportunities();
      console.log(JSON.stringify(poolData, null, 2));

      if (callback) {
        let text = "";

        for (let i = 0; i < poolData.length; i++) {
          const pool = poolData[i];
          text += `Pool ${i + 1}:\n`;
          text += `TVL: ${pool.tvl}\n`;
          text += `APR: ${pool.apr}%\n`;
          text += `Daily Rewards: ${pool.dailyRewards}\n`;
          text += `Tokens:\n`;

          for (let j = 0; j < pool.tokens.length; j++) {
            const token = pool.tokens[j];
            text += `  - ${token.symbol} (Price: ${token.price})\n`;
          }

          text += "\n"; // Add a new line for spacing between pools
        }

        callback({
          text: `You'll need:\n${text}`,
          content: {
            success: true,
            chain: "celo",
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error in opportunities handler:", error.message);
      if (callback) {
        callback({ text: `Error: ${error.message}` });
      }
      return false;
    }
  },

  template: opportunitiesTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
    return typeof privateKey === "string" && privateKey.startsWith("0x");
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Get all opportunities",
          action: "opportunities",
        },
      },
    ],
  ],
  similes: ["opportunities", "opportunities", "opportunities"],
}; // TODO: add more examples
