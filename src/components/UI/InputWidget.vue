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
import type { Size } from 'bootstrap-vue-next'
import solIcon from '~/assets/img/sol-logo.svg'
import { formatPrice, getZeroCountAfterDecimal, parseFormattedPrice } from '~/utils'

const {
  balance,
  price,
  size = 'lg',
  disabled,
  icon = solIcon,
  readonly = false,
  fee = 0,
  format = false,
  asset = 'SOL',
  modelValue,
} = defineProps<{
  size?: Size
  balance: number
  description?: string
  price?: number
  disabled?: boolean
  labelLeft?: string
  labelRight?: string
  icon?: string
  asset?: string
  readonly?: boolean
  fee?: number
  format?: boolean
  rules?: Array<(val: string) => true | string>
  modelValue?: string | number
}>()

const emit = defineEmits(['update:modelValue', 'maxHandler'])

const { publicKey } = useClientWallet()

const val = computed({
  get() {
    return modelValue ? String(modelValue) : ''
  },
  set(val) {
    emit('update:modelValue', val)
  },
})
const resetValidation = ref(false)

function max() {
  if (!publicKey.value) {
    const connectBtn = document.querySelector('.connect-wallet') as HTMLElement
    connectBtn?.click()
    return
  }
  console.log(balance)
  console.log(fee)
  const balanceWithoutFee = Math.max(balance - fee, 0)
  const decimals = String(balanceWithoutFee).includes('e') ? getZeroCountAfterDecimal(balanceWithoutFee) : null
  val.value = decimals ? balanceWithoutFee.toFixed(decimals) : String(balanceWithoutFee)
  resetValidation.value = true
  nextTick(() => {
    resetValidation.value = false
    emit('maxHandler', val.value)
  })
}

const inputDesc = computed(() => {
  if (!val.value || !price) {
    return
  }
  const stakedSol = format ? parseFormattedPrice(val.value) : Number(val.value)
  const solToUsd = stakedSol * Number(price)
  return `$${formatPrice(solToUsd, 2, 2)}`
})

function handleClick(e: any) {
  const target = e.target
  if (target.closest('.j-input__label') || target.closest('.j-input__desc')) {
    return
  }
  const inputContainer = target.closest('.j-input')
  const input = inputContainer.querySelector('input')
  input?.focus()
}

const forceValidation = ref(false)

watch(() => balance, () => {
  forceValidation.value = true
  nextTick(() => {
    forceValidation.value = false
  })
})
</script>

<template>
  <j-input
    v-model="val"
    class="input-widget"
    :size="size"
    placeholder="0.00"
    only-numbers
    :force-validation="forceValidation"
    :reset-validation="resetValidation"
    :disabled="disabled"
    :readonly="readonly"
    :rules="rules"
    @click="handleClick"
  >
    <template #description>
      <div class="price-label">
        {{ inputDesc }}
      </div>
    </template>

    <template #prepend>
      <img :src="icon" alt="token icon" class="j-input__icon">
    </template>
    <template #append>
      <j-btn :disabled="disabled" variant="primary" size="sm" class="j-input__btn" @click="max">
        MAX
      </j-btn>
      {{ asset }}
    </template>
  </j-input>
</template>

<style lang="scss">
.input-widget {
  .balance {
    font-size: 14px;
    margin-left: 16px;
    opacity: 0.8;
  }
  .price-label {
    height: 14px;
    text-align: right;
  }
  .j-input__append {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
  .j-input__btn {
    border-radius: 4px;
    width: max-content;
    text-transform: uppercase;

    .btn-content {
      transform: none;
    }
  }
}
</style>
