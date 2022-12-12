import { Effect } from "../types";

export const getPolicy = (
  principalId: string,
  effect: Effect,
  resource: string,
  context?: {[index: string]: string},
) => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: Object.assign({}, context || {})
  };
};