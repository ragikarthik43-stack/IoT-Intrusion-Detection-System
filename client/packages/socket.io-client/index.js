/**
 * Lightweight browser Socket.IO client compatible with Socket.IO v4 protocol.
 */
class Socket {
  constructor(uri, options = {}) {
    this.uri = uri || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    this.options = options;
    this.connected = false;
    this.id = null;
    this.listeners = new Map();
    this.ws = null;
    this.reconnectTimer = null;
    this.connect();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      if (callback) {
        this.listeners.get(event).delete(callback);
      } else {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  emit(event, ...args) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const payload = `42${JSON.stringify([event, ...args])}`;
        this.ws.send(payload);
      } catch (err) {
        // Silently handle send errors
      }
    }
    return this;
  }

  _trigger(event, ...args) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      }
    }
  }

  connect() {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return this;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return this;
    }

    try {
      const wsUrl = this.uri.replace(/^http/, 'ws') + '/socket.io/?EIO=4&transport=websocket';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Wait for Engine.IO handshake packet '0'
      };

      this.ws.onmessage = (event) => {
        const data = String(event.data);
        if (!data) return;

        // Engine.IO handshake: 0{"sid":"...", ...}
        if (data.startsWith('0')) {
          try {
            const handshake = JSON.parse(data.slice(1));
            this.id = handshake.sid;
          } catch (e) {}
          // Send Socket.IO connect packet: 40
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('40');
          }
        }
        // Ping: 2 -> Pong: 3
        else if (data === '2') {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('3');
          }
        }
        // Socket.IO connected: 40{"sid":"..."}
        else if (data.startsWith('40')) {
          this.connected = true;
          this._trigger('connect');
        }
        // Socket.IO event: 42["eventName", data]
        else if (data.startsWith('42')) {
          try {
            const parsed = JSON.parse(data.slice(2));
            const [eventName, ...eventArgs] = parsed;
            this._trigger(eventName, ...eventArgs);
          } catch (e) {
            console.error('Failed to parse socket message:', e);
          }
        }
        // Socket.IO disconnect: 41
        else if (data.startsWith('41')) {
          this._handleDisconnect();
        }
      };

      this.ws.onerror = () => {
        this._handleDisconnect();
      };

      this.ws.onclose = () => {
        this._handleDisconnect();
      };
    } catch (e) {
      this._handleDisconnect();
    }

    return this;
  }

  _handleDisconnect() {
    if (this.connected) {
      this.connected = false;
      this._trigger('disconnect');
    }
    // Attempt reconnect after delay if not explicitly destroyed
    if (!this.reconnectTimer && !this._destroyed) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 5000);
    }
  }

  disconnect() {
    this._destroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    if (this.connected) {
      this.connected = false;
      this._trigger('disconnect');
    }
    return this;
  }

  close() {
    return this.disconnect();
  }
}

export function io(uri, options) {
  return new Socket(uri, options);
}

export { Socket };
export default io;
