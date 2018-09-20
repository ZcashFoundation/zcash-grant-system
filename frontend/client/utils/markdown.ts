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
    // TODO: Find a way to disable images
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

// TODO: Find a better place for this?
export const markdownStyles = `
  line-height: 1.7;
  font-family: 'Nunito Sans', 'Helvetica Neue', Arial, sans-serif;

  h1, h2, h3, h4, h5, h6 {
    display: block;
    font-weight: bold;
    margin-top: 0;
  }

  h1 {
    font-size: 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  h2 {
    font-size: 1.8rem;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  h3 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }
  h4 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  h5 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  h6 {
    font-size: 1.1rem;
    margin-bottom: 0rem;
  }

  ul,
  ol {
    padding-left: 30px;
    font-size: 1.05rem;
  }

  ul {
    list-style: circle;
  }

  ol {
    list-style: decimal;
  }

  dl {
    dt {
      text-decoration: underline;
    }

    dd {
      padding-left: 1rem;
      margin-bottom: 1rem;
    }
  }

  img {
    max-width: 100%;
  }

  hr {
    margin: 3rem 0;
    border-bottom: 2px solid #EEE;
  }

  code, pre {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }

  code {
    padding: 0.2rem 0.25rem;
    margin: 0;
    font-size: 90%;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 2px;

    &:before, &:after {
      display: none;
    }
  }

  pre {
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    font-size: 1rem;

    code {
      padding: 0;
      font-size: inherit;
      background: none;
      border: none;
      border-radius: 0;
    }
  }

  table {
    display: block;
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 2rem;

    th, td {
      padding: 0.5rem 1rem;
      border: 1px solid #DDD;
    }

    th {
      font-size: 1.1rem;
      font-weight: bold;
    }

    td {
      font-size: 1rem;
    }
  }

  blockquote {
    margin: 0 0 1rem;
    padding: 0 0 0 0.5rem;
    color: #777;
    border-left: 4px solid rgba(0, 0, 0, 0.08);

    > :last-child {
      margin: 0;
    }
  }
`;
