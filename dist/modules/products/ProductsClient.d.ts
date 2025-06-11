import { MerchantAuth } from '../../auth/MerchantAuth';
export declare class ProductsClient {
    private auth;
    private baseUrl;
    private merchantId;
    constructor(auth: MerchantAuth);
    updateProductFields(productId: string, updates: any, updateMask: string): Promise<any>;
    getProduct(productId: string): Promise<any>;
    listProducts(pageSize?: number, pageToken?: string): Promise<any>;
    getAccount(): Promise<any>;
    createProductInput(productData: any): Promise<any>;
    deleteProductInput(productInputId: string): Promise<any>;
}
//# sourceMappingURL=ProductsClient.d.ts.map