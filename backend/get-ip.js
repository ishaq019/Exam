// Get your current public IP address
const https = require("https");

https.get("https://api.ipify.org?format=json", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const ip = JSON.parse(data).ip;
    console.log("Your Public IP:", ip);
    console.log("\nAdd this IP to MongoDB Atlas:");
    console.log("1. https://cloud.mongodb.com/v2");
    console.log("2. Project → Network Access");
    console.log('3. Click "+ Add IP Address"');
    console.log(`4. Enter: ${ip}`);
  });
}).on("error", (err) => {
  console.error("Error getting IP:", err.message);
});
