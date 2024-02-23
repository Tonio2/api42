const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = "http://localhost:3000/callback";

// Object to store the access token
const tokenFilePath = path.join(__dirname, "accessToken.json");

// Function to save token to file
function saveTokenToFile(token) {
  fs.writeFileSync(tokenFilePath, JSON.stringify(token));
}

// Function to read token from file
function readTokenFromFile() {
  try {
    const tokenString = fs.readFileSync(tokenFilePath);
    return JSON.parse(tokenString);
  } catch (error) {
    if (error.code == 'ENOENT') console.log("AccessToken.json have not been generated yet")
    else console.error("Error reading token from file:", error);
    return null;
  }
}

app.use(express.json());

function checkToken(req, res, next) {
  const tokenData = readTokenFromFile();

  if (!tokenData || !tokenData.accessToken) {
    return res.status(401).send(`
          <h1>Welcome to the App</h1>
          <p>No access token found. Please authenticate via <a href="/auth/42">Login via 42 OAuth</a>.</p>
        `);
  }

  req.accessToken = tokenData.accessToken;
  next();
}

function api(endpoint, token) {
  return axios.get(`https://api.intra.42.fr/v2/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get("/", checkToken, async (req, res) => {
  try {
    const tokenInfoResponse = await axios.get(
      "https://api.intra.42.fr/oauth/token/info",
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );

    const { scopes, expires_in_seconds } = tokenInfoResponse.data;
    const expires_in_minutes = (expires_in_seconds / 60).toFixed(2);

    res.send(`
          <h1>Welcome to the App</h1>
          <p>Token Status: Active</p>
          <p>Scope: ${scopes.join(", ")}</p>
          <p>Expires in: ${expires_in_minutes} minutes</p>
          <ul>
            <li><a href="/my_projects">My projects</a></li>
            <li><a href="/tokenizer">Tokenizer</a></li>
            <li><a href="/me">Me</a></li>
            <li><a href="/generate_csv">Generate csv</a></li>
          </ul>
        `);
  } catch (error) {
    console.error("Error fetching token info:", error);
    res.status(500).send(`
          <h1>Welcome to the App</h1>
          <p>Error fetching token information. Please try to <a href="/auth/42">Login via 42 OAuth</a> again.</p>
        `);
  }
});

app.get("/auth/42", (req, res) => {
  const authorizationURI = `https://api.intra.42.fr/oauth/authorize?${querystring.stringify(
    {
      client_id: clientID,
      redirect_uri: redirectURI,
      response_type: "code",
      scope: "public projects",
    }
  )}`;
  res.redirect(authorizationURI);
});

app.get("/generate_csv", checkToken, async (req, res) => {
  try {
    const response = await api("me", req.accessToken);
    res.send("Generating CSV...");
    const project_users = response.data.projects_users;
    for (const project_user of project_users) {
      try {
        const project = await api(`projects/${project_user.project.id}`, req.accessToken);
        await sleep(1000);
        if (project.data.difficulty === 0) continue;
        fs.appendFileSync(
          "projects.csv",
          `${project_user.project.name}, , ${project.data.difficulty}, ${
            project_user.final_mark || 0
          }\n`
        );
        console.log(
          project_user.project.name,
          project.data.difficulty,
          project_user.final_mark || 0
        );
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      "https://api.intra.42.fr/oauth/token",
      querystring.stringify({
        grant_type: "authorization_code",
        client_id: clientID,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectURI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    saveTokenToFile({ accessToken });

    res.redirect("/");
  } catch (error) {
    console.error("Error in callback:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/my_projects", checkToken, async (req, res) => {
  try {
    const response = await api("me/projects", req.accessToken);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/tokenizer", checkToken, async (req, res) => {
  try {
    const response = await api("projects/2485", req.accessToken);
    res.json(response.data);
  } catch (error) {
    console.error("Error in tokenizer:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/me", checkToken, async (req, res) => {
  try {
    const response = await api("me", req.accessToken);
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
