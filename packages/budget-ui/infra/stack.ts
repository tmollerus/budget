/* eslint-disable @typescript-eslint/naming-convention */
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import {
  PriceClass,
  ViewerProtocolPolicy,
  Distribution,
  SecurityPolicyProtocol,
  SSLMethod,
  OriginAccessIdentity,
} from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Certificate } from '@aws-cdk/aws-certificatemanager';

const ENV_NAME = (process.env.ENV_NAME === 'dev') ? 'dev' : 'prod';

export class BudgetUiStack extends Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const getHostName = (envName: string): string => {
      return (envName === 'dev') ? 'dev-budget' : 'budget';
    };

    const originAccessIdentity: OriginAccessIdentity = new OriginAccessIdentity(
      this,
      `BudgetUiOriginAccessIdentity-${ENV_NAME}`,
    );

    const logBucket = new Bucket(
      this,
      `${ENV_NAME}-BudgetUiLogBucket`,
      {
        bucketName: `budget.mollerus.net-${ENV_NAME}-logs`,
      }
    );

    const sourceBucket = new Bucket(
      this,
      `BudgetUiSourceBucket-${ENV_NAME}`,
      {
        bucketName: `budget.mollerus.net-${ENV_NAME}-ui`,
      }
    );
    sourceBucket.grantRead(originAccessIdentity);

    const s3Origin = new S3Origin(
      sourceBucket,
      { 
        originPath: '/',
        originAccessIdentity
      },
    );

    const distribution = new Distribution(
      this,
      `BudgetUiDistribution-${ENV_NAME}`,
      {
        enableLogging: true,
        logBucket,
        logFilePrefix: 'BudgetUi',
        domainNames: [`${getHostName(ENV_NAME)}.mollerus.net`],
        certificate: Certificate.fromCertificateArn(
          this,
          `BudgetUiCertificate-${ENV_NAME}`,
          'arn:aws:acm:us-east-1:360115878429:certificate/c0493e59-c808-443c-ab49-d96023a1e417'
        ),
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
        sslSupportMethod: SSLMethod.SNI,
        defaultBehavior: {
          origin: s3Origin,
          compress: true,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        priceClass: PriceClass.PRICE_CLASS_100,
        comment: `Budget UI ${ENV_NAME}`,
        defaultRootObject: `index.html`,
        enabled: true,
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      }
    );

    new BucketDeployment(this, `DeployWebsite-${ENV_NAME}`, {
      sources: [Source.asset('./build')],
      destinationBucket: sourceBucket,
      destinationKeyPrefix: '/',
      distribution: distribution,
      distributionPaths: ['/*'],
    });
  }
}

const app = new App();
new BudgetUiStack(app, `budget-ui-${ENV_NAME}`);
