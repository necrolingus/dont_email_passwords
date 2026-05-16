# 🚀 Dont Email Passwords!

Spin up this Node.js app in Docker or as a standalone app to to have your own secure password sharing service. 🧪

This is a direct spinoff from https://github.com/pglombardo/PasswordPusher but written in NodeJs, it provides APIs, and uses less memory (all of these requirements that I had)

---
<br />


## 📚 Documentation with Examples
Check it out [https://dep.leighonline.net/documentation](https://dep.leighonline.net/documentation) (redirects to Postman documentation).

## Run Locally (No Docker)

1. Install dependencies:
   - `npm install`
2. Start the API server in terminal 1:
   - `npm start`
3. Start the MCP server in terminal 2:
   - `npm run start:mcp`

Local endpoints:
- API base: `http://localhost:8080/api`
- Swagger UI: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- MCP endpoint: `http://localhost:8090/mcp`
- MCP health: [http://localhost:8090/health](http://localhost:8090/health)

### Local API Docs
- Swagger UI: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- OpenAPI JSON: [http://localhost:8080/swagger.json](http://localhost:8080/swagger.json)
- Project requirements: [requirements/requirements.md](requirements/requirements.md)

### MCP Server (HTTP)
- MCP endpoint: `POST http://localhost:8090/mcp`
- Health endpoint: [http://localhost:8090/health](http://localhost:8090/health)
- Local run command: `npm run start:mcp`
- MCP tools available:
  - `store_secret`
  - `get_secret`
  - `delete_secret`
  - `get_config`
  - `get_stats`

Cursor MCP config snippet (Cursor):
```json
{
  "mcpServers": {
    "dont-email-passwords": {
      "transport": "streamable-http",
      "url": "http://localhost:8090/mcp" (or whever you are running)
    }
  }
}

Or just like this in production (Antigravity):

```json
{
    "mcpServers": {
        "dont-email-passwords": {
            "serverUrl": "https://dep.leighonline.net/mcp"
        }
    }
}
```

---
<br />


## 🤩 Try it out!
But read the documentation first 🎓😎

### User Interface
[https://dep.leighonline.net/ui/](https://dep.leighonline.net/ui)  🎉🥳🎊🎁


- ✅ Enter your secret
- ✅ Set when the link should expire
- ✅ Set after how many clicks the link should expire
- ✅Click submit and share the link

<img width="564" height="660" alt="image" src="https://github.com/user-attachments/assets/70303676-4abd-4857-a833-89fd8e26766d" />



- ✅ You can delete the secret immediately if you don't want to wait for it to expire

<img width="568" height="579" alt="image" src="https://github.com/user-attachments/assets/5d891104-1531-45f0-bb97-f45951a9d308" />




### APIs
[https://dep.leighonline.net/api/](https://dep.leighonline.net/api)

---
<br />


## 🌟 **Features**
- **Rate Limiting**: Customizable rate limits. ⛔
- **Highly Customizable**: You can define several parameters to suit your environment, such as max TTL per secret, max number of secrets, max clicks per secret, max size per secret in KB, etc. 🔣
- **UI and API**: Use the UI or integrate into your own application using the API. 🗂️
- **Super lightweight**: Uses less than 60MB of memory (depending on the cache size of course). ⚖️
- **Config and Stats**:
   - Get stats about your cache via API. 📊
   - Get your config via an API. Super useful when building your own font-end. 🗂️
- **Deployment Flexibility**: Run locally or in Docker 🐳.

<br />

