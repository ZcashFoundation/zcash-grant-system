import Showdown from 'showdown';
import xss from 'xss';

const showdownConverter = new Showdown.Converter({
  simplifiedAutoLink: true,
  tables: true,
  strikethrough: true,
  disableForced4SpacesIndentedSublists: true,
  openLinksInNewWindow: true,
  excludeTrailingPunctuationFromURLs: true,
});

export const mdToHtml = (text: string, reduced: boolean = false) => {
  const html = showdownConverter.makeHtml(text);
  return reduced ? xss(html, reducedXssOpts) : xss(html);
};

const reducedXssOpts = {
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
};
