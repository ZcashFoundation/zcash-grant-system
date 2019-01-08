// Adapted from https://github.com/MyCryptoHQ/MyCrypto/blob/develop/common/components/ui/UnitDisplay.tsx
import React from 'react';
import {
  baseToConvertedUnit,
  getDecimalFromUnitKey,
  UnitKey,
  Zat,
} from 'utils/units';
import { formatNumber } from 'utils/formatters';

interface Props {
  /**
   * @description base value of the unit
   * @type {Zat}
   * @memberof Props
   */
  value: Zat;
  /**
   * @description Name of the unit to display, defaults to 'zcash'
   * @type {UnitKey}
   * @memberof Props
   */
  unit?: UnitKey;
  /**
   * @description Symbol to display to the right of the value, such as 'ZEC'
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

const UnitDisplay: React.SFC<Props> = params => {
  const { value, symbol, displayShortBalance, displayTrailingZeroes } = params;

  const convertedValue = baseToConvertedUnit(
    value.toString(),
    getDecimalFromUnitKey(params.unit || 'zcash'),
  );

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
