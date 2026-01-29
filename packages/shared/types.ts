export interface DocumentDTO {
    id?: string;
    tenant_id?: string;
    content: Record<string, any>;
    metadata?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

export interface TenantDTO {
    id: string;
    name: string;
    api_key_hash: string;
    rate_limit_quota: number;
}
