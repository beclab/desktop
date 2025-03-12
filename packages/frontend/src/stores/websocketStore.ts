import { defineStore } from 'pinia';
import { uid } from 'quasar';

import {
  WebSocketStatusEnum,
  WebSocketBean,
  MessageTopic
} from '@bytetrade/core';
import { bus } from '../utils/bus';
import { useTokenStore } from './token';
import { useAppStore } from './app';
import { useUpgradeStore } from './upgrade';
export interface WebSocketState {
  websocket: WebSocketBean | null;
}

function generateSocketId() {
  const shaResult = uid().replaceAll('-', '');
  let result = 0;
  for (let i = 0; i < 8; i++) {
    const number = parseInt('0' + shaResult[i]);
    result = result * 16 + number;
  }
  return Math.floor(result);
}

const loginID = generateSocketId();

export const useSocketStore = defineStore('counter', {
  state: () => {
    return {
      websocket: null
    } as WebSocketState;
  },

  actions: {
    start() {
      if (this.isConnecting() || this.isConnected()) {
        return;
      }

      if (this.websocket) {
        this.websocket.start();
        return;
      }

      let ws_url = process.env.WS_URL || window.location.origin + '/ws';

      if (ws_url.startsWith('http://')) {
        ws_url = ws_url.substring(7);
        ws_url = 'ws://' + ws_url;
      } else if (ws_url.startsWith('https://')) {
        ws_url = ws_url.substring(8);
        ws_url = 'wss://' + ws_url;
      }

      this.websocket = new WebSocketBean({
        url: ws_url,
        needReconnect: true,
        heartSend: JSON.stringify({
          event: 'ping'
        }),
        heartGet: JSON.stringify({
          event: 'pong'
        }),
        onopen: async () => {
          this.send({
            event: 'login',
            data: { id: loginID }
          });
        },
        onmessage: (ev) => {
          try {
            const message = JSON.parse(ev.data);
            console.log('WebSocketBean onmessage', message);

            if (message.topic == MessageTopic.Data) {
              if (message.event == 'updateConfig') {
                const tokenStore = useTokenStore();
                tokenStore.config = message.message.data;
              }
            } else {
              if (message.event == 'app_installation_event') {
                bus.emit('app_installation_event', message);
              } else if (message.event == 'system_upgrade_event') {
                bus.emit('system_upgrade_event', message.data);
              } else if (message.event == 'ai') {
                bus.emit('ai', message);
              } else if (message.event == 'ai_message') {
                bus.emit('ai_message', message);
              } else if (message.event == 'intent') {
                bus.emit('intent', message.data);
              } else if (message.event == 'n') {
                bus.emit('notification', message.data);
              } else if (message.event == 'entrance_state_event') {
                bus.emit('entrance_state_event', message);
              }
            }
          } catch (e) {
            console.log('message error');
            console.log(e);
          }
        },
        onerror: () => {
          console.log('socket error');
        },
        onreconnect: () => {
          console.log('socket reconnecting');
        },
        onReconnectSuccess: async () => {
          console.log('socket success reconnect');
          const upgradeStore = useUpgradeStore();
          const appStore = useAppStore();
          upgradeStore.update_upgrade_state_info();
          appStore.get_my_apps_info();
        },
        onReconnectFailure: () => {
          console.log('socket fail reconnect');
        }
      });
      this.websocket.start();
      console.log('socket start !!!!');
    },

    isConnected() {
      if (!this.websocket) {
        return false;
      }
      return this.websocket.status == WebSocketStatusEnum.open;
    },
    isConnecting() {
      if (!this.websocket) {
        return false;
      }
      return this.websocket.status == WebSocketStatusEnum.load;
    },
    isClosed() {
      if (!this.websocket) {
        return true;
      }
      return this.websocket.status == WebSocketStatusEnum.close;
    },
    send(data: any, resend = false) {
      if (!this.websocket) {
        return;
      }
      const sendResult = this.websocket!.send(data, resend);
      return sendResult;
    },
    restart() {
      if (this.websocket) {
        this.websocket!.dispose();
      }
      this.start();
    },
    dispose() {
      if (this.websocket) {
        this.websocket!.dispose();
      }
      this.websocket = null;
    }
  }
});
