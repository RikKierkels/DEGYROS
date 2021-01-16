import { ReadStream } from 'fs-capacitor';

export const mapStreamTo = <T>(mapFn: (data: string) => T) => (stream: ReadStream): Promise<T> =>
  new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => resolve(mapFn(data)));
    stream.on('error', (error) => reject(error));
  });
