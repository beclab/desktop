import { defineStore } from 'pinia';
import axios from 'axios';
import { useTokenStore } from './token';
import { UpgradeState } from '@desktop/core/src/types';

export type UpgradeStateStore = {
  state: UpgradeState;
};

export const useUpgradeStore = defineStore('upgrade', {
  state: () => {
    return {
      state: UpgradeState.NotRunning
    } as UpgradeStateStore;
  },
  getters: {},
  actions: {
    async update_upgrade_state_info() {
      const tokenStore = useTokenStore();
      //if (!tokenStore.token) return;
      let modeStr = '';
      if (localStorage.getItem('dev_mode')) {
        modeStr = '?dev_mode=true';
      }
      try {
        const data: any = await axios.get(
          tokenStore.url + '/server/upgrade/state' + modeStr,
          {}
        );
        this.state = data.state;
      } catch (error) {
        console.log('update_upgrade_state_info error', error);
      }
    }
  }
});
