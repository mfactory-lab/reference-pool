/*
 * This file is part of Solana Reference Stake Pool code.
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

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Connection, ParsedAccountData } from '@solana/web3.js'
import { PublicKey, ValidatorInfo } from '@solana/web3.js'
import { findWithdrawAuthorityProgramAddress } from '@solana/spl-stake-pool/src/utils'
import { STAKE_POOL_PROGRAM_ID } from '@solana/spl-stake-pool/src'
import { getStakeAccountsByWithdrawAuthority, shortenAddress } from '@/utils'
import { useConnectionStore } from '@/store'
import { VALIDATORS_RELOAD_INTERVAL } from '@/config'

const CONFIG_PROGRAM_ID = new PublicKey('Config1111111111111111111111111111111111111')

export interface ValidatorData {
  id: string
  voter: string
  lamports: number
  name: string
  details: string | undefined
  website: string | undefined
  keybaseUsername: string | undefined
  url: string | undefined
  image: string | undefined
}

export const useValidatorStore = defineStore('validators', () => {
  const connectionStore = useConnectionStore()
  const loading = ref<boolean>(false)
  const data = ref<ValidatorData[]>([])
  const voteIds = ref<string[]>([])

  const load = async (force = false) => {
    if (loading.value && !force) {
      return
    }
    loading.value = true

    console.log('[Validators] Loading stake accounts...')
    const stakeAccounts = await getStakeAccounts(
      connectionStore.connection,
      connectionStore.stakePoolAddress!,
    )

    console.log('[Validators] StakeAccounts')
    console.log(stakeAccounts.map(acc => acc.pubkey.toBase58()).join('\n'))

    const accountStakeMap
      = stakeAccounts.reduce((map, acc) => {
        const id = (acc.account.data as ParsedAccountData).parsed?.info?.stake?.delegation?.voter
        if (id) {
          if (!map[id]) {
            map[id] = 0
          }
          map[id] += acc.account.lamports
        }
        return map
      }, {} as Record<string, number>) ?? {}

    voteIds.value = Object.keys(accountStakeMap)

    console.log('[Validators] Vote ids', voteIds.value)

    const [voteAccountStatus, validatorInfos] = await Promise.all([
      connectionStore.connection.getVoteAccounts(),
      getValidatorInfos(connectionStore.connection),
    ])

    // const voteAccountStatus = await connection.value.getVoteAccounts();
    const delinquent = voteAccountStatus.delinquent.filter(acc =>
      voteIds.value.includes(acc.votePubkey),
    )
    const current = voteAccountStatus.current.filter(acc =>
      voteIds.value.includes(acc.votePubkey),
    )
    const voteAccountInfos = [...delinquent, ...current]

    console.log('[Validators] voteAccountInfos:', voteAccountInfos.length)
    console.log('[Validators] validatorInfos:', validatorInfos.length)

    // const validatorInfos = await getValidatorInfos(connection.value);

    const items: ValidatorData[] = []
    for (const voteAccountInfo of voteAccountInfos) {
      const validatorInfo = validatorInfos.find(info =>
        info.key.equals(new PublicKey(voteAccountInfo.nodePubkey)),
      )

      const pubKey = voteAccountInfo.nodePubkey
      const lamports = accountStakeMap[voteAccountInfo.votePubkey] ?? 0
      const network = connectionStore.cluster.replace('-beta', '')

      items.push({
        id: pubKey,
        voter: voteAccountInfo.votePubkey,
        name: validatorInfo?.info?.name ?? shortenAddress(pubKey),
        details: validatorInfo?.info?.details,
        website: validatorInfo?.info?.website,
        keybaseUsername: validatorInfo?.info?.keybaseUsername,
        image: validatorInfo?.info?.keybaseUsername
          ? `https://keybase.io/${validatorInfo.info.keybaseUsername}/picture`
          : undefined,
        url: `https://www.validators.app/validators/${network}/${pubKey}`,
        lamports,
      })
    }

    data.value = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => b.lamports - a.lamports)

    loading.value = false
  }

  const cluster = computed(() => connectionStore.cluster)

  watch(cluster, () => {
    load(true)
  }, { immediate: true })

  setInterval(() => {
    load()
  }, VALIDATORS_RELOAD_INTERVAL)

  return {
    loading,
    data,
    voteIds,
    load,
    clear: () => (data.value = []),
  }
})

async function getStakeAccounts(connection: Connection, stakePoolAddress: PublicKey) {
  const poolWithdrawAuthority = await findWithdrawAuthorityProgramAddress(
    STAKE_POOL_PROGRAM_ID,
    stakePoolAddress,
  )
  const items = await getStakeAccountsByWithdrawAuthority(
    connection,
    poolWithdrawAuthority,
  )
  return items.sort((a, b) => b.account.lamports - a.account.lamports)
  // .slice(0, VALIDATORS_LIMIT)
}

async function getValidatorInfos(connection: Connection) {
  const validatorInfoAccounts = await connection.getProgramAccounts(CONFIG_PROGRAM_ID)
  return validatorInfoAccounts.flatMap((validatorInfoAccount) => {
    const validatorInfo = ValidatorInfo.fromConfigData(validatorInfoAccount.account.data)
    return validatorInfo ? [validatorInfo] : []
  })
}
