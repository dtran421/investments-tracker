import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

// calling IPC exposed from preload script
window.electronAPI.onCreateReturn((str: string) => {
    // eslint-disable-next-line no-console
    console.log(str);
});
// window.electronAPI.ipcRenderer.sendMessage(Channels.IPC_EXAMPLE, ["ping"]);
