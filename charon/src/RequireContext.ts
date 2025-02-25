export interface RequireContext {
    keys(): string[];
    (id: string): unknown;
}
