/* This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2021, mFactory GmbH
 *
 * Solana Reference Stake Pool is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Solana Reference Stake Pool is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Solana Reference Stake Pool code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@mfactory.ch>.
 */

export function isInt(n: string | number): boolean {
  return Number(n) === n && n % 1 === 0;
}

export function isInvalidFloat(n: string | number): boolean {
  return isNaN(Number(n));
}

export function isInvalidTime(n: string, p: string): boolean {
  const num = Number(n);
  if (!isInt(num) || isInvalidFloat(num)) return true;
  let max = 12;
  if (p == 'Year') max = 20;
  else if (p == 'Epoch') max = 365;

  return num < 1 || num > max;

}

export function formatMoney(val: string | number, decimals: number = 2): string {
  if (typeof val === 'undefined' || val === null || val === '') {
    return val;
  }

  val = val.toString();

  const decimalSeparator = val.lastIndexOf('.');

  let integerPart =
    decimalSeparator >= 0 ? val.slice(0, decimalSeparator) : val;
  let fractionalPart =
    decimalSeparator >= 0 ? val.slice(decimalSeparator + 1) : null;

  if (fractionalPart) {
    fractionalPart = fractionalPart.slice(0, 2).replace(/[^0-9]+/g, '');
    if (fractionalPart.length === 1) fractionalPart += '0';
  } else if (!fractionalPart) fractionalPart = '00';

  integerPart = integerPart.replace(/[^0-9]+/g, '');
  if (!integerPart) {
    integerPart = '0';
  }

  let formatted = '';
  for (let i = 0; i < integerPart.length; i++) {
    if (i !== 0 && i % 3 === 0) {
      formatted = integerPart[integerPart.length - i - 1] + ',' + formatted;
    } else {
      formatted = integerPart[integerPart.length - i - 1] + formatted;
    }
  }

  formatted += '.' + fractionalPart;

  return formatted;
}
