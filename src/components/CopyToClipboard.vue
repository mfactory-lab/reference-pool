<template>
  <q-btn flat round dense>
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      @click="copy"
    >
      <path
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
    <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
      Copy to clipboard
    </q-tooltip>
  </q-btn>
</template>

<script lang="ts">
  import { copyToClipboard, useQuasar } from 'quasar';
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: {
      text: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const { notify } = useQuasar();
      return {
        copy() {
          copyToClipboard(props.text);
          notify({
            message: 'Copied to clipboard',
          });
        },
      };
    },
  });
</script>
