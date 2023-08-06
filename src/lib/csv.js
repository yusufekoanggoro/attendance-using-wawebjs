const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const wrapper = require('./utils/wrapper');
const logger = require('./logger');

class CSVHandler {
  constructor(csvFilePath) {
    this.csvData = [];
    this.csvFilePath = csvFilePath;
  }

  async readData() {
    try {
      const dataArray = [];
      const stream = fs.createReadStream(this.csvFilePath);

      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (data) => {
            dataArray.push(data);
          })
          .on('end', () => {
            resolve(dataArray);
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      this.csvData = dataArray;
      return wrapper.data(this.csvData);
    } catch (error) {
      return wrapper.error(error);
    }
  }

  async writeData() {
    try {
      const csvWriter = createCsvWriter({
        path: this.csvFilePath,
        header: Object.keys(this.csvData[0]).map((field) => ({ id: field, title: field })),
      });
      const writeFile = await csvWriter.writeRecords(this.csvData);
      return wrapper.data(writeFile);
    } catch (error) {
      return wrapper.error(error);
    }
  }

  createRecord(newRecord) {
    this.csvData.push(newRecord);
  }

  async readAllRecords() {
    try {
      const data = await this.readData();
      if (data.err) return data;

      return wrapper.data(this.csvData);
    } catch (error) {
      return wrapper.error(error.message);
    }
  }

  async updateRecordByWaNumber(recordToUpdate) {
    if(!this.csvData.length){
      const readData = await this.readData();
      if (readData.err) return readData;
    }
    const wa_number = recordToUpdate.wa_number;
    
    const recordIndex = this.csvData.findIndex((record) => record.wa_number === wa_number);
    if (recordIndex !== -1) {
      Object.assign(this.csvData[recordIndex], recordToUpdate);
      return wrapper.data(this.csvData);
    } else {
      return wrapper.error('data tidak ditemukan');
    }
  }

  deleteRecord(recordToDelete) {
    const filteredDataArray = this.csvData.filter((record) => recordToDelete !== record);
    if (filteredDataArray.length < this.csvData.length) {
      this.csvData = filteredDataArray;
      logger.info('Record deleted successfully!');
    } else {
      logger.error('Record not found!');
    }
  }

  async findByField(fieldName, fieldValue) {
    try {
      if(!this.csvData.length){
        const readData = await this.readData();
        if (readData.err) return readData;
      }

      const foundRecords = this.csvData.filter((record) => record[fieldName] === fieldValue);
      if (!foundRecords.length) return wrapper.error(`${fieldName} not found`);
      return wrapper.data(foundRecords);
    } catch (error) {
      return wrapper.error(error);
    }
  }
}

module.exports = CSVHandler;
