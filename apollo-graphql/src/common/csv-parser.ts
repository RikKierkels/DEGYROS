import { parse, ParseError, ParseResult } from 'papaparse';

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

export const formatErrorMessagesByCode = (errors: ParseError[]): Record<string, string> =>
  errors.reduce(
    (props, { code, row, message }) => ((props[code] = `${message} on row: ${row}`), props),
    Object.create(null),
  );
