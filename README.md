# n9e-fe
This is the web project for N9E

## Usage
The built pub folder can work in the [n9e](https://github.com/didi/nightingale).

you can deploy the front-end code independently, just replace the pub with the new release.


## Dependencies

```
node: v16.13.0
npm: 8.1.0
```
The lower version maybe works, I am not sure.

## Installation

```
npm install
```

## Start

```
npm run dev
```
The back-end api proxy config is https://github.com/n9e/fe-v5/blob/master/vite.config.ts#L45
## Build

```
npm run build
```

## Branch and Version

The **rc version** is on master branch ,from 5.1.4 tag

## Nginx Server
```
server {
    listen       8765;
    server_name  _;

    add_header Access-Control-Allow-Origin *;
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    root   front-end/page/path;    # e.g. /root/n9e/pub;

    location / {
        root front-end/page/path;    # e.g. /root/n9e/pub;
        try_files $uri /index.html;
    }
   location /api/ {
        proxy_pass http://n9e.api.server;   # e.g. 127.0.0.1:18000 
    }
}
```

## Notice

- `vite.config.js` and `tsconfig.json` should both configure to make sure alias works
- Add `"css.validate": false` in vscode setting.json to ignore the css warning 


