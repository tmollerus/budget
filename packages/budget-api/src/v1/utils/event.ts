import { APIGatewayProxyEvent } from 'aws-lambda';

export const getAuthToken = (headers: any): string => {
  return headers['authorization'] ? headers['authorization'].split(' ')[1] : '';
};