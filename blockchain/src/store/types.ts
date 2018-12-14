enum ACTION_TYPE {
  GENERATE_ADDRESSES = 'GENERATE_ADDRESSES',
  ADD_DISCLOSURE = 'ADD_DISCLOSURE',
}

export default ACTION_TYPE;

export interface AddressCollection {
  transparent: string;
  sprout: string;
}
