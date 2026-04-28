// src/index.ts
import { fetchAppData } from './api';
import { Store } from './models/store';

async function init() {
  try {
    const data = await fetchAppData();
    const store = new Store(data);

    // Prueba temporal para verificar que la reactividad funciona
    store.subscribe((state) => {
      console.log("Reactividad disparada. Canal actual:", state.currentChannelId);
    });

    // Simulamos un cambio de canal
    setTimeout(() => {
      store.setCurrentChannelId('c-frontend');
    }, 2000);

  } catch (error) {
    console.error("Error al cargar la aplicación:", error);
  }
}

init();