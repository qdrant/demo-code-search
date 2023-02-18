<template>
  <q-page>
    <div class="q-pa-md q-col-gutter-sm items-stretch">
      <div class="row justify-evenly">
        <div class="col-8">
          <h2>Source Code Search</h2>
        </div>
      </div>

      <div class="row justify-evenly">
        <div class="col-10 simple-typeahead">
          <q-input outlined :loading="loading" v-model="query" placeholder="Search" color="black"
            :input-style="{ fontSize: '16pt' }" class="input" v-on:keyup.enter="search">
            <template v-slot:append>
              <q-avatar style='width: auto;'>
                <img src="~/assets/logo_no_text.png" alt="Powered by Qdrant" />
              </q-avatar>
            </template>
          </q-input>


          <q-list v-if="showQuickResults" class="q-pa-xs simple-typeahead-list bg-white">
            <q-item clickable v-ripple v-for="result in results" :key="result.title" @click="console.log(result)"
              class="">
              <q-item-section>
                <q-item-label>{{ result.context.module }} / {{ result.context.file_name }}:{{ result.line }} > {{
                  result.context.struct_name
                }} </q-item-label>
                <q-item-label caption>
                  <code>{{ result.signature.slice(0, 100) }}...</code>
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-icon></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="row justify-evenly">
        <div class="col-10">
          <q-list class="q-pa-xs q-margin-md" separator>
            <q-item v-for="result in results" :key="result.title" @click="console.log(result)" class="">
              <q-item-section>
                <q-item-label>
                  {{ result.context.file_path }}:{{ result.line }} - &nbsp;&nbsp; <q-icon size="xs" name="open_in_news" />
                  <a :href="'https://github.com/qdrant/qdrant/blob/master/' + result.context.file_path + '#L' + result.line"
                    target="_blank">GitHub</a>
                </q-item-label>
                <q-item-label>
                  <!-- <pre v-highlightjs><code class="javascript">const s = new Date().toString()</code></pre> -->

                  <pre><code class="language-rust" v-html="result.context.snippet"></code></pre>
                  <!-- <highlightjs language="rust" :code="result.context.snippet" /> -->
                </q-item-label>

              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
</q-page>
</template>

<script>
import { defineComponent } from "vue";
import { axios } from "boot/axios";
import { Notify } from 'quasar'

import hljs from 'highlight.js/lib/common';
// Highlight lines plugin

// import hljsVuePlugin from "@highlightjs/vue-plugin";
// import { component as VueCodeHighlight } from 'vue-code-highlight';



let fakeData = [
  { "code_type": "Function", "context": { "file_name": "query_estimator.rs", "file_path": "lib/segment/src/index/query_estimator.rs", "module": "index", "snippet": "<mark>pub fn combine_should_estimations(</mark>\n<mark>    estimations: &[CardinalityEstimation],</mark>\n<mark>    total: usize,</mark>\n) -> CardinalityEstimation {\n    let mut clauses: Vec<PrimaryCondition> = vec![];\n    for estimation in estimations {\n        if estimation.primary_clauses.is_empty() {\n            // If some branch is un-indexed - we can't make\n            // any assumptions about the whole `should` clause\n            clauses = vec![];\n            break;\n        }\n        clauses.append(&mut estimation.primary_clauses.clone());\n    }\n    let element_not_hit_prob: f64 = estimations\n        .iter()\n        .map(|x| (total - x.exp) as f64 / (total as f64))\n        .product();\n    let element_hit_prob = 1.0 - element_not_hit_prob;\n    let expected_count = (element_hit_prob * (total as f64)).round() as usize;\n    CardinalityEstimation {\n        primary_clauses: clauses,\n        min: estimations.iter().map(|x| x.min).max().unwrap_or(0),\n        exp: expected_count,\n        max: min(estimations.iter().map(|x| x.max).sum(), total),\n    }\n}\n", "struct_name": null }, "docstring": null, "line": 13, "line_from": 13, "line_to": 39, "name": "combine_should_estimations", "signature": "fn combine_should_estimations (estimations : & [CardinalityEstimation] , total : usize ,) -> CardinalityEstimation", "sub_matches": [{ "overlap_from": 13, "overlap_to": 15 }] },
  { "code_type": "Function", "context": { "file_name": "query_estimator.rs", "file_path": "lib/segment/src/index/query_estimator.rs", "module": "index", "snippet": "<mark>fn estimate_must_not<F>(</mark>\n<mark>    estimator: &F,</mark>\n<mark>    conditions: &[Condition],</mark>\n<mark>    total: usize,</mark>\n) -> CardinalityEstimation\nwhere\n    F: Fn(&Condition) -> CardinalityEstimation,\n{\n    let estimate = |x| invert_estimation(&estimate_condition(estimator, x, total), total);\n    let must_not_estimations = conditions.iter().map(estimate).collect_vec();\n    combine_must_estimations(&must_not_estimations, total)\n}\n", "struct_name": null }, "docstring": null, "line": 159, "line_from": 159, "line_to": 170, "name": "estimate_must_not", "signature": "fn estimate_must_not < F > (estimator : & F , conditions : & [Condition] , total : usize ,) -> CardinalityEstimation where F : Fn (& Condition) -> CardinalityEstimation ,", "sub_matches": [{ "overlap_from": 159, "overlap_to": 162 }] },
  { "code_type": "Function", "context": { "file_name": "query_estimator.rs", "file_path": "lib/segment/src/index/query_estimator.rs", "module": "index", "snippet": "<mark>fn estimate_condition<F>(</mark>\n<mark>    estimator: &F,</mark>\n<mark>    condition: &Condition,</mark>\n<mark>    total: usize,</mark>\n) -> CardinalityEstimation\nwhere\n    F: Fn(&Condition) -> CardinalityEstimation,\n{\n    match condition {\n        Condition::Filter(filter) => estimate_filter(estimator, filter, total),\n        _ => estimator(condition),\n    }\n}\n", "struct_name": null }, "docstring": null, "line": 76, "line_from": 76, "line_to": 88, "name": "estimate_condition", "signature": "fn estimate_condition < F > (estimator : & F , condition : & Condition , total : usize ,) -> CardinalityEstimation where F : Fn (& Condition) -> CardinalityEstimation ,", "sub_matches": [{ "overlap_from": 76, "overlap_to": 79 }] },
  { "code_type": "Function", "context": { "file_name": "query_estimator.rs", "file_path": "lib/segment/src/index/query_estimator.rs", "module": "index", "snippet": "pub fn combine_must_estimations(\n    estimations: &[CardinalityEstimation],\n    total: usize,\n) -> CardinalityEstimation {\n    let min_estimation = estimations\n        .iter()\n        .map(|x| x.min)\n        .fold(total as i64, |acc, x| {\n            max(0, acc + (x as i64) - (total as i64))\n        }) as usize;\n\n    let max_estimation = estimations.iter().map(|x| x.max).min().unwrap_or(total);\n\n    let exp_estimation_prob: f64 = estimations\n        .iter()\n        .map(|x| (x.exp as f64) / (total as f64))\n        .product();\n\n    let exp_estimation = (exp_estimation_prob * (total as f64)).round() as usize;\n\n    let clauses = estimations\n        .iter()\n        .filter(|x| !x.primary_clauses.is_empty())\n        .min_by_key(|x| x.exp)\n        .map(|x| x.primary_clauses.clone())\n        .unwrap_or_default();\n\n    CardinalityEstimation {\n        primary_clauses: clauses,\n        min: min_estimation,\n        exp: exp_estimation,\n        max: max_estimation,\n    }\n}\n", "struct_name": null }, "docstring": null, "line": 41, "line_from": 41, "line_to": 74, "name": "combine_must_estimations", "signature": "fn combine_must_estimations (estimations : & [CardinalityEstimation] , total : usize ,) -> CardinalityEstimation", "sub_matches": [] },
  { "code_type": "Function", "context": { "file_name": "query_estimator.rs", "file_path": "lib/segment/src/index/query_estimator.rs", "module": "index", "snippet": "fn estimate_must<F>(estimator: &F, conditions: &[Condition], total: usize) -> CardinalityEstimation\nwhere\n    F: Fn(&Condition) -> CardinalityEstimation,\n{\n    let estimate = |x| estimate_condition(estimator, x, total);\n    let must_estimations = conditions.iter().map(estimate).collect_vec();\n\n    combine_must_estimations(&must_estimations, total)\n}\n", "struct_name": null }, "docstring": null, "line": 137, "line_from": 137, "line_to": 145, "name": "estimate_must", "signature": "fn estimate_must < F > (estimator : & F , conditions : & [Condition] , total : usize) -> CardinalityEstimation where F : Fn (& Condition) -> CardinalityEstimation ,", "sub_matches": [] },
]


export default defineComponent({
  name: "IndexPage",

  components: {
    // highlightjs: hljsVuePlugin.component,
    // VueCodeHighlight,
  },

  data: () => ({
    query: "",
    loading: false,
    results: fakeData,
    showResults: true,
    showQuickResults: false,
  }),

  created() {
    // hljs.highlightAll();
  },

  methods: {
    async search() {
      try {
        this.loading = true;
        const response = await axios.get("api/search", {
          params: { query: this.query },
        });
        this.results = response.data.result;
        this.showResults = true;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        Notify.create({
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


<style scoped>
.simple-typeahead {
  position: relative;
  z-index: 1;
}

.simple-typeahead .input {
  z-index: 1;
}

.simple-typeahead .simple-typeahead-list {
  position: absolute;
  width: 100%;
  overflow-y: auto;
  z-index: -1;
}
</style>