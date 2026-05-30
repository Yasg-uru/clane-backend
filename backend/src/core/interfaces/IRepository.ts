export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<Record<string, unknown>>): Promise<T>;
  updateById(id: string, data: Partial<Record<string, unknown>>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
}

export interface IAuthRepository<T> extends IRepository<T> {
  findByEmail(email: string): Promise<T | null>;
  findByEmailWithSecrets(email: string): Promise<T | null>;
  findByIdWithRefreshToken(id: string): Promise<T | null>;
  emailExists(email: string): Promise<boolean>;
}
