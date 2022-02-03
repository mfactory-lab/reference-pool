<template>
  <q-card class="wallet-balance">
    <q-card-section class="wallet-balance__head">
      <div>${{ formatMoney(totalUsd) }}</div>
      <div>WALLET</div>
    </q-card-section>
    <q-card-section class="wallet-balance__body">
      <q-list dense separator>
        <q-item>
          <q-item-section class="balance__value">
            <span>{{ formatPrice(solBalance) }}</span>
            <span class="balance__value__usd">${{ formatMoney(solUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <img alt="" src="@/assets/img/sol-logo.svg" />
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="balance__value">
            {{ formatPrice(tokenBalance) }}
            <span class="balance__value__usd">${{ formatMoney(xsolUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <token-svg />
              <span>xSOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="wallet-balance__staking__title">STAKING</div>
      <q-list dense separator>
        <q-item>
          <q-item-section side>
            <q-btn
              rounded
              size="sm"
              unelevated
              color="primary"
              text-color="primary-gray"
              dense
              class="q-px-md"
              @click="openDetails"
            >
              Details
            </q-btn>
          </q-item-section>
          <q-item-section class="balance__value">
            {{ formatPrice(stakeSolBalance) }}
            <span class="balance__value__usd">${{ formatMoney(stackedUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <img alt="" src="@/assets/img/sol-logo.svg" />
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
  <stake-accounts-dialog />
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { storeToRefs } from 'pinia';
  import {
    useBalanceStore,
    useCoinRateStore,
    useStakeAccountStore,
    useStakePoolStore,
  } from '@/store';
  import { longPriceFormatter } from '@/utils';
  import { formatMoney } from '@/utils/check-number';
  import StakeAccountsDialog from '@/components/StakeAccountsDialog.vue';

  export default defineComponent({
    components: { StakeAccountsDialog },
    setup() {
      const stakePoolStore = useStakePoolStore();
      const balanceStore = useBalanceStore();
      const stakeAccountStore = useStakeAccountStore();
      const coinRateStore = useCoinRateStore();

      const { solBalance, tokenBalance } = storeToRefs(balanceStore);
      const { stakeSolBalance, dialog } = storeToRefs(stakeAccountStore);

      const solUsd = computed(() => coinRateStore.solPrice * solBalance.value);
      const jsolUsd = computed(
        () => (coinRateStore.solPrice * tokenBalance.value) / stakePoolStore.exchangeRate,
      );
      const stackedUsd = computed(() => coinRateStore.solPrice * stakeSolBalance.value);

      return {
        solBalance,
        tokenBalance,
        solUsd,
        jsolUsd,
        stackedUsd,
        totalUsd: computed(() => solUsd.value + jsolUsd.value + stackedUsd.value),
        stakeSolBalance: computed(() => stakeSolBalance.value),
        formatPrice: (v: number) => longPriceFormatter.format(v),
        formatMoney: (v: number) => formatMoney(v),
        openDetails() {
          dialog.value = true;
        },
      };
    },
  });
</script>
