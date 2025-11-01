# GhostChat

A fully static, ephemeral, encrypted chatroom that lives in your browser — messages disappear on refresh or close.

## Features

- **Fully Static**: No backend required for single-device use.
- **Ephemeral Chat**: Messages disappear when you refresh or close the tab.
- **Room Creation**: Generate a room code to join a chat.
- **Optional Encryption**: Messages can be encrypted client-side using the room code as a key.
- **Lightweight & Deployable**: Works perfectly on GitHub Pages, Firebase Hosting, or other free static site hosts.

## How to Use

1. Open `index.html` in your browser.
2. A room code will be automatically generated and displayed.
3. Share the room code with others to join the same chat.
4. Type messages and hit Enter or click Send.
5. Optionally enable encryption for private chats.
6. Messages are stored in-memory and vanish on refresh.

## Deployment

Simply upload the entire `ghostchat` folder to any static hosting service:

- GitHub Pages
- Netlify
- Firebase Hosting
- Vercel
- Any web server

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Encryption**: Web Crypto API (AES-GCM)
- **Hosting**: Static files only

## Privacy

- All data stays in your browser.
- No server-side storage.
- Encryption is client-side only.
- Messages disappear on page refresh or close.

## Development

To run locally:

```bash
cd ghostchat
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Future Enhancements

- Multi-device support using WebRTC (requires signaling server)
- Message persistence options
- File sharing
- User avatars/names

## Warning
- Don't use for criminal purpose thanks
