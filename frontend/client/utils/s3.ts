export const uploadSignedPost = (file: Blob, s3Data: any) =>
  new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', s3Data.url);

    const postData = new FormData();
    for (const key in s3Data.fields) {
      if (s3Data.fields[key]) {
        postData.append(key, s3Data.fields[key]);
      }
    }
    postData.append('file', file);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 204) {
          res();
        } else {
          rej({ message: `S3 Upload Problem: ${xhr.statusText} (${xhr.status})` });
        }
      }
    };

    xhr.send(postData);
  });
