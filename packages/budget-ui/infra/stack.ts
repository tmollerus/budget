/* eslint-disable @typescript-eslint/naming-convention */
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  PriceClass,
  ViewerProtocolPolicy,
  Distribution,
  SecurityPolicyProtocol,
  SSLMethod,
  OriginAccessIdentity,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export class BudgetUiStack extends Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const originAccessIdentity: OriginAccessIdentity = new OriginAccessIdentity(
      this,
      'BudgetUiOriginAccessIdentity',
    );

    const logBucket = new Bucket(
      this,
      'BudgetUiLogBucket',
      {
        bucketName: 'budget.mollerus.net-logs',
      }
    );

    const sourceBucket = new Bucket(
      this,
      'BudgetUiSourceBucket',
      {
        bucketName: 'budget.mollerus.net-ui',
      }
    );
    sourceBucket.grantRead(originAccessIdentity);

    const s3Origin = S3BucketOrigin.withOriginAccessIdentity(
      sourceBucket,
      { 
        originPath: '/',
        originAccessIdentity
      },
    );

    const distribution = new Distribution(
      this,
      'BudgetUiDistribution',
      {
        enableLogging: true,
        logBucket,
        logFilePrefix: 'BudgetUi',
        domainNames: ['budget.mollerus.net'],
        certificate: Certificate.fromCertificateArn(
          this,
          'BudgetUiCertificate',
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
        comment: 'Budget UI',
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

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('./build')],
      destinationBucket: sourceBucket,
      destinationKeyPrefix: '/',
      distribution: distribution,
      distributionPaths: ['/*'],
    });
  }
}

const app = new App();
new BudgetUiStack(app, `budget-ui`);
