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

import {Buffer} from 'buffer';
import * as BufferLayout from '@solana/buffer-layout';

/**
 * Layout for a public key
 */
export const publicKey = (
  property = 'publicKey',
): BufferLayout.Layout => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = 'uint64'): BufferLayout.Layout => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property,
  );
  const _decode = rsl.decode.bind(rsl);
  const _encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer: any, offset: any) => {
    const data = _decode(buffer, offset);
    return data['chars'].toString('utf8');
  };

  rsl.encode = (str: any, buffer: any, offset: any) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    };
    return _encode(data, buffer, offset);
  };

  (rsl as any).alloc = (str: any) => {
    return (
      BufferLayout.u32().span +
      BufferLayout.u32().span +
      Buffer.from(str, 'utf8').length
    );
  };

  return rsl;
};

/**
 * Layout for an Authorized object
 */
export const authorized = (property = 'authorized') => {
  return BufferLayout.struct(
    [publicKey('staker'), publicKey('withdrawer')],
    property,
  );
};

/**
 * Layout for a Lockup object
 */
export const lockup = (property = 'lockup') => {
  return BufferLayout.struct(
    [
      BufferLayout.ns64('unixTimestamp'),
      BufferLayout.ns64('epoch'),
      publicKey('custodian'),
    ],
    property,
  );
};

export function getAlloc(type: any, fields: any): number {
  let alloc = 0;
  type.layout.fields.forEach((item: any) => {
    if (item.span >= 0) {
      alloc += item.span;
    } else if (typeof item.alloc === 'function') {
      alloc += item.alloc(fields[item.property]);
    }
  });
  return alloc;
}
