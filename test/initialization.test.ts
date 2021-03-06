import assert = require('assert');
import vscode = require('vscode');

import * as Extension from '../src/extension';
import ConnectionManager from '../src/controllers/connectionManager';
import MainController from '../src/controllers/mainController';
import Telemetry from '../src/models/telemetry';

function ensureExtensionIsActive(): Promise<any> {
    return new Promise((resolve, reject) => {
        waitForExtensionToBeActive(resolve);
    });
}

function waitForExtensionToBeActive(resolve): void {
    if (typeof(vscode.extensions.getExtension('ms-mssql.mssql')) === 'undefined' ||
        !vscode.extensions.getExtension('ms-mssql.mssql').isActive) {
        setTimeout(waitForExtensionToBeActive.bind(this, resolve), 50);
    } else {
        resolve();
    }
}

suite('Initialization Tests', () => {
    setup(() => {
        // Ensure that telemetry is disabled while testing
        Telemetry.disable();
    });

    test('Connection manager is initialized properly', function(done): void { // Note: this can't be an arrow function (=>), otherwise this.timeout() breaks
        this.timeout(10000); // Service installation usually takes a bit longer than the default 2000ms on a fresh install

        // Force the extension to activate by running one of our commands
        vscode.commands.executeCommand('extension.connect');

        // Wait for the extension to activate
        ensureExtensionIsActive().then(() => {
            // Verify that the connection manager was initialized properly
            let controller: MainController = Extension.getController();
            let connectionManager: ConnectionManager = controller.connectionManager;
            assert.notStrictEqual(undefined, connectionManager.client);
            done();
        });
    });
});
