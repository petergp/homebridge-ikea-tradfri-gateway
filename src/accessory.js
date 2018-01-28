"use strict";

var Events = require('events');


module.exports = class Accessory extends Events {

    constructor(platform, name, id) {

        super();

        this.name = name;
        this.id = id;
        this.platform = platform;
        this.uuid = this.generateUUID(id + 'IKEA');
        this.log = platform.log;
        this.homebridge = platform.homebridge;
        this.Characteristic = platform.homebridge.hap.Characteristic;
        this.Service = platform.homebridge.hap.Service;
        this.services = {};
    }

    generateUUID(id) {
        return this.platform.homebridge.hap.uuid.generate(id.toString());
    }

    addAccessoryInformation() {
        var service = new this.Service.AccessoryInformation();

        var manufacturer = this.getManufacturer();
        var model = this.getModel();
        var firmwareVersion = this.getFirmwareVersion();
        var serialNumber = this.getSerialNumber();

        if (manufacturer)
            service.setCharacteristic(this.Characteristic.Manufacturer, manufacturer);

        if (model)
            service.setCharacteristic(this.Characteristic.Model, model);

        if (firmwareVersion)
            service.setCharacteristic(this.Characteristic.FirmwareRevision, firmwareVersion);

        if (serialNumber)
            service.setCharacteristic(this.Characteristic.SerialNumber, serialNumber);


        this.addService('deviceInfo', service);

    }

    getManufacturer() {
    }

    getModel() {
    }

    getFirmwareVersion() {
    }

    getSerialNumber() {
        return this.id;
    }

    addService(name, service) {
        this.services[name] = service;
    }

    identify(callback) {
        this.log('Identify called for accessory \'%s\'.', this.name);
        callback();
    }

    getServices() {
        var services = [];

        for (var id in this.services) {
            services.push(this.services[id]);
        }

        return services;
    }

};
