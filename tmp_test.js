import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// Create a dummy image
const dummyImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
fs.writeFileSync("test.png", dummyImage);

async function uploadTest() {
  try {
    // First login to get token
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "test@example.com", // Assume maybe there's a test user? We can't guarantee.
      password: "password123"
    });
    const token = loginRes.data.data.token; // we don't know the password...
  } catch (err) {
    console.log("No test user", err.response?.data);
  }
}

// Instead of hitting the authenticated endpoint, let's create a test endpoint in backend temporarily to see where multer saves!
