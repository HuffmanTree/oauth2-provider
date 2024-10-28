<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { getProject, authorize as consent } from "../http/client.http";

const scopeMap = {
  openid: "Internal identifier",
  gender: "Gender",
  birthdate: "Date of birth",
  given_name: "Given name",
  family_name: "Family name",
  email: "Email address",
  
};
const route = useRoute();
const router = useRouter();

function getQueryParam(q: string) {
  const param = Array.isArray(route.query[q]) ? route.query[q][0] : route.query[q];
  if (!param) {
    throw new Error(`Query param '${q}' not found`);
  }
  return param;
}

const responseType = ref(getQueryParam("response_type"));
const clientId = ref(getQueryParam("client_id"));
const redirectUri = ref(getQueryParam("redirect_uri"));
const scope = ref(getQueryParam("scope").split(","));
const project = ref(await getProject(clientId.value));

async function authorize() {
  await consent({
    responseType: responseType.value,
    clientId: clientId.value,
    redirectUri: redirectUri.value,
    scope: scope.value,
  });
  router.push({ name: "Completed", params: { projectName: project.value.name } });
}
</script>

<template>
  <div id="consent">
    <h1 class="center">Consent required</h1>
    <div class="wrapper block">
      <p>Application '{{ project.name }}' requests your authorization to access the following properties</p>
      <ul>
        <li v-for="s in scope">{{ scopeMap[s] }}</li>
      </ul>
      <form @submit.prevent="authorize">
        <button type="submit">Consent</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
