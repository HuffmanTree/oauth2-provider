<script setup lang="ts">
import { ref } from "vue";
import { login } from "../http/client.http";
import { useRoute, useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const route = useRoute();
const router = useRouter();

async function signIn() {
  const { token, message } = await login({
    email: email.value,
    password: password.value,
  });

  if (!token) return alert(message);

  localStorage.setItem("token", token);
  const { redirect } = route.query;

  if (typeof redirect === "string") {
    router.push(redirect);
  }
}
</script>

<template>
  <div id="login">
    <h1 class="center">Login</h1>
    <div class="wrapper block">
      <form @submit.prevent="signIn">
        <label for="login-email">Email:</label>
        <input class="block" id="login-email" type="email" v-model="email" required/>
        <label for="login-password">Password:</label>
        <input class="block" id="login-password" type="password" v-model="password" required/>
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
