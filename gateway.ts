import net from "net";
import fs from "fs";
import path from "path";

const SENSOR_HOST = process.env.SENSOR_HOST || "127.0.0.1";
const SENSOR_PORT = Number(process.env.SENSOR_PORT || "5000");

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const DB_FILE = path.join(DATA_DIR, "measurements.jsonl");

// Conectar ao sensor e pedir dados
function requestData() {
  const socket = net.createConnection({ host: SENSOR_HOST, port: SENSOR_PORT }, () => {
    console.log(`[GATEWAY] Conectado ao sensor em ${SENSOR_HOST}:${SENSOR_PORT}`);
    socket.write("GET\n"); // envia requisição
  });

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();
    if (buffer.includes("\n")) {
      const line = buffer.trim();
      buffer = "";
      try {
        const obj = JSON.parse(line);
        fs.appendFileSync(DB_FILE, JSON.stringify(obj) + "\n");
        console.log(`[GATEWAY] Registro salvo:`, obj);
      } catch (e) {
        console.error("[GATEWAY] Erro parse:", e);
      }
      socket.end();
    }
  });

  socket.on("error", (err) => {
    console.error("[GATEWAY] Erro de conexão:", err.message);
  });
}

// Executa a cada X segundos
setInterval(requestData, 3000);
requestData();
