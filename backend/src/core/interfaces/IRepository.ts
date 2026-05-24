export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
  create(data: Partial<Record<string, unknown>>): Promise<T>;
  updateById(id: string, data: Partial<Record<string, unknown>>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
}
