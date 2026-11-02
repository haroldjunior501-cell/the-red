const https = require("https");

const API_KEY = process.env.BREVO_API_KEY || "placeholder-brevo-api-key";

// Test 1 : verifier le compte Brevo
const options = {
  hostname: "api.brevo.com",
  path: "/v3/account",
  method: "GET",
  headers: { "api-key": API_KEY, "accept": "application/json" }
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
  });
});

req.on("error", (e) => console.error("Erreur reseau:", e.message));
req.end();
