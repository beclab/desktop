import axios, { AxiosInstance } from 'axios';
import { parse } from 'cookie';

export function createInstance(request: Request): AxiosInstance {
  let token = request.headers['x-authorization'];
  console.log('x-authorization: ' + token);
  const host = request.headers['host'];
  if (!host) {
    throw Error('host error');
  }

  const rawCookie = request.headers['cookie'];
  console.log(rawCookie);

  if (token || rawCookie) {
    if (!token) {
      const cookies = parse(rawCookie);
      console.log(cookies);
      token = cookies['auth_token'];
      console.log(token);
    }

    if (!token) {
      throw Error('token error');
    }

    return axios.create({
      baseURL: process.env.BFL || 'http://bfl',
      timeout: 5000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'X-Authorization': token,
        'Client-Host': host,
      },
    });
  } else {
    return axios.create({
      baseURL: process.env.BFL || 'http://bfl',
      timeout: 5000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Client-Host': host,
      },
    });
  }
}

export function getRequestToken(request: Request): string | null {
  let token = request.headers['x-authorization'];
  console.log('x-authorization: ' + token);
  const host = request.headers['host'];
  if (!host) {
    return null;
  }

  const rawCookie = request.headers['cookie'];
  console.log(rawCookie);

  if (token || rawCookie) {
    if (!token) {
      const cookies = parse(rawCookie);
      console.log(cookies);
      token = cookies['auth_token'];
      console.log(token);
    }

    return token;
  } else {
    return null;
  }
}

export function createSearchInstance(request: Request): AxiosInstance {
  console.log(request.headers);
  const bflUser = request.headers['x-bfl-user'];
  if (!bflUser) {
    throw Error('bflUser error');
  }
  console.log('x-bfl-user: ' + bflUser);
  const host = request.headers['host'];
  if (!host) {
    throw Error('host error');
  }

  return axios.create({
    baseURL: process.env.SEARCH_URL || 'http://search3.os-system:80',
    timeout: 5000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json',
      'x-bfl-user': bflUser,
      'Client-Host': host,
    },
  });
}

export function createSeafileInstance(request: Request): AxiosInstance {
  console.log(request.headers);
  const bflUser = request.headers['x-bfl-user'];
  if (!bflUser) {
    throw Error('bflUser error');
  }
  console.log('x-bfl-user: ' + bflUser);
  const host = request.headers['host'];
  if (!host) {
    throw Error('host error');
  }

  return axios.create({
    baseURL: process.env.SEARCH_URL || 'http://search3.os-system:80',
    timeout: 5000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json',
      'x-bfl-user': bflUser,
      'Client-Host': host,
    },
  });
}
