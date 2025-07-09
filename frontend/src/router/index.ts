import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LandingView from "../views/LandingView.vue";
import LoginView from "../views/LoginView.vue";
import MatchView from "../views/MatchView.vue";
import SubscribeView from "../views/SubscriptionView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "landing",
    component: LandingView,
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/subscription",
    name: "subscription",
    component: SubscribeView,
  },
  {
    path: "/match/:id",
    name: "MatchPage",
    component: MatchView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
