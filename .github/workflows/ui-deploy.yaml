/* eslint-disable @typescript-eslint/naming-convention */
import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import {
  OriginAccessIdentity,
  PriceClass,
  ViewerProtocolPolicy,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginRequestPolicy,
  Distribution,
  SecurityPolicyProtocol,
  SSLMethod,
  CachePolicy,
  CacheCookieBehavior,
  AllowedMethods,
  CacheQueryStringBehavior,
  OriginProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import { HttpOrigin, S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Alarm, ComparisonOperator, Metric } from '@aws-cdk/aws-cloudwatch';
import { Canary, Code, Runtime, Schedule, Test } from '@aws-cdk/aws-synthetics';
import {
  HostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { Topic } from '@aws-cdk/aws-sns';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Certificate } from '@aws-cdk/aws-certificatemanager';

interface Env {
  domain: string;
  originAccessIdentity: string;
  alias: string;
  acmCertArn: string;
  bucketArn: string;
  originPath: string;
  alarmTopicArn: string;
  wafArn: string;
  logBucketArn: string;
  hostedZoneId?: string;
  cstransitOriginUrl: string;
}

interface EnvMap {
  [index: string]: Env;
}

const envName: string = (process.env.ENV_NAME || 'local').toLowerCase();

export class ECommQuoteUiStack extends Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const envMap: EnvMap = {
      devmaj: {
        domain: 'sunrundev.com',
        originAccessIdentity: 'EDMC1HSYLEBFK',
        alias: 'devmaj-quote',
        acmCertArn:
          'arn:aws:acm:us-east-1:563116987804:certificate/d89f1f9a-6c52-47f3-8b4f-adf27f3e9597',
        hostedZoneId: 'Z3DCLNVJZZ5852',
        bucketArn: 'arn:aws:s3:::sunrundev-cloudfront',
        originPath: 'ui-ecomm-quote',
        alarmTopicArn:
          'arn:aws:sns:us-west-2:563116987804:Martech_notifications_devmaj',
        wafArn:
          'arn:aws:wafv2:us-east-1:563116987804:global/webacl/sunrun-waf-devmaj/04645147-cc83-4e83-a6e6-58c656bafd2c',
        logBucketArn: 'arn:aws:s3:::sunrundev-cloudfront-logs',
        cstransitOriginUrl: 'cstransit2-staging.us-west-2.elasticbeanstalk.com',
      },
      majstg: {
        domain: 'sunrun.com',
        originAccessIdentity: 'E1M743I7QPF1RQ', // same as prd bc majstg is in prd aws account
        alias: 'majstg-quote',
        acmCertArn:
          'arn:aws:acm:us-east-1:578915239930:certificate/fe22fea3-3091-4710-8dc6-8e1897641112',
        hostedZoneId: 'ZW6XUTNBV9FDM',
        bucketArn: 'arn:aws:s3:::sunrun-cloudfront',
        originPath: 'ui-ecomm-quote-majstg',
        alarmTopicArn: 'arn:aws:sns:us-west-2:578915239930:Martech-team-alerts',
        wafArn:
          'arn:aws:wafv2:us-east-1:578915239930:global/webacl/sunrun_prod_acl/c43eb670-797f-4fda-a68e-f54192642036',
        logBucketArn: 'arn:aws:s3:::sunrun-cloudfront-logs',
        cstransitOriginUrl: 'cstransit2-staging.us-west-2.elasticbeanstalk.com',
      },
      prd: {
        domain: 'sunrun.com',
        originAccessIdentity: 'E1M743I7QPF1RQ',
        alias: 'quote',
        acmCertArn:
          'arn:aws:acm:us-east-1:578915239930:certificate/fe22fea3-3091-4710-8dc6-8e1897641112',
        hostedZoneId: 'ZW6XUTNBV9FDM',
        bucketArn: 'arn:aws:s3:::sunrun-cloudfront',
        originPath: 'ui-ecomm-quote',
        alarmTopicArn: 'arn:aws:sns:us-west-2:578915239930:Martech-team-alerts',
        wafArn:
          'arn:aws:wafv2:us-east-1:578915239930:global/webacl/sunrun_prod_acl/c43eb670-797f-4fda-a68e-f54192642036',
        logBucketArn: 'arn:aws:s3:::sunrun-cloudfront-logs',
        cstransitOriginUrl: 'cstransit2-prod.elasticbeanstalk.com',
      },
    };

    const bucketArnParts = envMap[envName].bucketArn.split(':');
    const bucket = Bucket.fromBucketAttributes(this, 'Bucket', {
      bucketArn: envMap[envName].bucketArn,
      bucketRegionalDomainName: `${
        bucketArnParts[bucketArnParts.length - 1]
      }.s3.amazonaws.com`,
    });

    const originAccessIdentity =
      OriginAccessIdentity.fromOriginAccessIdentityName(
        this,
        'SunrunOriginAccessIdentity',
        envMap[envName].originAccessIdentity
      );

    //cloud front function
    const rewriteRequests = new Function(
      this,
      `${this.stackName}-addSlashAndIndex`,
      {
        functionName: `${this.stackName}-addSlashAndIndex`,
        code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;

          // Check whether the URI is missing a file name.
          if (uri.endsWith('/')) {
              request.uri += 'index.html';
          }
          // Check whether the URI is missing a file extension.
          else if (!uri.includes('.') && !uri.endsWith('/')) {
              request.uri += '.html';
          }

          return request;
        }
        `),
      }
    );

    //cloud front function
    const addCorsResponseHeaders = new Function(
      this,
      `${this.stackName}-addCorsResponseHeaders`,
      {
        functionName: `${this.stackName}-addCorsResponseHeaders`,
        code: FunctionCode.fromInline(`
          function handler(event)  {
            var response = event.response;
            var headers = response.headers;
        
            if (!headers['access-control-allow-origin']) {
                headers['access-control-allow-origin'] = {value: "*"};
            }
        
            return response;
          }
        `),
      }
    );

    const reactOrigin = new S3Origin(bucket, {
      originPath: envMap[envName].originPath,
      originAccessIdentity,
    });

    const cstransitOrigin = new HttpOrigin(envMap[envName].cstransitOriginUrl, {
      protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
    });

    const cstransitCachePolicy = new CachePolicy(this, 'CstransitCachePolicy', {
      cachePolicyName: `${envMap[envName].alias}-quote-microsite-Cstransit-Cache-Policy`,
      comment: 'Let cstransit control caching on its own content',
      defaultTtl: Duration.seconds(86400),
      minTtl: Duration.seconds(1),
      maxTtl: Duration.seconds(31536000),
      cookieBehavior: CacheCookieBehavior.all(),
      queryStringBehavior: CacheQueryStringBehavior.all(),
    });

    const distribution = new Distribution(
      this,
      'SunrunCloudFrontDistribution',
      {
        enableLogging: true,
        logBucket: Bucket.fromBucketArn(
          this,
          'LogBucket',
          envMap[envName].logBucketArn
        ),
        logFilePrefix: `${envMap[envName].alias}.${envMap[envName].domain}/`,
        webAclId: envMap[envName].wafArn,
        domainNames: [`${envMap[envName].alias}.${envMap[envName].domain}`],
        certificate: Certificate.fromCertificateArn(
          this,
          'Certificate',
          envMap[envName].acmCertArn
        ),
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2018,
        sslSupportMethod: SSLMethod.SNI,
        defaultBehavior: {
          origin: reactOrigin,
          compress: true,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              function: rewriteRequests,
              eventType: FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
        additionalBehaviors: {
          '/proxy*': {
            origin: cstransitOrigin,
            compress: true,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
            cachePolicy: cstransitCachePolicy,
            viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
          },
          '/_next/static/media/*': {
            origin: reactOrigin,
            compress: true,
            cachePolicy: CachePolicy.CACHING_DISABLED,
            originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            functionAssociations: [
              {
                function: addCorsResponseHeaders,
                eventType: FunctionEventType.VIEWER_RESPONSE,
              },
            ],
          },
        },
        priceClass: PriceClass.PRICE_CLASS_ALL,
        comment: `Solar Quote Configurator ${envName}`,
        defaultRootObject: `index.html`,
        enabled: true,
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 404,
            responsePagePath: `/404/index.html`,
          },
        ],
      }
    );

    const errorRateMetric = new Metric({
      namespace: `AWS/CloudFront`,
      metricName: '5xxErrorRate',
      region: 'Global',
      statistic: 'AVERAGE',
      period: Duration.minutes(1),
      dimensions: { DistributionId: `${distribution.distributionId}` },
    });
    const errorRateAlarmName = `${envMap[envName].alias}-${envMap[envName].domain}-5xx-errors-alarm`;
    const errorRateAlarm = errorRateMetric.createAlarm(
      this,
      errorRateAlarmName,
      {
        threshold: 6,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        evaluationPeriods: 1,
        alarmName: errorRateAlarmName,
        alarmDescription:
          'Alarm if the average of 5xx errors is greater than or equal to the threshold (6) for 1 evaluation period',
      }
    );
    const topic = Topic.fromTopicArn(
      this,
      `${envName}-topic`,
      envMap[envName].alarmTopicArn
    );
    errorRateAlarm.addAlarmAction(new SnsAction(topic));

    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      `${envMap[envName].domain}-${envMap[envName].hostedZoneId}`,
      {
        hostedZoneId: envMap[envName].hostedZoneId as string,
        zoneName: envMap[envName].domain,
      }
    );

    new RecordSet(this, `${envMap[envName].alias}.${envMap[envName].domain}`, {
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
      recordName: `${envMap[envName].alias}.${envMap[envName].domain}`,
      recordType: RecordType.A,
    });

    // Deploy build to S3
    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('./out')],
      destinationBucket: bucket,
      destinationKeyPrefix: envMap[envName].originPath,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    const quoteHomepageCanary = new Canary(
      this,
      'Solar Micro-Site Homepage Canary',
      {
        canaryName: `${envName}-quote-home`,
        schedule: Schedule.rate(Duration.minutes(5)),
        test: Test.custom({
          code: Code.fromAsset('infra/solar-quote-homepage-canary'),
          handler: 'index.handler',
        }),
        runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_5,
        environmentVariables: {
          URL: `https://${envMap[envName].alias}.${envMap[envName].domain}/`,
        },
      }
    );

    const homepageCanaryAlarmName = `${envName}-solar-quote-home-canary-alarm`;
    const homepageCanaryAlarm = new Alarm(this, homepageCanaryAlarmName, {
      metric: quoteHomepageCanary.metricSuccessPercent(),
      threshold: 90,
      comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 1,
      alarmName: homepageCanaryAlarmName,
      alarmDescription:
        'Alarm if the solar quote homepage availability is less than the threshold (90%) for 1 evaluation period',
    });
    homepageCanaryAlarm.addAlarmAction(new SnsAction(topic));
  }
}

const app = new App();
new ECommQuoteUiStack(app, `${envName}-ui-ecomm-quote`);
