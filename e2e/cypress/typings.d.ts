declare module "*.json" {
  const value: any;
  export default value;
}

declare module "eth-sig-util" {
  export function signTypedData(k: any, d: any): string;
}
