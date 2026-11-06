import { GET, POST, OPTIONS } from "../app/api/mcp/route";
import { NextRequest } from "next/server";

async function run() {
  console.log("--- 1. Testing OPTIONS ---");
  const optRes = await OPTIONS();
  console.log("OPTIONS status:", optRes.status);
  console.log("CORS Allow-Origin:", optRes.headers.get("access-control-allow-origin"));
  console.log("CORS Allow-Methods:", optRes.headers.get("access-control-allow-methods"));
  console.log("Mcp-Protocol-Version:", optRes.headers.get("mcp-protocol-version"));

  console.log("\n--- 2. Testing GET Health Check ---");
  const getReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "GET",
    headers: { Accept: "application/json, text/event-stream" },
  });
  const getRes = await GET(getReq);
  const getBody = await getRes.json();
  console.log("GET status:", getRes.status);
  console.log("GET Mcp-Protocol-Version:", getRes.headers.get("mcp-protocol-version"));
  console.log("GET Body:", JSON.stringify(getBody, null, 2));

  console.log("\n--- 3. Testing POST initialize ---");
  const initReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "arcade-gateway", version: "1.0.0" },
      },
    }),
  });
  const initRes = await POST(initReq);
  const initBody = await initRes.json();
  console.log("Init status:", initRes.status);
  console.log("Init Body:", JSON.stringify(initBody, null, 2));

  console.log("\n--- 4. Testing POST notifications/initialized ---");
  const notifReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });
  const notifRes = await POST(notifReq);
  const notifBody = await notifRes.json();
  console.log("Notif status:", notifRes.status);
  console.log("Notif Body:", JSON.stringify(notifBody, null, 2));

  console.log("\n--- 5. Testing POST tools/list ---");
  const listReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    }),
  });
  const listRes = await POST(listReq);
  const listBody = await listRes.json();
  console.log("List status:", listRes.status);
  console.log("Available tools count:", listBody.result.tools.length);
  console.log("Tool names:", listBody.result.tools.map((t: any) => t.name));

  console.log("\n--- 6. Testing POST tools/call (check_account_balance) ---");
  const callReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "check_account_balance",
        arguments: {},
      },
    }),
  });
  const callRes = await POST(callReq);
  const callBody = await callRes.json();
  console.log("Call status:", callRes.status);
  console.log("Call Body:", JSON.stringify(callBody, null, 2));

  console.log("\n--- 7. Testing POST tools/call (create_escrow) ---");
  const escrowReq = new NextRequest("http://localhost:3000/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "create_escrow",
        arguments: {
          task_description: "Audit security deliverables",
          amount_cents: 100000,
          expected_schema: { type: "object", properties: { pass: { type: "boolean" } } },
        },
      },
    }),
  });
  const escrowRes = await POST(escrowReq);
  const escrowBody = await escrowRes.json();
  console.log("Escrow call status:", escrowRes.status);
  console.log("Escrow call Body:", JSON.stringify(escrowBody, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
