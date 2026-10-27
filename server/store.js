import { randomUUID } from 'crypto';

// In-memory collections
class InMemoryCollection {
  constructor(name, maxItems = 5000) {
    this.name = name;
    this.maxItems = maxItems;
    this.items = [];
  }

  async countDocuments(query = {}) {
    return this._filter(query).length;
  }

  async insertMany(docs) {
    const prepared = docs.map(doc => ({
      _id: doc._id || randomUUID(),
      timestamp: doc.timestamp ? new Date(doc.timestamp) : new Date(),
      ...doc
    }));
    this.items.push(...prepared);
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(-this.maxItems);
    }
    return prepared;
  }

  async create(doc) {
    const prepared = {
      _id: doc._id || randomUUID(),
      timestamp: doc.timestamp ? new Date(doc.timestamp) : new Date(),
      ...doc
    };
    this.items.push(prepared);
    if (this.items.length > this.maxItems) {
      this.items.shift();
    }
    return prepared;
  }

  _filter(query = {}) {
    return this.items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (val && typeof val === 'object') {
          if ('$gte' in val) {
            const itemTime = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
            const compareTime = val.$gte instanceof Date ? val.$gte.getTime() : new Date(val.$gte).getTime();
            if (itemTime < compareTime) return false;
          }
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  find(query = {}) {
    const results = [...this._filter(query)];
    
    const queryObj = {
      _data: results,
      sort(sortCriteria) {
        const [field, order] = Object.entries(sortCriteria)[0] || ['timestamp', -1];
        queryObj._data.sort((a, b) => {
          let aVal = a[field];
          let bVal = b[field];
          if (aVal instanceof Date) aVal = aVal.getTime();
          if (bVal instanceof Date) bVal = bVal.getTime();
          if (aVal < bVal) return order === 1 ? -1 : 1;
          if (aVal > bVal) return order === 1 ? 1 : -1;
          return 0;
        });
        return queryObj;
      },
      skip(n) {
        queryObj._data = queryObj._data.slice(n);
        return queryObj;
      },
      limit(n) {
        queryObj._data = queryObj._data.slice(0, n);
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(queryObj._data).then(resolve, reject);
      }
    };

    return queryObj;
  }
}

export const AlertStore = new InMemoryCollection('alerts', 5000);
export const DeviceMetricStore = new InMemoryCollection('deviceMetrics', 1000);
export const ModelPerformanceStore = new InMemoryCollection('modelPerformance', 500);

export default {
  AlertStore,
  DeviceMetricStore,
  ModelPerformanceStore
};
