// GhostChat - Ephemeral Chat Application

class GhostChat {
    constructor() {
        this.roomCode = null;
        this.messages = [];
        this.encryptionEnabled = false;
        this.cryptoKey = null;

        this.init();
    }

    init() {
        this.bindElements();
        this.checkRoomCode();
        this.setupEventListeners();
    }

    bindElements() {
        this.roomCodeElement = document.getElementById('room-code');
        this.copyCodeBtn = document.getElementById('copy-code');
        this.joinCodeInput = document.getElementById('join-code');
        this.joinBtn = document.getElementById('join-btn');
        this.chatSection = document.getElementById('chat-section');
        this.roomSection = document.getElementById('room-section');
        this.messagesElement = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.encryptToggle = document.getElementById('encrypt-toggle');
    }

    setupEventListeners() {
        this.copyCodeBtn.addEventListener('click', () => this.copyRoomCode());
        this.joinBtn.addEventListener('click', () => this.joinRoom());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.encryptToggle.addEventListener('change', (e) => {
            this.encryptionEnabled = e.target.checked;
            if (this.encryptionEnabled) {
                this.deriveKey();
            }
        });
    }

    checkRoomCode() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.roomCode = hash;
            this.enterChat();
        } else {
            this.generateRoomCode();
        }
    }

    generateRoomCode() {
        this.roomCode = this.generateRandomCode();
        this.roomCodeElement.textContent = this.roomCode;
        window.location.hash = this.roomCode;
    }

    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomCode).then(() => {
            this.copyCodeBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyCodeBtn.textContent = 'Copy Code';
            }, 2000);
        });
    }

    joinRoom() {
        const code = this.joinCodeInput.value.trim().toUpperCase();
        if (code) {
            this.roomCode = code;
            window.location.hash = code;
            this.enterChat();
        }
    }

    enterChat() {
        this.roomSection.style.display = 'none';
        this.chatSection.style.display = 'block';
        this.roomCodeElement.textContent = this.roomCode;
        this.deriveKey();
        this.displayMessages();
    }

    async deriveKey() {
        if (!this.encryptionEnabled) return;

        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(this.roomCode),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        this.cryptoKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('ghostchat-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        const message = {
            text: text,
            timestamp: Date.now(),
            encrypted: this.encryptionEnabled
        };

        if (this.encryptionEnabled) {
            message.text = await this.encryptMessage(text);
        }

        this.messages.push(message);
        this.displayMessages();
        this.messageInput.value = '';
        this.messageInput.focus();
    }

    async encryptMessage(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.cryptoKey,
            data
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    async decryptMessage(encryptedText) {
        try {
            const combined = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                this.cryptoKey,
                encrypted
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return '[Encrypted message]';
        }
    }

    async displayMessages() {
        this.messagesElement.innerHTML = '';

        for (const message of this.messages) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';

            let displayText = message.text;
            if (message.encrypted && this.encryptionEnabled) {
                displayText = await this.decryptMessage(message.text);
            } else if (message.encrypted) {
                displayText = '[Encrypted message - enable encryption to view]';
            }

            messageElement.textContent = displayText;
            this.messagesElement.appendChild(messageElement);
        }

        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GhostChat();
});
