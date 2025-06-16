<!--
  - This file is part of Solana Reference Stake Pool code.
  -
  - Copyright © 2021, mFactory GmbH
  -
  - Solana Reference Stake Pool is free software: you can redistribute it
  - and/or modify it under the terms of the GNU Affero General Public License
  - as published by the Free Software Foundation, either version 3
  - of the License, or (at your option) any later version.
  -
  - Solana Reference Stake Pool is distributed in the hope that it
  - will be useful, but WITHOUT ANY WARRANTY; without even the implied
  - warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  - See the GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.
  - If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
  -
  - You can be released from the requirements of the Affero GNU General Public License
  - by purchasing a commercial license. The purchase of such a license is
  - mandatory as soon as you develop commercial activities using the
  - Solana Reference Stake Pool code without disclosing the source code of
  - your own applications.
  -
  - The developer of this program can be contacted at <info@mfactory.ch>.
  -->

<script lang="ts" setup>
import { MIN_REMAINING_BALANCE, XSOL_LOGO, XSOL_NAME } from '~/config'
import {
  useBalanceStore,
  useStakeAccountStore,
  useStakePoolStore,
} from '~/store'
import { formatAmount, lamportsToSol } from '~/utils'
import xsolLogo from '~/assets/img/customize/xsol.svg'

const stakePoolStore = useStakePoolStore()
const { connected } = useClientWallet()
const balanceStore = useBalanceStore()
const stakeAccountStore = useStakeAccountStore()

const { depositFee, depositing, depositSol } = useDeposit()
const { withdrawFee, withdrawing, setAmount, withdraw, useWithdrawSol } = useWithdraw()

const solBalance = computed(() => balanceStore.solBalance)
const tokenBalance = computed(() => balanceStore.tokenBalance)
const fees = computed(() => stakePoolStore.fees)
const exchangeRate = computed(() => stakePoolStore.exchangeRate)
const connectionLost = computed(() => stakePoolStore.connectionLost)

const assetLogo = computed(() => XSOL_LOGO || xsolLogo)

const stake = reactive<{ from: any, to: any, factor: number }>({
  from: null,
  to: null,
  factor: 0,
})

const unstake = reactive<{ from: any, to: any }>({
  from: null,
  to: null,
})

const tabIndex = ref(0)
const unstakeFromInput = ref<any>(null)

const depositAmount = computed(() => {
  const sol = Number(stake.from)
  if (sol <= 0) {
    return 0
  }
  let value = (sol - lamportsToSol(depositFee.value)) * exchangeRate.value
  value -= value * fees.value.solDepositFee
  return value > 0 ? value : 0
})

const withdrawAmount = computed(() => {
  const sol = Number(unstake.from)
  if (sol <= 0) {
    return 0
  }
  let value = (sol - lamportsToSol(withdrawFee.value)) * (1 / exchangeRate.value)
  value
          -= value * (useWithdrawSol.value ? fees.value.solWithdrawalFee : fees.value.withdrawalFee)
  return value > 0 ? value : 0
})

watch(
  () => stake.from,
  () => {
    if (!stake.from) {
      stake.to = null
      return
    }
    stake.to = depositAmount.value > 0 ? depositAmount.value.toFixed(5) : 0
  },
)

watch(withdrawAmount, () => {
  if (!unstake.from) {
    unstake.to = null
    return
  }
  setAmount(unstake.from)
  unstake.to = withdrawAmount.value > 0 ? withdrawAmount.value.toFixed(5) : 0
})

const stakePercent = ref(0)
watch(stakePercent, () => {
  const value = solBalance.value * stakePercent.value
  stake.from = value ? formatAmount(value / 100) : value
})
const unstakePercent = ref(0)
watch(unstakePercent, () => {
  const value = tokenBalance.value * unstakePercent.value
  unstake.from = value ? formatAmount(value / 100) : value
})

const unstakeType = ref('')

const availableSol = computed(() => solBalance.value ? solBalance.value : '0')
const availableXsol = computed(() => tokenBalance.value ? tokenBalance.value : '0')
const solToXsolRate = computed(() =>
  exchangeRate.value === 1 ? 1 : formatAmount(exchangeRate.value),
)
const xSolToSolRate = computed(() =>
  exchangeRate.value === 1 ? 1 : formatAmount(1 / exchangeRate.value),
)

async function stakeHandler() {
  if (depositAmount.value <= 0) {
    const stakeInput = document.querySelector('.stake-from-input')?.querySelector('input') as HTMLElement
    stakeInput?.focus()
    return
  }
  await depositSol(stake.from)
  stake.from = 0
  stake.to = 0
}

async function unstakeHandler(forceDelayed = false) {
  if (withdrawAmount.value <= 0) {
    unstakeFromInput.value?.focus()
    return
  }
  unstakeType.value = forceDelayed ? 'delayed' : 'instant'
  await withdraw(forceDelayed)
  unstakeType.value = ''
  unstake.from = 0
  unstake.to = 0
  stakeAccountStore.load()
}

const stakeInfo = computed(() => {
  const from = stake.from
  const depositFeeVal = lamportsToSol(depositFee.value)
  const value = from ? (from - depositFeeVal) * exchangeRate.value : 0
  return {
    networkFee: `${depositFeeVal} SOL`,
    poolFee: `${formatAmount((value > 0 ? value : 0) * fees.value.solDepositFee)} ${XSOL_NAME}`,
  }
})

const unstakeInfo = computed(() => {
  const from = unstake.from
  const withdrawRealFee = fees.value.withdrawalFee
  const withdrawFeeVal = from * withdrawRealFee
  return {
    networkFee: `${lamportsToSol(withdrawFee.value)} SOL`,
    poolFee: `${formatAmount(withdrawFeeVal)} ${XSOL_NAME}`,
  }
})

const unstakeNowInfo = computed(() => {
  const from = unstake.from
  const withdrawRealFee = fees.value.solWithdrawalFee
  const withdrawFeeVal = from * withdrawRealFee
  return {
    networkFee: `${lamportsToSol(withdrawFee.value)} SOL`,
    poolFee: `${formatAmount(withdrawFeeVal)} ${XSOL_NAME}`,
  }
})
</script>

<template>
  <div class="stake-box card">
    <BTabs
      v-model="tabIndex"
      pills
      card
    >
      <BTab
        active
      >
        <template #title>
          STAKE
          <apy-badge :selected="tabIndex === 0" />
        </template>
        <BCardText>
          <div class="top-section">
            <div class="row justify-content-between align-items-end">
              <div class="col-6">
                <div class="stake-box__title">
                  Available {{ availableSol
                  }}
                </div>
              </div>
              <div class="col-6">
                <div class="stake-box__rate">
                  <span class="text-dark">1</span>
                  <span> SOL</span>
                  <span class="q-px-sm">≈</span>
                  <span class="text-dark">{{ solToXsolRate }}</span>
                  <span>&nbsp;{{ XSOL_NAME }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="with-arrow">
            <input-widget
              v-model="stake.from"
              class="stake-from-input"
              placeholder="0.0"
              :balance="solBalance"
              :fee="MIN_REMAINING_BALANCE"
              only-number
              :rules="[
                (val: number) => !connected || (val && Number(solBalance) >= Number(val)) || 'Insufficient funds to run the transaction',
              ]"
            >
              <template #append />
            </input-widget>
          </div>

          <div class="stake-to-input">
            <input-widget
              v-model="stake.to"
              class="mb-3"
              placeholder="0.0"
              :balance="solBalance"
              only-number
              disabled
              :icon="assetLogo"
              :asset="XSOL_NAME"
            />
          </div>
          <div class="row justify-content-between">
            <div class="d-flex flex-column col-12 col-sm-6 align-items-start">
              <div class="stake-box__stake-info">
                Network Fee: {{ stakeInfo.networkFee }}
              </div>
              <div class="stake-box__stake-info">
                Pool Fee: {{ stakeInfo.poolFee }}
              </div>
            </div>
            <div class="col-12 col-sm-6 stake-box__action">
              <j-btn
                v-if="connected"
                :loading="depositing"
                class="stake-box__btn"
                variant="primary"
                pill
                size="lg"
                :disable="connectionLost || Number(stake.from) > Number(availableSol)"
                @click="stakeHandler"
              >
                STAKE NOW
              </j-btn>
              <connect-wallet v-else />
            </div>
          </div>
        </BCardText>
      </BTab>
      <BTab title="UNSTAKE">
        <BCardText>
          <div class="top-section">
            <div class="row justify-content-between align-items-end">
              <div class="col-6">
                <div class="stake-box__title">
                  Available {{ availableXsol
                  }}<span
                    v-if="connected && Number(unstake.from) > Number(availableXsol)"
                    class="stake-box__warning gt-xs"
                  >Insufficient funds to run the transaction</span>
                </div>
              </div>
              <div class="col-6">
                <div class="stake-box__rate">
                  <span class="text-dark">1</span>
                  <span> {{ XSOL_NAME }}</span>
                  <span class="q-px-sm">≈</span>
                  <span class="text-dark">{{ xSolToSolRate }}</span>
                  <span> SOL</span>
                </div>
              </div>
            </div>
          </div>

          <div class="with-arrow">
            <input-widget
              v-model="unstake.from"
              class="stake-from-input"
              placeholder="0.0"
              :balance="tokenBalance"
              only-number
              :asset="XSOL_NAME"
              :icon="assetLogo"
              :rules="[
                (val: number) => !connected || (val && Number(tokenBalance) >= Number(val)) || 'Insufficient funds to run the transaction',
              ]"
            >
              <template #append />
            </input-widget>
          </div>

          <div class="stake-to-input">
            <input-widget
              v-model="unstake.to"
              class="mb-3"
              placeholder="0.0"
              :balance="tokenBalance"
              only-number
              disabled
            />
          </div>

          <div class="row justify-content-between">
            <div class="d-flex flex-column col-12 col-sm-6 align-items-start justify-content-center">
              <div class="stake-box__stake-info">
                Pool Fee: {{ unstakeNowInfo.poolFee }}
              </div>
              <div class="stake-box__stake-info">
                Network Fee: {{ unstakeNowInfo.networkFee }}
              </div>
            </div>

            <div class="col-12 col-sm-6 stake-box__action">
              <j-btn
                v-if="connected"
                :loading="withdrawing && unstakeType === 'instant'"
                class="stake-box__btn"
                variant="primary"
                pill
                size="lg"
                :disable="connectionLost || Number(unstake.from) > Number(availableXsol) || unstakeType === 'delayed' || !useWithdrawSol"
                @click="unstakeHandler(false)"
              >
                <div>UNSTAKE NOW</div>
              </j-btn>
              <connect-wallet v-else />
            </div>
          </div>
          <div v-if="connected" class="row justify-content-between mt-3">
            <div class="d-flex flex-column col-12 col-sm-6 align-items-start justify-content-center">
              <div class="stake-box__stake-info">
                Pool Fee: {{ unstakeInfo.poolFee }}
              </div>
              <div class="stake-box__stake-info">
                Network Fee: {{ unstakeInfo.networkFee }}
              </div>
            </div>
            <div class="col-12 col-sm-6 stake-box__action">
              <j-btn
                :loading="withdrawing && unstakeType === 'delayed'"
                class="stake-box__btn"
                variant="primary"
                pill
                size="lg"
                text-color="primary-gray"
                :disable="connectionLost || Number(unstake.from) > Number(availableXsol) || unstakeType === 'instant'"
                @click="unstakeHandler(true)"
              >
                <div>UNSTAKE DELAYED</div>
              </j-btn>
            </div>
          </div>
        </BCardText>
      </BTab>
    </BTabs>
  </div>
</template>
