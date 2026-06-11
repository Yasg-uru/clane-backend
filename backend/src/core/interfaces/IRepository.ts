import type { WriteData } from "../types";

/**
 * Core CRUD contract.
 *
 * @typeParam TDoc    - the hydrated document type returned by reads.
 * @typeParam TEntity - the plain model interface used to type write payloads.
 *                      Defaults to TDoc for repositories that don't separate them.
 */
export interface IRepository<TDoc, TEntity = TDoc> {
  findById(id: string): Promise<TDoc | null>;
  create(data: WriteData<TEntity>): Promise<TDoc>;
  updateById(id: string, data: WriteData<TEntity>): Promise<TDoc | null>;
  deleteById(id: string): Promise<boolean>;
}

/**
 * Auth-capable repository contract. Implemented by BrandRepository and
 * CreatorRepository.
 */
export interface IAuthRepository<TDoc, TEntity = TDoc> extends IRepository<TDoc, TEntity> {
  findByEmail(email: string): Promise<TDoc | null>;
  findByEmailWithSecrets(email: string): Promise<TDoc | null>;
  findByIdWithRefreshToken(id: string): Promise<TDoc | null>;
  emailExists(email: string): Promise<boolean>;
  updatePasswordHash(userId: string, hash: string): Promise<void>;
}
