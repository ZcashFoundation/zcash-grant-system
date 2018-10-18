declare module "eth-sig-util" {
  export function recoverTypedSignature(msgParams: {
    data: any;
    sig: any;
  }): any;

  export function recoverTypedSignatureLegacy(msgParams: {
    data: any;
    sig: any;
  }): any;
}
