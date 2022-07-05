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

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import {
  useApyStore,
  useBalanceStore,
  useConnectionStore,
  useStakeAccountStore,
  useStakePoolStore,
} from '@/store'
import { formatAmount, formatPct, lamportsToSol } from '@/utils'
import { useDeposit, useWithdraw } from '@/hooks'
import { clickOutside } from '@/directives'
import { XSOL_NAME } from '@/config'

export default defineComponent({
  directives: {
    clickOutside,
  },
  setup() {
    const { notify } = useQuasar()
    const stakePoolStore = useStakePoolStore()
    const connectionStore = useConnectionStore()
    const { connected } = useWallet()
    const balanceStore = useBalanceStore()
    const stakeAccountStore = useStakeAccountStore()

    const { depositFee, depositing, depositSol } = useDeposit()
    const { withdrawFee, withdrawing, setAmount, withdraw, useWithdrawSol } = useWithdraw()
    const apyStore = useApyStore()
    const apy = computed(() => apyStore.apy)

    const cluster = computed(() => connectionStore.cluster)
    const solBalance = computed(() => balanceStore.solBalance)
    const tokenBalance = computed(() => balanceStore.tokenBalance)
    const fees = computed(() => stakePoolStore.fees)
    const exchangeRate = computed(() => stakePoolStore.exchangeRate)
    const connectionLost = computed(() => stakePoolStore.connectionLost)

    const stake = reactive<{ from: any; to: any; factor: number }>({
      from: null,
      to: null,
      factor: 0,
    })

    const unstake = reactive<{ from: any; to: any }>({
      from: null,
      to: null,
    })

    const tab = ref('stake')
    const stakeFromInput = ref<any>(null)
    const unstakeFromInput = ref<any>(null)

    onMounted(() => {
      nextTick(() => {
        if (stakeFromInput.value) {
          stakeFromInput.value.focus()
        }
      })
    })

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

    const highlightFix = ref(true)
    const unstakeType = ref('')

    return {
      XSOL_NAME,
      tab,
      stake,
      unstake,
      cluster,
      connected,
      depositing,
      withdrawing,
      unstakeType,
      stakeFromInput,
      unstakeFromInput,
      stakePercent,
      unstakePercent,
      connectionLost,
      useWithdrawSol,
      apy: computed(() => formatPct.format(apy.value)),
      availableSol: computed(() => solBalance.value ? solBalance.value : '0'),
      availableXsol: computed(() => tokenBalance.value ? tokenBalance.value : '0'),
      solDepositFee: computed(() => fees?.value.solDepositFee),
      withdrawalFee: computed(() => fees?.value.withdrawalFee),
      solToXsolRate: computed(() =>
        exchangeRate.value === 1 ? 1 : formatAmount(exchangeRate.value),
      ),
      xSolToSolRate: computed(() =>
        exchangeRate.value === 1 ? 1 : formatAmount(1 / exchangeRate.value),
      ),

      stakeMax() {
        if (!connected.value) {
          notify({
            message: 'Wallet is not connected',
            caption: 'Please connect your wallet',
          })
          return
        }
        stake.from = solBalance.value
      },

      unstakeMax() {
        if (!connected.value) {
          notify({
            message: 'Wallet is not connected',
            caption: 'Please connect your wallet',
          })
          return
        }
        unstake.from = tokenBalance.value
      },

      stakeHandler: async () => {
        if (depositAmount.value <= 0) {
          stakeFromInput.value?.focus()
          return
        }
        await depositSol(stake.from - lamportsToSol(depositFee.value))
        stake.from = 0
        stake.to = 0
      },

      unstakeHandler: async (forceDelayed = false) => {
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
      },

      formatPct(v: number) {
        return formatPct.format(v)
      },

      onlyNumber(e: any) {
        const keyCode = e.keyCode ? e.keyCode : e.which
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
          e.preventDefault()
        }
        if (keyCode === 46 && String(e.target.value).includes('.')) {
          e.preventDefault()
        }
      },

      stakeInfo: computed(() => {
        const from = stake.from
        const depositFeeVal = lamportsToSol(depositFee.value)
        const value = from ? (from - depositFeeVal) * exchangeRate.value : 0
        return {
          networkFee: `${depositFeeVal} SOL`,
          poolFee: `${formatAmount((value > 0 ? value : 0) * fees.value.solDepositFee)} ${XSOL_NAME}`,
        }
      }),

      unstakeInfo: computed(() => {
        const from = unstake.from
        const withdrawRealFee = fees.value.withdrawalFee
        const withdrawFeeVal = from * withdrawRealFee
        return {
          networkFee: `${lamportsToSol(withdrawFee.value)} SOL`,
          poolFee: `${formatAmount(withdrawFeeVal)} ${XSOL_NAME}`,
        }
      }),

      unstakeNowInfo: computed(() => {
        const from = unstake.from
        const withdrawRealFee = fees.value.solWithdrawalFee
        const withdrawFeeVal = from * withdrawRealFee
        return {
          networkFee: `${lamportsToSol(withdrawFee.value)} SOL`,
          poolFee: `${formatAmount(withdrawFeeVal)} ${XSOL_NAME}`,
        }
      }),

      highlightFix,
      onFocus() {
        highlightFix.value = true
      },
      onBlur() {
        highlightFix.value = false
      },
    }
  },
})
</script>

<template>
  <q-card class="stake-box shadow-sm">
    <apy :selected="tab === 'stake'" @click="() => (tab = 'stake')" />
    <q-tabs
      v-model="tab"
      align="justify"
      indicator-color="transparent"
      active-bg-color="primary-gray"
    >
      <q-tab :ripple="false" label="STAKE" name="stake" :disable="connectionLost" />
      <q-tab :ripple="false" label="UNSTAKE" name="unstake" :disable="connectionLost" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="stake">
        <q-card-section class="top-section">
          <div class="row justify-center">
            <div class="col">
              <div class="stake-box__title">
                Available {{ availableSol
                }}<span
                  v-if="connected && Number(stake.from) > Number(availableSol)"
                  class="stake-box__warning gt-xs"
                >Insufficient funds to run the transaction</span>
              </div>
            </div>
            <div>
              <div class="stake-box__rate">
                <span class="text-dark">1</span>
                <span> SOL</span>
                <span class="q-px-sm">≈</span>
                <span class="text-dark">{{ solToXsolRate }}</span>
                <span>&nbsp;{{ XSOL_NAME }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="connected && Number(stake.from) > Number(availableSol)"
            class="stake-box__warning lt-sm"
          >
            Insufficient funds to run the transaction
          </div>
        </q-card-section>

        <q-card-section class="with-arrow">
          <q-input
            ref="stakeFromInput"
            v-model="stake.from"
            v-click-outside="onBlur"
            :maxlength="14"
            label="Amount to stake"
            class="stake-box__input"
            :class="{ 'stake-box__input--highlight-fix': highlightFix }"
            outlined
            placeholder="0.0"
            stack-label
            :readonly="connectionLost"
            @focus="onFocus"
            @keypress="onlyNumber"
          >
            <template #append>
              <q-btn
                dense
                color="natural-light-gray"
                text-color="primary-gray"
                unelevated
                size="14px"
                padding="2px 8px 1px 8px"
                @click="stakeMax"
              >
                MAX
              </q-btn>
              <img alt="" class="stake-field__icon" src="@/assets/img/sol-logo.svg">
              <span class="stake-field__symbol">SOL</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="stake-to-input">
          <q-input
            v-model="stake.to"
            :label="XSOL_NAME"
            outlined
            placeholder="0.0"
            class="stake-box__input-to"
            readonly
            stack-label
            bg-color="transparent"
            @keypress="onlyNumber"
          >
            <template #append>
              <token-svg class="stake-field__icon" />
              <span class="stake-field__symbol">{{ XSOL_NAME }}</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section>
          <div class="row items-between">
            <div class="column col-sm-6 col-xs-12 q-pr-sm">
              <div class="stake-box__stake-info">
                Network Fee: {{ stakeInfo.networkFee }}
              </div>
              <div class="stake-box__stake-info">
                Pool Fee: {{ stakeInfo.poolFee }}
              </div>
            </div>
            <div class="column justify-between col-sm-6 col-xs-12 q-pl-sm">
              <q-btn
                v-if="connected"
                :loading="depositing"
                class="stake-box__btn"
                color="primary"
                rounded
                size="lg"
                text-color="primary-gray"
                :disable="connectionLost || Number(stake.from) > Number(availableSol)"
                @click="stakeHandler"
              >
                STAKE NOW
              </q-btn>
              <div v-else class="text-right">
                <connect-wallet />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-tab-panel>

      <q-tab-panel name="unstake">
        <q-card-section class="top-section">
          <div class="row justify-center">
            <div class="col">
              <div class="stake-box__title">
                Available {{ availableXsol
                }}<span
                  v-if="connected && Number(unstake.from) > Number(availableXsol)"
                  class="stake-box__warning gt-xs"
                >Insufficient funds to run the transaction</span>
              </div>
            </div>
            <div>
              <div class="stake-box__rate">
                <span class="text-dark">1</span>
                <span> {{ XSOL_NAME }}</span>
                <span class="q-px-sm">≈</span>
                <span class="text-dark">{{ xSolToSolRate }}</span>
                <span> SOL</span>
              </div>
            </div>
          </div>
          <div
            v-if="connected && Number(unstake.from) > Number(availableXsol)"
            class="stake-box__warning lt-sm"
          >
            Insufficient funds to run the transaction
          </div>
        </q-card-section>

        <q-card-section class="with-arrow">
          <q-input
            ref="unstakeFromInput"
            v-model="unstake.from"
            :maxlength="14"
            class="stake-box__input"
            :label="`Staked ${XSOL_NAME}`"
            outlined
            placeholder="0.0"
            stack-label
            :readonly="connectionLost"
            @keypress="onlyNumber"
          >
            <template #append>
              <q-btn
                dense
                color="natural-light-gray"
                text-color="primary-gray"
                unelevated
                size="14px"
                padding="2px 8px 1px 8px"
                @click="unstakeMax"
              >
                MAX
              </q-btn>
              <token-svg class="stake-field__icon" />
              <span class="stake-field__symbol">{{ XSOL_NAME }}</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="stake-to-input">
          <q-input
            v-model="unstake.to"
            label="Amount to unstake"
            outlined
            placeholder="0.0"
            class="stake-box__input-to"
            readonly
            stack-label
            bg-color="transparent"
          >
            <template #append>
              <img alt="" class="stake-field__icon" src="@/assets/img/sol-logo.svg">
              <span class="stake-field__symbol">SOL</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section>
          <div class="row items-between">
            <div class="column col-sm-6 col-xs-12 q-pr-sm">
              <div class="stake-box__stake-info">
                Pool Fee: {{ unstakeNowInfo.poolFee }}
              </div>
              <div class="stake-box__stake-info">
                Network Fee: {{ unstakeNowInfo.networkFee }}
              </div>
            </div>

            <div class="column col-sm-6 col-xs-12 q-pl-sm">
              <q-btn
                v-if="connected"
                :loading="withdrawing && unstakeType === 'instant'"
                class="stake-box__btn"
                color="primary"
                rounded
                size="lg"
                text-color="primary-gray"
                :disable="connectionLost || Number(unstake.from) > Number(availableXsol) || unstakeType === 'delayed' || !useWithdrawSol"
                @click="unstakeHandler(false)"
              >
                <div>UNSTAKE NOW</div>
              </q-btn>
              <connect-wallet v-else />
            </div>
          </div>
        </q-card-section>
        <q-card-section v-if="connected">
          <div class="row items-between q-mt-sm">
            <div class="column col-sm-6 col-xs-12 q-pr-sm">
              <div class="stake-box__stake-info">
                Pool Fee: {{ unstakeInfo.poolFee }}
              </div>
              <div class="stake-box__stake-info">
                Network Fee: {{ unstakeInfo.networkFee }}
              </div>
            </div>

            <div class="column col-sm-6 col-xs-12 q-pl-sm">
              <q-btn
                :loading="withdrawing && unstakeType === 'delayed'"
                class="stake-box__btn"
                color="primary"
                rounded
                size="lg"
                text-color="primary-gray"
                :disable="connectionLost || Number(unstake.from) > Number(availableXsol) || unstakeType === 'instant'"
                @click="unstakeHandler(true)"
              >
                <div>UNSTAKE DELAYED</div>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>
