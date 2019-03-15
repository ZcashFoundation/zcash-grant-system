import Showdown from 'showdown';
import xss from 'xss';

export enum MARKDOWN_TYPE {
  FULL = 'FULL',
  REDUCED = 'REDUCED',
}

// See https://www.npmjs.com/package/showdown#valid-options for details
const sharedOptions = {
  simplifiedAutoLink: true,
  tables: true,
  strikethrough: true,
  disableForced4SpacesIndentedSublists: true,
  openLinksInNewWindow: true,
  excludeTrailingPunctuationFromURLs: true,
};

const converters: { [key in MARKDOWN_TYPE]: Showdown.Converter } = {
  [MARKDOWN_TYPE.FULL]: new Showdown.Converter({
    ...sharedOptions,
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    headerLevelStart: 2,
  }),
  [MARKDOWN_TYPE.REDUCED]: new Showdown.Converter({
    ...sharedOptions,
    noHeaderId: true,
    headerLevelStart: 4,
  }),
};

type SanitizeMethod = (md: string) => string;
const sanitizers: { [key in MARKDOWN_TYPE]: SanitizeMethod } = {
  // Default whitelist
  [MARKDOWN_TYPE.FULL]: md => xss(md),
  // Limited tags & attributes
  [MARKDOWN_TYPE.REDUCED]: md =>
    xss(md, {
      stripIgnoreTag: true,
      whiteList: {
        a: ['target', 'href', 'title'],
        b: [],
        blockquote: [],
        br: [],
        code: [],
        del: [],
        em: [],
        h4: [],
        h5: [],
        h6: [],
        hr: [],
        i: [],
        li: [],
        ol: [],
        p: [],
        pre: [],
        small: [],
        sub: [],
        sup: [],
        strong: [],
        table: ['width', 'border', 'align', 'valign'],
        tbody: ['align', 'valign'],
        td: ['width', 'rowspan', 'colspan', 'align', 'valign'],
        tfoot: ['align', 'valign'],
        th: ['width', 'rowspan', 'colspan', 'align', 'valign'],
        thead: ['align', 'valign'],
        tr: ['rowspan', 'align', 'valign'],
        ul: [],
      },
    }),
};

export function sanitize(html: string, type: MARKDOWN_TYPE = MARKDOWN_TYPE.FULL): string {
  return sanitizers[type](html);
}

export function convert(
  markdown: string,
  type: MARKDOWN_TYPE = MARKDOWN_TYPE.FULL,
): string {
  const html = converters[type].makeHtml(markdown);
  return sanitize(html, type);
}
