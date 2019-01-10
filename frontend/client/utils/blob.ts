export function getBase64(img: Blob | File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

export function dataUrlToBlob(dataUrl: string) {
  const base64ImageContent = dataUrl.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');
  const mimeSearch = dataUrl.match(/^data:([a-z]+\/[a-z]+)(;base64,)/);
  if (!mimeSearch || mimeSearch.length !== 3) {
    throw new Error(
      'dataUrlToBlob could not find mime type, or base64 was missing: ' +
        dataUrl.substring(0, 200),
    );
  } else {
    return base64ToBlob(base64ImageContent, mimeSearch[1]);
  }
}

export function base64ToBlob(base64: string, mime: string) {
  mime = mime || '';
  const sliceSize = 1024;
  const byteChars = window.atob(base64);
  const byteArrays = [];
  for (let offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: mime });
}
