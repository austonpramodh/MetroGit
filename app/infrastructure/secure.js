const keytar = require('keytar');
const app = 'MetroGit'
const { ipcMain } = require('electron');
var window = null;

function init(win) {
    window = win;
    ipcMain.on('Secure-ClearCache', (event, arg) => {
        clearCache().then(() => {
            event.sender.send('Secure-CacheCleared');
        });
    })
}

function getPass(account) {
    return keytar.getPassword(app, account).then(result => {
        if(!result) {
            return "";
        } else {
            return result;
        }
    });
}

function setPass(account, password) {
    return keytar.setPassword(app, account, password).catch(err => {
        window.webContents.send('Secure-SetPasswordFailed', { error: 'GENERIC', detail: err });
    });
}

function clearCache() {
    return keytar.findCredentials(app).then(creds => {
        let reqs = [];
        creds.forEach((c) => {
            reqs.push(keytar.deletePassword(app, c.account));
        });
        return Promise.all(reqs);
    }).catch(err => {
        window.webContents.send('Secure-ClearCacheFailed', { error: 'GENERIC', detail: err });
    });
}

module.exports = {
    getPass: getPass,
    setPass: setPass,
    init: init,
    clearCache: clearCache
}