import './styles/base.css';
import './styles/shared.css';
import './styles/workspaces.css';
import './styles/sidebar.css';
import './styles/channel.css';
import './styles/dm.css';
import './styles/chat.css';
import './styles/message.css';
import './styles/composer.css';
import './styles/members-panel.css';
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