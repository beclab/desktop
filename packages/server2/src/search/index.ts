//import axios from 'axios';
import {
  FileSearchAIQuestionRequest,
  FileSearchQueryRequest,
  FileSearchResponse,
  FileSearchAddRequest,
  FileSearchDeleteRequest,
} from '@bytetrade/core';
//const bcrypt = require('bcrypt');
//import * as bcrypt from 'bcrypt';

export const bflUrl = process.env.BFL || 'http://bfl';

// const providerUrl = 'http://' + process.env.OS_SYSTEM_SERVER;
// const OS_APP_KEY = process.env.OS_APP_KEY;
// const OS_APP_SECRET = process.env.OS_APP_SECRET;

// console.log('providerUrl ' + providerUrl);
// console.log('OS_APP_KEY' + OS_APP_KEY);
// console.log('OS_APP_SECRET' + OS_APP_SECRET);

// export async function getAccessToken(
//   group: string,
//   dataType: string,
//   op: string,
// ) {
//   const instance = axios.create({
//     baseURL: providerUrl,
//     timeout: 10000,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//     },
//   });

//   const timestamp = (new Date().getTime() / 1000).toFixed(0);
//   const text = OS_APP_KEY! + timestamp + OS_APP_SECRET;
//   const token = await bcrypt.hash(text, 10);

//   console.log('token ' + token);

//   const response = await instance.post('/permission/v1alpha1/access', {
//     app_key: OS_APP_KEY,
//     timestamp: Number(timestamp),
//     token: token,
//     perm: {
//       group,
//       dataType: dataType,
//       version: 'v1',
//       ops: [op],
//     },
//   });
//   console.log(response);
//   if (!response || response.status != 200 || !response.data) {
//     throw Error('Network error, error 10001');
//   }

//   const data = response.data;
//   if (data.code === 0) {
//     return data.data.access_token;
//   }

//   throw Error('Network error, error 10002');
// }

// export async function query(token: string, data: FileSearchQueryRequest) {
//   const instance = axios.create({
//     baseURL: providerUrl,
//     timeout: 3000,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//       'X-Access-Token': token,
//     },
//   });

//   const url = '/system-server/v1alpha1/files/service.files/v1/Query';

//   const response = await instance.post(url, data);

//   if (!response) {
//     throw Error('Network error, error 10003');
//     //return { code: 3, data: [] };
//   }
//   console.log(response.data);
//   if (response.status == 404) {
//     return {
//       count: 0,
//       offset: data.offset ? data.offset : 0,
//       limit: data.limit ? data.limit : 0,
//       items: [],
//     };
//   }

//   if (response.status != 200 || !response.data) {
//     //return [];
//     throw Error('Network error, error 10004');
//   }

//   if (response.data.code != 0) {
//     console.log('error');
//     console.log(response.data);
//     throw Error('Network error, error');
//   }

//   const res = response.data.data;
//   console.log('query result');
//   console.log(res);
//   if (res.code === 0) {
//     return res.data;
//   }
//   throw Error('Network error, res.code ' + res.code);
// }

// export async function question_ai(
//   token: string,
//   data: FileSearchAIQuestionRequest,
// ) {
//   const instance = axios.create({
//     baseURL: providerUrl,
//     timeout: 5000 * 60,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//       'X-Access-Token': token,
//     },
//   });

//   const url = '/system-server/v1alpha1/search/service.search/v1/QuestionAI';

//   const response = await instance.post(url, data);

//   if (!response) {
//     //throw Error('Network error, error 10003');
//     //return { code: 3, data: [] };
//     throw Error('Network error, error');
//   }
//   if (response.status == 404) {
//     throw Error('Network error, error');
//   }

//   if (response.status != 200 || !response.data) {
//     //return [];
//     //throw Error('Network error, error 10004');
//     throw Error('Network error, error');
//   }

//   if (response.data.code != 0) {
//     console.log('error');
//     console.log(response.data);
//     throw Error('Network error, error');
//   }

//   const res = response.data.data;
//   console.log('query ai result');
//   console.log(res);
//   if (res.code === 0) {
//     return res.data;
//   }

//   throw Error('Network error, res.code ' + res.code);
// }

// export async function add_content(token: string, data: FileSearchAddRequest) {
//   const instance = axios.create({
//     baseURL: providerUrl,
//     timeout: 5000,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//       'X-Access-Token': token,
//     },
//   });

//   const url = '/system-server/v1alpha1/search/service.search/v1/Input';
//   console.log(url);
//   console.log(data);

//   const response = await instance.post(url, data);
//   if (!response || response.status != 200 || !response.data) {
//     throw Error('Network error, error 10003');
//   }

//   const res = response.data.data;
//   console.log(res);
//   if (res.code === 0) {
//     return res.data;
//   }

//   throw Error('Network error, error 10004');
// }

// export async function remove_content(
//   token: string,
//   data: FileSearchDeleteRequest,
// ) {
//   const instance = axios.create({
//     baseURL: providerUrl,
//     timeout: 3000,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//       'X-Access-Token': token,
//     },
//   });

//   const url = '/system-server/v1alpha1/search/service.search/v1/Delete';

//   const response = await instance.post(url, data);
//   if (!response || response.status != 200 || !response.data) {
//     throw Error('Network error, error 10003');
//   }

//   const res = response.data.data;
//   if (res.code === 0) {
//     return res.data;
//   }

//   throw Error('Network error, error 10004');
// }
