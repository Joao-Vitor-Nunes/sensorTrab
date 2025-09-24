// calculator.ts
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data", "measurements.jsonl");

function readAll(): any[] {
  if (!fs.existsSync(DB_FILE)) return [];
  const txt = fs.readFileSync(DB_FILE, "utf8").trim();
  if (!txt) return [];
  return txt.split("\n").map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function latestPerSensor(records: any[]) {
  const map = new Map<string, any>();
  for (const r of records) {
    const key = `${r.city}::${r.sensorId}`;
    if (!map.has(key) || new Date(r.timestamp) > new Date(map.get(key).timestamp)) {
      map.set(key, r);
    }
  }
  return map;
}

function averageByCityAndType(records: any[]) {
  const sums: Record<string, { sum: number; count: number }> = {};
  for (const r of records) {
    const key = `${r.city}::${r.sensorType}`;
    if (!sums[key]) sums[key] = { sum: 0, count: 0 };
    sums[key].sum += Number(r.value);
    sums[key].count += 1;
  }
  const out: Record<string, number> = {};
  for (const k of Object.keys(sums)) {
    out[k] = +(sums[k].sum / sums[k].count).toFixed(2);
  }
  return out;
}

function main() {
  const records = readAll();
  console.log(`\n[CALCULATOR] Registros lidos: ${records.length}\n`);

  console.log("Última leitura por sensor:");
  const latest = latestPerSensor(records);
  latest.forEach((v, k) => {
    console.log(`${k} => ${v.sensorType} = ${v.value}${v.unit} @ ${v.timestamp}`);
  });

  console.log("\nMédias por cidade e tipo:");
  const avg = averageByCityAndType(records);
  for (const k of Object.keys(avg)) {
    console.log(`${k} => ${avg[k]}`);
  }
  console.log("\n");
}

main();
