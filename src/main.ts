import { createApp } from "vue";
import App from "./App.vue";
import ErrorPage from "./ErrorPage.vue";

createApp(App).component("ErrorPage", ErrorPage).mount("#app");
