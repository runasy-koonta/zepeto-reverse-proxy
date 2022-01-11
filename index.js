const http = require('http');
const request = require('request');
const readline = require('readline');
const qrcode = require('qrcode-terminal');

const proxyPort = 8080;

const readlinePromise = (query) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const requestPromise = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

const requestMyExternalIP = async () => {
  const url = 'https://wtfismyip.com/text';
  return (await requestPromise(url)).replace(/\n/g, '').replace(/\r/g, '');
};

(async () => {
  let originalPort = -1, newServer = '', gatewayPort = -1;
  try {
    let zepetoURL;
    if (process.argv.length > 2) {
      zepetoURL = process.argv[2];
      console.log('Using ZEPETO World URL:', zepetoURL);
    } else {
      zepetoURL = await readlinePromise('Please paste ZEPETO World URL: ');
    }

    const t1 = zepetoURL.split('ZEPETO://GAMESYSTEM/pretest/pretest?worldMeta=')[1];
    const t2 = t1.split('&')[0];
    const url = decodeURIComponent(t2);

    originalPort = parseInt(url.split(':')[2]);

    const g1 = zepetoURL.split('&gatewayPort=')[1];
    const g2 = g1.split('&')[0];

    gatewayPort = parseInt(g2);
  } catch (err) {
    console.log('Failed to parse ZEPETO World URL. Aborting.');
    process.exit(1);
  }

  if (gatewayPort === -1 || originalPort === -1) {
    console.log('Failed to parse ZEPETO World URL. Aborting.');
    process.exit(1);
  }

  if (process.argv.length > 3) {
    newServer = process.argv[3];
    console.log('Using server IP:', newServer);
  } else {
    newServer = await readlinePromise(`Please enter new server IP (Your external IP is ${await requestMyExternalIP()}): `);
  }

  http.createServer(async (req, res) => {
    if (req.url === '/') {
      try {
        const originalResponse = await requestPromise(`http://localhost:${originalPort}/`);
        if (typeof originalResponse !== 'string') {
          console.log('Invalid response from original server:', originalResponse);
          res.writeHead(500);
          return res.end();
        }
        const originalMetaData = JSON.parse(originalResponse);

        const targetKeys = [
          'assetBundleIos',
          'assetBundleAndroid',
          'assetBundleAndroid',
          'assetBundleOsx',
          'assetBundleWindows',
          'assetBundleWindows'
        ];
        for (const key in originalMetaData) {
          if (targetKeys.includes(key)) {
            const href = originalMetaData[key].split('/').pop();
            originalMetaData[key] = `http://${newServer}:${originalPort}/${href}`;
          }
        }

        res.write(JSON.stringify(originalMetaData));
        console.log('Client requested metadata', req.connection.remoteAddress);
        return res.end();
      } catch (err) {
        console.log('Invalid response from original server.');
        res.writeHead(500);
        return res.end();
      }
    } else {
      res.end();
    }
  }).listen(proxyPort);

  console.log(`Reverse proxy for ZEPETO World is running on port ${proxyPort}!`);
  qrcode.generate(`ZEPETO://GAMESYSTEM/pretest/pretest?worldMeta=${encodeURIComponent(`http://${newServer}:${proxyPort}`)}&gatewayHost=${newServer}&gatewayPort=${gatewayPort}&gatewaySecured=false`, {small: true});
})();
