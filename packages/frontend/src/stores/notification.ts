import { defineStore } from 'pinia';

interface NotifyType {
  id: number;
  title: string;
  message: string;
  icon: string;
}

interface NotifyAppType {
  id: number;
  application: string;
  icon: string;
  open?: boolean;
  children: NotifyType[];
}

export type DataState = {
  data: NotifyAppType[];
  showNotification: boolean;
};

export const useNotificationStore = defineStore('notification', {
  state: () => {
    return {
      showNotification: false,
      data: [
        {
          id: 1,
          application: 'devBox',
          children: [
            {
              id: 1,
              title: 'Trading information1',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            },
            {
              id: 2,
              title: 'Trading information2',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            },
            {
              id: 3,
              title: 'Trading information3',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            }
          ]
        },
        {
          id: 2,
          application: 'Files',
          children: [
            {
              id: 1,
              title: 'Trading information1',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            },
            {
              id: 2,
              title: 'Trading information2',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            },
            {
              id: 3,
              title: 'Trading information3',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            }
          ]
        },
        {
          id: 3,
          application: 'Vault',
          children: [
            {
              id: 1,
              title: 'Trading information1',
              message:
                'Your transaction on Sep 6 was successful, please go to the Dapp to view the transaction details.'
            }
          ]
        }
      ]
    } as DataState;
  },
  getters: {},
  actions: {
    get() {
      this.data = localStorage.getItem('notification')
        ? JSON.parse(localStorage.getItem('notification') || '')
        : [];
    },

    put(value: any) {
      this.data.push(value);
      localStorage.setItem('notification', JSON.stringify(this.data));
    },

    delete(appName: string, itemId?: number) {
      const newData = [];
      for (let index = 0; index < this.data.length; index++) {
        const item = this.data[index];
        if (item.application === appName) {
          if (item.children.length <= 1) continue;
          if (!itemId) continue;

          const newItemChildren = [];
          for (let inx = 0; inx < item.children.length; inx++) {
            const cell = item.children[inx];
            if (cell.id == itemId) {
              continue;
            }
            newItemChildren.push(cell);
          }
          item.children = newItemChildren;
        }

        newData.push(item);
      }

      this.data = newData;
    },

    deleteAll() {
      this.data = [];
      localStorage.removeItem('notification');
    }
  }
});
