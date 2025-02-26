import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  elizaLogger,
} from "@elizaos/core";
import { greetingTemplate } from "../templates";

export const greetingAction = {
  name: "log my routine",
  description: "Prints my routine",
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    _options: any,
    callback?: HandlerCallback
  ) => {
    elizaLogger.log("my routine action handler called");

    try {
      console.log("My routine");

      if (callback) {
        callback({
          text: "My routine!",
          content: {
            success: true,
          },
        });
      }
      return true;
    } catch (error) {
      console.error("Error in My routine handler:", error.message);
      if (callback) {
        callback({ text: `Error: ${error.message}` });
      }
      return false;
    }
    },
  template: greetingTemplate,
  validate: async (_runtime: IAgentRuntime) => {
    return true; // No validation needed for this simple action
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "My routine on celoAlfajores",
          action: "ROUTINE",
        },
      },
    ],
  ],
  similes: ["ROUTINE", "ROUTINE", "MY_ROUTINE"],
};
