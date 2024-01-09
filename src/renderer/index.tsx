import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

// window.electronAPI.ipcRenderer.sendMessage(Channels.IPC_EXAMPLE, ["ping"]);
