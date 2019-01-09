import Showdown from 'showdown';

const showdownConverter = new Showdown.Converter({
  simplifiedAutoLink: true,
  tables: true,
  strikethrough: true,
  disableForced4SpacesIndentedSublists: true,
  openLinksInNewWindow: true,
  excludeTrailingPunctuationFromURLs: true,
});

export const mdToHtml = (text: string) => {
  return showdownConverter.makeHtml(text);
};
