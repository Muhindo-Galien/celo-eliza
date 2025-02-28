
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { transferAction } from "./actions/transfer";
import { faucetAction } from "./actions/faucet";
import { evmWalletProvider } from "./providers/wallet";
import { addLiquidityAction } from "./actions/addLiquidity";
// import { poolInfoAction } from "./actions/poolInfo";
import { opportunitiesAction } from "./actions/opportunities";
import { removeLiquidityAction } from "./actions/removeLiquidity";

export const evmPlugin: Plugin = {
  name: "evm",
  description: "EVM blockchain integration plugin",
  providers: [evmWalletProvider],
  evaluators: [],
  services: [],
  actions: [
    transferAction,
    faucetAction,
    addLiquidityAction,
    opportunitiesAction,
    removeLiquidityAction,
  ],
};

export default evmPlugin;
