// export function bind(obj: any, evname: any, fn: any) {
// 	if (obj.addEventListener) {
// 		obj.addEventListener(evname, fn, false);
// 	} else {
// 		obj.attachEvent('on' + evname, function () {
// 			fn.call(obj);
// 		});
// 	}
// }

// export function onload() {
// 	bind(window, 'message', function (e: any) {
// 		console.log(e);
// 		// const data = JSON.parse(e.data);
// 	});
// }

export function isIPHost(url: string): boolean {
  if (url.startsWith('http://')) {
    url = url.substring(7);
  } else if (url.startsWith('https://')) {
    url = url.substring(8);
  }

  const res: string[] = url.split('.');
  if (res.length == 0) {
    return false;
  }

  try {
    const r: number = parseInt(res[0]);
    if (isNaN(r)) {
      return false;
    }

    if (r >= 0 && r <= 255) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}

export function isLocalHost(url: string): boolean {
  if (url.startsWith('http://localhost')) {
    return true;
  } else if (url.startsWith('https://localhost')) {
    return true;
  }

  return false;
}

export function sizeFormat(size: number) {
  let data = '';
  if (size < 0.1 * 1024) {
    //	B
    data = size.toFixed(2) + ' B';
  } else if (size < 0.1 * 1024 * 1024) {
    //	KB
    data = (size / 1024).toFixed(2) + ' KB';
  } else if (size < 0.1 * 1024 * 1024 * 1024) {
    //	MB
    data = (size / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    //	GB
    data = (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
  const sizeStr = data + '';
  const len = sizeStr.indexOf('.');
  const dec = sizeStr.substr(len + 1, 2);
  if (dec == '00') {
    return sizeStr.substring(0, len) + sizeStr.substr(len + 3, 2);
  }
  return sizeStr;
}

export function borderRadiusFormat(width: number, height: number) {
  return Math.round(width * 0.28);
}

export function debounce(fn: (...args: any[]) => any, delay: number) {
  let timeout: number;

  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  };
}
