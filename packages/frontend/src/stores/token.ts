import { defineStore } from 'pinia';
import axios from 'axios';
import { Cookies } from 'quasar';
import { TerminusInfo, DefaultTerminusInfo } from '@bytetrade/core';
import { v4 as uuidv4 } from 'uuid';
import { Encoder, DeviceType } from '@bytetrade/core';

export interface DesktopConfig {
  bg: string;
}

export type RootState = {
  url: string | null;
  config: DesktopConfig;
  terminus: TerminusInfo;
  id: string | null;
  deviceInfo: {
    device: DeviceType;
    isVerticalScreen: boolean;
  };
};

export const useTokenStore = defineStore('token', {
  state: () => {
    return {
      url: null,
      config: {},
      terminus: DefaultTerminusInfo,
      id: null,
      deviceInfo: {
        device: DeviceType.DESKTOP,
        isVerticalScreen: false
      }
    } as RootState;
  },
  getters: {},
  actions: {
    async loadData() {
      this.id = localStorage.getItem('desktop-id');
      if (!this.id) {
        this.id = uuidv4();
        localStorage.setItem('desktop-id', this.id);
      }
      const data: any = await axios.get(this.url + '/server/init', {});
      this.terminus = data.terminus;
      this.config = data.config;
    },

    async updateDesktopConfig(config: any) {
      const data: any = await axios.post(
        this.url + '/server/updateConfig',
        config
      );

      this.config = data;
    },

    async logout() {
      try {
        await axios.post(this.url + '/api/logout');
      } catch (e) {
        return e;
      }
    },

    async refresh_token() {
      try {
        const auth_token = Cookies.get('auth_token');
        if (!auth_token) {
          return;
        }
        const mid = auth_token.split('.')[1];
        if (!mid) {
          return;
        }

        const ob: any = JSON.parse(
          Encoder.bytesToString(Encoder.base64UrlToBytes(mid))
        );

        const now = Math.floor(new Date().getTime() / 1000);

        const diff = Number(ob.exp) - now;
        if (diff < 3600 * 180) {
          const refresh_token = Cookies.get('auth_refresh_token');
          if (refresh_token) {
            await axios.post(this.url + '/api/refresh', {
              refreshToken: refresh_token
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    },

    setUrl(new_url: string | null) {
      this.url = new_url;
    },

    async pingLoadData(url: string): Promise<boolean> {
      if (!url.endsWith('/')) url += '/';
      try {
        await axios.get(`${url}server/init`, {
          timeout: 1000,
          withCredentials: true
        });
        return true;
      } catch (error) {
        return false;
      }
    }
  }
});
