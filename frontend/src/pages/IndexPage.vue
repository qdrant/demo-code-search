<template>
  <q-page class="flex flex-center">
    <div>
      <div class="row justify-evenly">
        <img
          alt="Qdrant logo"
          src="~assets/qdrant-logo.svg"
          style="width: 200px"
        />
      </div>
      <div class="row justify-evenly">
        <h2>{{ prediction }}</h2>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { axios } from "boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "IndexPage",
  data: () => ({
    prediction: null,
  }),

  created() {
    // fetch on init
    this.predict();
  },

  methods: {
    async predict() {
      const $q = useQuasar();
      try {
        const response = await axios.get("api/predict", {
          params: { query: "test" },
        });
        this.prediction = response.data;
      } catch (e) {
        $q.notify({
          color: "negative",
          position: "top",
          message: "Loading failed: " + e,
          icon: "report_problem",
        });
      }
    },
  },
});
</script>
