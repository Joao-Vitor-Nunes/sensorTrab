import net from "net";

type SensorType = "temperature" | "humidity" | "heat_index";

const SENSOR_PORT = Number(process.env.SENSOR_PORT || "5000");
const SENSOR_TYPE = (process.env.SENSOR_TYPE as SensorType) || "temperature";
const SENSOR_ID = process.env.SENSOR_ID || `${SENSOR_TYPE}-${Math.floor(Math.random() * 1000)}`;
const CITY = process.env.CITY || "Bairro-A";

// Função para gerar valor fake
function generateValue(type: SensorType) {
  switch (type) {
    case "temperature": return { value: (20 + Math.random() * 10).toFixed(2), unit: "C" };
    case "humidity":    return { value: (40 + Math.random() * 40).toFixed(2), unit: "%" };
    case "heat_index":  return { value: (25 + Math.random() * 13).toFixed(2), unit: "C" };
    default:            return { value: "0", unit: "" };
  }
}

const server = net.createServer((socket) => {
  console.log(`[SENSOR ${SENSOR_ID}] Gateway conectado`);

  socket.on("data", (data) => {
    const req = data.toString().trim();
    if (req === "GET") {
      const { value, unit } = generateValue(SENSOR_TYPE);
      const msg = {
        city: CITY,
        sensorId: SENSOR_ID,
        sensorType: SENSOR_TYPE,
        value,
        unit,
        timestamp: new Date().toISOString(),
      };
      socket.write(JSON.stringify(msg) + "\n");
    }
  });

  socket.on("end", () => console.log(`[SENSOR ${SENSOR_ID}] Gateway desconectado`));
});

server.listen(SENSOR_PORT, () => {
  console.log(`[SENSOR ${SENSOR_ID}] Servidor ouvindo na porta ${SENSOR_PORT}`);
});
