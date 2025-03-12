import { defineStore } from 'pinia';
import { Moniter as Monitor, Usage } from '@bytetrade/core';
import axios from 'axios';
import { useTokenStore } from './token';

export type MonitorStoreState = {
  usages: Usage[];
};

export const useMonitorStore = defineStore('monitor', {
  state: () => {
    return {
      usages: []
    } as MonitorStoreState;
  },
  getters: {},
  actions: {
    async loadMonitor() {
      const tokenStore = useTokenStore();

      const data: Monitor = await axios.get(
        tokenStore.url + '/api/monitor/cluster',
        {}
      );

      this.usages = [];
      this.usages.push(data.cpu);
      this.usages.push(data.memory);
      this.usages.push(data.disk);

      this.usages[0].name = 'cpu';
      this.usages[0].color = 'yellow-12';
      this.usages[1].name = 'memory';
      this.usages[1].color = 'light-green-13';
      this.usages[2].name = 'disk';
      this.usages[2].color = 'light-blue-13';
    }
  }
});
