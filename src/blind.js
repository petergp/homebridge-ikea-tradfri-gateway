"use strict";
var Device   = require('./device.js');

module.exports = class Blind extends Device {

    constructor(platform, device) {
        super(platform, device);

        this.blind = new this.Service.WindowCovering(this.name, this.uuid);

        this.addService('blind', this.blind);
        this.enablePosition();
        this.enableTargetPosition();
        this.previousPosition = this.position;
    }

    deviceChanged(device) {
        super.deviceChanged();
        this.updatePosition();
        this.estimateTargetPositionIfNeeded();
        this.previousPosition = this.position;
    }

    enablePosition() {
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition)
        position.on('get', (callback) => {
            callback(null, this.position);
        });
        this.updatePosition();
    }

    enableTargetPosition() {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition);
        targetPosition.on('get', (callback) => {
            callback(null, this.targetPosition);
        });
        targetPosition.on('set', (value, callback) => {
            this.setTargetPosition(value, callback);
        });
        this.updateTargetPosition(this.position);
    }

    setTargetPosition(value, callback) {
        this.log('Setting target position to %s on blind \'%s\'', value, this.name);
        this.position = value;
        this.targetPosition = value;
        this.platform.gateway.operateBlind(this.device, {
            position: 100 - value
        })
        .then(() => {
            if (callback)
                callback();
        });
    }

    estimateTargetPositionIfNeeded() {
        let position = this.position;
        let increasing = this.previousPosition < position && this.targetPosition < position;
        let decreasing = this.previousPosition > position && this.targetPosition > position;
        if (increasing) {
            this.updateTargetPosition(100);
        } else if (decreasing) {
            this.updateTargetPosition(0);
        }

        setTimeout(() => {
            // If no new position we can assume that blinds has been stopped
            if (this.position === position) {
                this.updateTargetPosition(this.position);
            }
        }, 2000);
    }

    updatePosition() {
        var blind = this.device.blindList[0];
        var position = this.blind.getCharacteristic(this.Characteristic.CurrentPosition);
        this.position = 100 - blind.position;
        this.log('Updating position to %s on blind \'%s\'', this.position, this.name);
        position.updateValue(this.position);
    }

    updateTargetPosition(position) {
        var targetPosition = this.blind.getCharacteristic(this.Characteristic.TargetPosition);
        this.targetPosition = position;
        this.log('Updating target position to %s on blind \'%s\'', this.targetPosition, this.name);
        targetPosition.updateValue(this.targetPosition);
    }
};