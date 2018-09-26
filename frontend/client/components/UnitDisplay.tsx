// Adapted from https://github.com/MyCryptoHQ/MyCrypto/blob/develop/common/components/ui/UnitDisplay.tsx
import React from 'react';
import {
  fromTokenBase,
  getDecimalFromEtherUnit,
  UnitKey,
  Wei,
  TokenValue,
} from 'utils/units';
import { formatNumber } from 'utils/formatters';

interface Props {
  /**
   * @description base value of the token / ether, incase of waiting for API calls, we can return '???'
   * @type {TokenValue | Wei}
   * @memberof Props
   */
  value?: TokenValue | Wei | null;
  /**
   * @description Symbol to display to the right of the value, such as 'ETH'
   * @type {string}
   * @memberof Props
   */
  symbol?: string | null;
  /**
   * @description display the long balance, if false, trims it to 3 decimal places, if a number is specified then that number is the number of digits to be displayed.
   * @type {boolean}
   * @memberof Props
   */
  displayShortBalance?: boolean | number;
  displayTrailingZeroes?: boolean;
  checkOffline?: boolean;
}

interface EthProps extends Props {
  unit?: UnitKey;
}
interface TokenProps extends Props {
  decimal: number;
}

const isTokenUnit = (param: EthProps | TokenProps): param is TokenProps =>
  !!(param as TokenProps).decimal;

const UnitDisplay: React.SFC<EthProps | TokenProps> = params => {
  const { value, symbol, displayShortBalance, displayTrailingZeroes } = params;

  const convertedValue = isTokenUnit(params)
    ? fromTokenBase(value, params.decimal)
    : fromTokenBase(value, getDecimalFromEtherUnit(params.unit || 'ether'));

  let formattedValue;

  if (displayShortBalance) {
    const digits = typeof displayShortBalance === 'number' ? displayShortBalance : 4;
    formattedValue = formatNumber(convertedValue, digits);
    // If the formatted value was too low, display something like < 0.01
    if (parseFloat(formattedValue) === 0 && parseFloat(convertedValue) !== 0) {
      const padding = digits !== 0 ? `.${'0'.repeat(digits - 1)}1` : '';
      formattedValue = `< 0${padding}`;
    } else if (displayTrailingZeroes) {
      const [whole, deci] = formattedValue.split('.');
      formattedValue = `${whole}.${(deci || '').padEnd(digits, '0')}`;
    }
  } else {
    formattedValue = convertedValue;
  }

  return (
    <span>
      {formattedValue}
      <span>
        {symbol ? (
          <>
            &nbsp;
            {symbol}
          </>
        ) : (
          ''
        )}
      </span>
    </span>
  );
};

export default UnitDisplay;
