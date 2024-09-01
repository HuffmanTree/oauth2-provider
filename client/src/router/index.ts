import { createWebHistory, createRouter, RouteRecordRaw, NavigationGuard } from "vue-router";

const mustLogin: NavigationGuard = function (from, _, next) {
  const token = localStorage.getItem("token");
  if (token) return next();
  return next({ name: "Login", query: { redirect: from.fullPath } });
};

const routes: RouteRecordRaw[] = [{
  path: "/login",
  name: "Login",
  component: () => import("../views/Login.vue"),
}, {
  beforeEnter: mustLogin,
  path: "/consent",
  name: "Consent",
  component: () => import("../views/Consent.vue"),
}];

export default createRouter({
  history: createWebHistory(),
  routes,
});
