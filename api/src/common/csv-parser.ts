import { parse } from 'papaparse';

export const parseCsv = <T>(headers: string[], transform: (value: string) => any) => (text: string) =>
  parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transform,
    transformHeader(_, index: number): string {
      return headers[index];
    },
  });
