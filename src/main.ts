import { createApp } from "vue";
import App from "./App.vue";
import ErrorPage from "./ErrorPage.vue";
import "./styles/global.css";

createApp(App).component("ErrorPage", ErrorPage).mount("#app");
