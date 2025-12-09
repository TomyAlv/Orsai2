
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "route": "/login"
  },
  {
    "renderMode": 0,
    "route": "/register"
  },
  {
    "renderMode": 0,
    "route": "/matches"
  },
  {
    "renderMode": 0,
    "route": "/match/*"
  },
  {
    "renderMode": 0,
    "route": "/profile"
  },
  {
    "renderMode": 0,
    "route": "/user/*"
  },
  {
    "renderMode": 0,
    "route": "/admin"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 725, hash: 'ee42f01eb83817282fd71fe593e9378cc9f0ceb0b40f17bd2795285316aa53b6', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1265, hash: '61a299b77a9904c66f2d2552573ab21689a93ec536e0f64642f86fbc5376aea1', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)}
  },
};
