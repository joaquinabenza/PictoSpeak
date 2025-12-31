import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Assuming you have a router/index.ts
import { createPinia } from 'pinia';
import "./style.css";


const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');