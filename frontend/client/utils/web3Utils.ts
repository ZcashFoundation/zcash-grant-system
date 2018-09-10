export async function collectArrayElements(method, account) {
  const arrayElements = [];
  let noError = true;
  let index = 0;
  while (noError) {
    try {
      arrayElements.push(await method(index).call({ from: account }));
      index += 1;
    } catch (e) {
      noError = false;
    }
  }
  return arrayElements;
}
