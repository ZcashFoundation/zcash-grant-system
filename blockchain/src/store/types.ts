enum ACTION_TYPE {
  GENERATE_ADDRESSES = 'GENERATE_ADDRESSES',
  ADD_PAYMENT_DISCLOSURE = 'ADD_PAYMENT_DISCLOSURE',
  CONFIRM_PAYMENT_DISCLOSURE = 'CONFIRM_PAYMENT_DISCLOSURE',
}

export default ACTION_TYPE;

export interface AddressCollection {
  transparent: string;
  sprout: string;
}
