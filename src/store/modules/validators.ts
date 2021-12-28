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

import { ref } from 'vue';
import { storeToRefs, defineStore } from 'pinia';
import {
  PublicKey,
  Connection,
  ValidatorInfo,
  ParsedAccountData,
} from '@solana/web3.js';
import {
  findWithdrawAuthorityProgramAddress,
  getStakeAccountsByWithdrawAuthority,
} from '@/utils/spl/utils';
import { StakePoolProgram } from '@/utils/spl/stakepool-program';
import { useConnection } from '@/store';
import { VALIDATORS_LIMIT } from '@/config';
import { shortenAddress } from '@/utils';

export interface ValidatorData {
  id: string,
  lamports: number,
  name: string,
  details: string | undefined,
  website: string | undefined,
  keybaseUsername: string | undefined,
  url: string | undefined,
  image: string | undefined
}

export const useValidators = defineStore('validators', () => {
  const { connection, cluster, stakePoolAddress } = storeToRefs(useConnection());
  const loading = ref(false);
  const data = ref<ValidatorData[]>([]);
  const voteIds = ref<string[]>([]);

  const load = async () => {
    loading.value = true;

    const stakeAccounts = await getStakeAccounts(connection.value, stakePoolAddress.value!);

    const accountStakeMap = stakeAccounts
    .reduce((map, acc) => {
      const id = (acc.account.data as ParsedAccountData).parsed?.info?.stake?.delegation?.voter;
      if (id) {
        if (!map[id]) {
          map[id] = 0;
        }
        map[id] += acc.account.lamports;
      }
      return map;
    }, {} as { [key: string]: number }) ?? {};

    voteIds.value = Object.keys(accountStakeMap);

    const [voteAccountStatus, validatorInfos] = await Promise.all([
      connection.value.getVoteAccounts(),
      getValidatorInfos(connection.value),
    ]);

    const delinquent = voteAccountStatus.delinquent.filter((acc) => voteIds.value.includes(acc.votePubkey));
    const current = voteAccountStatus.current.filter((acc) => voteIds.value.includes(acc.votePubkey));
    const voteAccountInfos = [
      ...delinquent,
      ...current,
    ];

    const items: ValidatorData[] = [];
    for (const voteAccountInfo of voteAccountInfos) {
      const validatorInfo = validatorInfos.find(info => info.key.equals(
        new PublicKey(voteAccountInfo.nodePubkey),
      ));
      const pubKey = voteAccountInfo.nodePubkey;
      const lamports = accountStakeMap[voteAccountInfo.votePubkey];
      const network = cluster.value.replace('-beta', '');
      items.push({
        id: pubKey,
        name: validatorInfo?.info?.name ?? shortenAddress(pubKey),
        details: validatorInfo?.info?.details,
        website: validatorInfo?.info?.website,
        keybaseUsername: validatorInfo?.info?.keybaseUsername,
        image: validatorInfo?.info?.keybaseUsername ?
          `https://keybase.io/${validatorInfo.info.keybaseUsername}/picture` :
          undefined,
        url: `https://www.validators.app/validators/${network}/${pubKey}`,
        lamports,
      });
    }

    data.value = items
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => b.lamports - a.lamports);
    loading.value = false;
  };

  return {
    loading,
    data,
    voteIds,
    load,
    clear: () => data.value = [],
  };
});

const CONFIG_PROGRAM_ID = new PublicKey('Config1111111111111111111111111111111111111');

async function getStakeAccounts(
  connection: Connection, stakePoolAddress: PublicKey) {
  const poolWithdrawAuthority = await findWithdrawAuthorityProgramAddress(
    StakePoolProgram.programId,
    stakePoolAddress,
  );
  const items = await getStakeAccountsByWithdrawAuthority(
    connection,
    poolWithdrawAuthority,
  );

  return items
  .sort((a, b) => b.account.lamports - a.account.lamports)
  .slice(0, VALIDATORS_LIMIT);
}

async function getValidatorInfos(connection: Connection) {
  const validatorInfoAccounts = await connection.getProgramAccounts(CONFIG_PROGRAM_ID);
  return validatorInfoAccounts.flatMap(validatorInfoAccount => {
    const validatorInfo = ValidatorInfo.fromConfigData(validatorInfoAccount.account.data);
    return validatorInfo ? [validatorInfo] : [];
  });
}
