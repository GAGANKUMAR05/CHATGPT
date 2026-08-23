import "dotenv/config";
import dns from "dns";
import http from "http";

import app from "./src/app.js";
import connectToDb from "./src/db/db.js";
import initSocketServer from "./src/sockets/socket.server.js";

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const PORT = 3000;

const startServer = async () => {
    try {
        await connectToDb();

        const httpServer = http.createServer(app);

        initSocketServer(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();