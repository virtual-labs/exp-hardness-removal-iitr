/**
 * DataStorage Utility - Replaces PHP Session functionality
 * Stores experiment data in browser's localStorage for persistence
 */

const DataStorage = {
  // Key for storing all experiment data
  STORAGE_KEY: 'experimentData',

  /**
   * Initialize data storage
   */
  init() {
    if (!this.getData()) {
      this.setData({
        // First experiment (titration 1 - before ion exchange)
        normality_titrate: null,
        volume_titrate: null,
        vadded: null,
        normality_titrant: null,
        volume_titrant: null,
        
        // Second experiment (titration 2 - after ion exchange)
        normality_titrate2: null,
        volume_titrate2: null,
        vadded2: null,
        normality_titrant2: null,
        volume_titrant2: null,
        
        timestamp: null,
      });
    }
  },

  /**
   * Get all stored data
   */
  getData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error retrieving data from localStorage:', e);
      return null;
    }
  },

  /**
   * Set all data (overwrites existing)
   */
  setData(data) {
    try {
      data.timestamp = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      return false;
    }
  },

  /**
   * Update specific fields in the stored data
   */
  updateData(updates) {
    try {
      const currentData = this.getData() || {};
      const newData = { ...currentData, ...updates };
      return this.setData(newData);
    } catch (e) {
      console.error('Error updating data:', e);
      return false;
    }
  },

  /**
   * Get a specific field
   */
  get(key) {
    const data = this.getData();
    return data ? data[key] : null;
  },

  /**
   * Set a specific field
   */
  set(key, value) {
    return this.updateData({ [key]: value });
  },

  /**
   * Clear all stored data
   */
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.init();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  },

  /**
   * Store first titration experiment data (before ion exchange)
   */
  storeTitrationData(normality_titrate, volume_titrate, vadded, normality_titrant, volume_titrant) {
    return this.updateData({
      normality_titrate,
      volume_titrate,
      vadded,
      normality_titrant,
      volume_titrant,
    });
  },

  /**
   * Store second titration experiment data (after ion exchange)
   */
  storeTitrationData2(normality_titrate2, volume_titrate2, vadded2, normality_titrant2, volume_titrant2) {
    return this.updateData({
      normality_titrate2,
      volume_titrate2,
      vadded2,
      normality_titrant2,
      volume_titrant2,
    });
  },

  /**
   * Get first titration data
   */
  getTitrationData() {
    const data = this.getData();
    if (data) {
      return {
        normality_titrate: data.normality_titrate,
        volume_titrate: data.volume_titrate,
        vadded: data.vadded,
        normality_titrant: data.normality_titrant,
        volume_titrant: data.volume_titrant,
      };
    }
    return null;
  },

  /**
   * Get second titration data
   */
  getTitrationData2() {
    const data = this.getData();
    if (data) {
      return {
        normality_titrate2: data.normality_titrate2,
        volume_titrate2: data.volume_titrate2,
        vadded2: data.vadded2,
        normality_titrant2: data.normality_titrant2,
        volume_titrant2: data.volume_titrant2,
      };
    }
    return null;
  },

  /**
   * Calculate hardness before and after ion exchange
   * Based on the PHP calculations: hardness in ppm = normality * 5000
   */
  calculateHardness() {
    const data = this.getData();
    if (!data || !data.normality_titrant || !data.normality_titrant2) {
      console.warn('Incomplete data for hardness calculation');
      return null;
    }

    const hardnessBefore = {
      volume_taken: parseFloat(data.volume_titrate) || 0,
      volume_used: parseFloat(data.volume_titrant) || 0,
      normality: (parseFloat(data.normality_titrant) / 10).toFixed(3),
      ppm: (parseFloat(data.normality_titrant) * 5000).toFixed(2),
    };

    const hardnessAfter = {
      volume_taken: parseFloat(data.volume_titrate2) || 0,
      volume_used: parseFloat(data.volume_titrant2) || 0,
      normality: (parseFloat(data.normality_titrant2) / 10).toFixed(3),
      ppm: (parseFloat(data.normality_titrant2) * 5000).toFixed(2),
    };

    const hardnessReduced = (
      parseFloat(hardnessBefore.ppm) - parseFloat(hardnessAfter.ppm)
    ).toFixed(2);

    const results = {
      hardnessBefore,
      hardnessAfter,
      hardnessReduced,
      compiledAt: new Date().toISOString(),
    };

    // Store compiled results
    this.updateData({ compiledResults: results });
    return results;
  },

  /**
   * Compile all results before moving to results page
   */
  compileResults() {
    const hardness = this.calculateHardness();
    if (!hardness) {
      console.error('Failed to calculate hardness');
      return null;
    }
    return hardness;
  },

  /**
   * Get compiled results
   */
  getCompiledResults() {
    const data = this.getData();
    return data ? data.compiledResults : null;
  },

  /**
   * Get all data for debugging
   */
  getAllData() {
    return this.getData();
  },
};

// Initialize storage when this script loads
DataStorage.init();

