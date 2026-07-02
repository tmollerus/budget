export const getAuthToken = (headers: any): string => {
  return headers['authorization'] ? headers['authorization'].split(' ')[1] : '';
};

export const logElapsedTime = (message: string, startTime: Date): Date => {
  const currentTime = new Date();
  console.log(message, currentTime.getTime() - startTime.getTime());

  return currentTime;
};

