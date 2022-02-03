<template>
  <q-item>
    <q-item-section>
      <q-item-label class="items-center">
        <copy-to-clipboard :text="address" />
        <span class="q-mx-sm">{{ shortAddress }}</span>
        <q-badge :color="stateColor">
          {{ state }}
        </q-badge>
      </q-item-label>
      <q-item-label caption> {{ amount }} SOL </q-item-label>
    </q-item-section>

    <q-item-section side>
      <template v-if="state === 'active'">
        <q-btn color="accent" rounded style="width: 120px" unelevated @click="deactivate(address)">
          DEACTIVATE
        </q-btn>
      </template>
      <template v-else>
        <q-btn
          :disabled="state === 'deactivating'"
          color="primary"
          rounded
          style="width: 120px"
          unelevated
          @click="withdraw(address, lamports)"
        >
          WITHDRAW
        </q-btn>
      </template>
    </q-item-section>

    <q-inner-loading :showing="loading">
      <q-spinner color="primary" />
    </q-inner-loading>
  </q-item>
</template>

<script lang="ts">
  import { StakeActivationData } from '@solana/web3.js';
  import { computed, defineComponent, ref, watchEffect } from 'vue';
  import { formatAmount, lamportsToSol, shortenAddress } from '@/utils';
  import CopyToClipboard from '@/components/CopyToClipboard.vue';
  import { storeToRefs } from 'pinia';
  import { useConnectionStore } from '@/store';
  import { StakePoolAccount } from '@solana/spl-stake-pool';

  export default defineComponent({
    components: { CopyToClipboard },
    props: {
      stakeAccount: {
        type: Object as () => StakePoolAccount,
        required: true,
      },
    },
    setup(props, { emit }) {
      const { connection } = storeToRefs(useConnectionStore());

      const stakeActivation = ref<StakeActivationData>();
      const loading = ref(true);

      watchEffect(async () => {
        loading.value = true;
        stakeActivation.value = await connection.value!.getStakeActivation(
          props.stakeAccount.pubkey,
        );
        loading.value = false;
      });

      return {
        address: computed(() => props.stakeAccount.pubkey.toBase58()),
        shortAddress: computed(() => shortenAddress(props.stakeAccount.pubkey.toBase58())),
        amount: computed(() => {
          return formatAmount(lamportsToSol(props.stakeAccount?.account?.lamports ?? 0));
        }),
        lamports: computed(() => props.stakeAccount?.account?.lamports),
        state: computed(() => stakeActivation.value?.state),
        stateColor: computed(() => {
          switch (stakeActivation.value?.state) {
            case 'active':
              return 'positive';
            case 'inactive':
              return 'negative';
            default:
              return 'grey';
          }
        }),
        loading,
        deactivate(address: string) {
          emit('deactivate', address);
        },
        withdraw(address: string, lamports: number) {
          emit('withdraw', address, lamports);
        },
      };
    },
  });
</script>
