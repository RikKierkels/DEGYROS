import { parse, ParseResult } from 'papaparse';

export const parseCsv = <T>(headers: string[], transform: (value: string) => any) => (text: string): ParseResult<T> =>
  parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transform,
    transformHeader(_, index: number): string {
      return headers[index];
    },
  });
