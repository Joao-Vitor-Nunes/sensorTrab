import net from "net";
import fs from "fs";
import path from "path";

const STORAGE_PORT = Number(process.env.STORAGE_PORT || "6000");

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, "measurements.jsonl");

const server = net.createServer((socket) => {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[STORAGE] Conexão de ${remote}`);

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();

    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);

      if (!line) continue;
      try {
        // Valida JSON; se ok, persiste
        JSON.parse(line);
        fs.appendFileSync(DB_FILE, line + "\n");
        console.log(`[STORAGE] Registro salvo (${line.length}b)`);
      } catch (e) {
        console.error("[STORAGE] Linha inválida, ignorada:", line);
      }
    }
  });

  socket.on("error", (err) => {
    console.error(`[STORAGE] Erro conexão com ${remote}: ${err.message}`);
  });

  socket.on("end", () => {
    console.log(`[STORAGE] Conexão encerrada por ${remote}`);
  });
});

server.listen(STORAGE_PORT, () => {
  console.log(`[STORAGE] Servidor ouvindo na porta ${STORAGE_PORT}`);
});
