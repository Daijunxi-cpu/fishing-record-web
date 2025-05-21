// 定义钓鱼记录类型
export interface FishingRecord {
  id: number;
  date: string;
  fishType: string;
  count: number;
  weight: number;
  weather: string;
  photos: Photo[];
  notes?: string;
  location?: string;  // 修改为字符串类型
}

// 照片类型
export interface Photo {
  url: string;
  file?: File;
  name?: string;
  size?: number;
  type?: string;
}

// 本地存储服务
class StorageService {
  private readonly STORAGE_KEY = 'fishing-records';
  
  // 获取所有记录
  getAllRecords(): FishingRecord[] {
    const recordsJson = localStorage.getItem(this.STORAGE_KEY);
    if (!recordsJson) return [];
    
    try {
      return JSON.parse(recordsJson);
    } catch (error) {
      console.error('Failed to parse records from localStorage:', error);
      return [];
    }
  }
  
  // 获取单条记录
  getRecord(id: number): FishingRecord | null {
    const records = this.getAllRecords();
    return records.find(record => record.id === id) || null;
  }
  
  // 添加记录
  addRecord(record: Omit<FishingRecord, 'id'>): FishingRecord {
    const records = this.getAllRecords();
    
    // 生成新ID
    const newId = records.length > 0 
      ? Math.max(...records.map(r => r.id)) + 1 
      : 1;
    
    // 处理照片数据，将File对象转换为URL
    const processedPhotos = record.photos.map(photo => {
      // 如果已经是处理过的照片对象，直接返回
      if (typeof photo === 'object' && 'url' in photo) {
        return photo;
      }
      
      // 如果是File对象，创建URL
      if (photo instanceof File) {
        return {
          url: URL.createObjectURL(photo),
          name: photo.name,
          size: photo.size,
          type: photo.type
        };
      }
      
      // 如果是字符串URL，创建简单对象
      return { url: photo as unknown as string };
    });
    
    // 创建新记录
    const newRecord: FishingRecord = {
      ...record,
      id: newId,
      photos: processedPhotos
    };
    
    // 添加到记录列表
    records.push(newRecord);
    this.saveRecords(records);
    
    return newRecord;
  }
  
  // 更新记录
  updateRecord(id: number, updates: Partial<FishingRecord>): boolean {
    const records = this.getAllRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;
    
    // 处理照片数据
    if (updates.photos) {
      updates.photos = updates.photos.map(photo => {
        if (typeof photo === 'object' && 'url' in photo) {
          return photo;
        }
        
        if (photo instanceof File) {
          return {
            url: URL.createObjectURL(photo),
            name: photo.name,
            size: photo.size,
            type: photo.type
          };
        }
        
        return { url: photo as unknown as string };
      });
    }
    
    // 更新记录
    records[index] = { ...records[index], ...updates };
    this.saveRecords(records);
    
    return true;
  }
  
  // 删除记录
  deleteRecord(id: number): boolean {
    const records = this.getAllRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;
    
    // 释放照片URL
    records[index].photos.forEach(photo => {
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });
    
    // 删除记录
    records.splice(index, 1);
    this.saveRecords(records);
    
    return true;
  }
  
  // 获取统计数据
  getStatistics() {
    const records = this.getAllRecords();
    
    // 总钓鱼次数
    const totalTrips = records.length;
    
    // 总钓获数量
    const totalFish = records.reduce((sum, record) => sum + (record.count || 0), 0);
    
    // 总重量
    const totalWeight = records.reduce((sum, record) => sum + (record.weight || 0), 0);
    
    // 最大单次收获
    const biggestCatch = records.length > 0 
      ? Math.max(...records.map(record => record.weight || 0)) 
      : 0;
    
    // 鱼种分布
    const fishTypes: Record<string, number> = {};
    records.forEach(record => {
      if (!fishTypes[record.fishType]) {
        fishTypes[record.fishType] = 0;
      }
      fishTypes[record.fishType] += record.count || 1;
    });
    
    // 月度趋势
    const monthlyData: Record<string, number> = {};
    records.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += 1;
    });
    
    return {
      totalTrips,
      totalFish,
      totalWeight,
      biggestCatch,
      fishTypes,
      monthlyData
    };
  }
  
  // 保存记录到本地存储
  private saveRecords(records: FishingRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save records to localStorage:', error);
    }
  }
}

// 导出单例
export const storageService = new StorageService();