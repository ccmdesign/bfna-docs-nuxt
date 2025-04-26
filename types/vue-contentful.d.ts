declare module 'vue-contentful' {
  export function createClient(options: {
    space: string;
    accessToken: string;
  }): any;
  
  export interface ContentfulClient {
    getEntries(query?: any): Promise<{
      items: any[];
      total: number;
      skip: number;
      limit: number;
    }>;
    getEntry(id: string): Promise<any>;
    getAsset(id: string): Promise<any>;
    getAssets(query?: any): Promise<any>;
    getContentType(id: string): Promise<any>;
    getContentTypes(query?: any): Promise<any>;
    getSpace(): Promise<any>;
  }
} 