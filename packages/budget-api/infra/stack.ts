/* eslint-disable @typescript-eslint/naming-convention */
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';

export class BudgetApiStack extends Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`);
