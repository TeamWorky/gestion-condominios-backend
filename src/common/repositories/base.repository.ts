import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

/**
 * Options for queries with soft delete support
 */
export interface SoftDeleteOptions {
  includeDeleted?: boolean;
}

/**
 * Helper functions for repositories with soft delete support
 * Use these functions with any TypeORM Repository that has soft delete enabled
 */
export class SoftDeleteRepositoryHelper {
  /**
   * Find all entities, excluding soft deleted by default
   */
  static async findAll<T extends BaseEntity>(
    repository: Repository<T>,
    options?: FindManyOptions<T> & SoftDeleteOptions,
  ): Promise<[T[], number]> {
    const { includeDeleted = false, ...findOptions } = options || {};

    if (includeDeleted) {
      return repository.findAndCount({
        ...findOptions,
        withDeleted: true,
      });
    }

    return repository.findAndCount(findOptions);
  }

  /**
   * Find one entity by ID, excluding soft deleted by default
   */
  static async findOneById<T extends BaseEntity>(
    repository: Repository<T>,
    id: string,
    options?: FindOneOptions<T> & SoftDeleteOptions,
  ): Promise<T | null> {
    const { includeDeleted = false, ...findOptions } = options || {};

    if (includeDeleted) {
      return repository.findOne({
        where: { id } as FindOptionsWhere<T>,
        ...findOptions,
        withDeleted: true,
      });
    }

    return repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...findOptions,
    });
  }

  /**
   * Find one entity by criteria, excluding soft deleted by default
   */
  static async findOneBy<T extends BaseEntity>(
    repository: Repository<T>,
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T> & SoftDeleteOptions,
  ): Promise<T | null> {
    const { includeDeleted = false, ...findOptions } = options || {};

    if (includeDeleted) {
      return repository.findOne({
        where,
        ...findOptions,
        withDeleted: true,
      });
    }

    return repository.findOne({
      where,
      ...findOptions,
    });
  }

  /**
   * Soft delete an entity by ID
   */
  static async softDeleteById<T extends BaseEntity>(
    repository: Repository<T>,
    id: string,
  ): Promise<void> {
    await repository.softDelete(id);
  }

  /**
   * Soft delete an entity
   */
  static async softDeleteEntity<T extends BaseEntity>(
    repository: Repository<T>,
    entity: T,
  ): Promise<T> {
    return repository.softRemove(entity);
  }

  /**
   * Restore a soft deleted entity by ID
   */
  static async restoreById<T extends BaseEntity>(
    repository: Repository<T>,
    id: string,
  ): Promise<void> {
    await repository.restore(id);
  }

  /**
   * Restore a soft deleted entity
   */
  static async restoreEntity<T extends BaseEntity>(
    repository: Repository<T>,
    entity: T,
  ): Promise<T> {
    return repository.recover(entity);
  }

  /**
   * Hard delete (permanent deletion) an entity by ID
   */
  static async hardDeleteById<T extends BaseEntity>(
    repository: Repository<T>,
    id: string,
  ): Promise<void> {
    await repository.delete(id);
  }

  /**
   * Hard delete (permanent deletion) an entity
   */
  static async hardDeleteEntity<T extends BaseEntity>(
    repository: Repository<T>,
    entity: T,
  ): Promise<void> {
    await repository.remove(entity);
  }

  /**
   * Check if an entity is soft deleted
   */
  static isDeleted<T extends BaseEntity>(entity: T): boolean {
    return entity.deletedAt !== null && entity.deletedAt !== undefined;
  }

  /**
   * Find only soft deleted entities
   */
  static async findDeleted<T extends BaseEntity>(
    repository: Repository<T>,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    const allEntities = await repository.find({
      ...options,
      withDeleted: true,
    });

    return allEntities.filter((entity) => this.isDeleted(entity));
  }

  /**
   * Count entities, excluding soft deleted by default
   */
  static async countEntities<T extends BaseEntity>(
    repository: Repository<T>,
    where?: FindOptionsWhere<T>,
    includeDeleted = false,
  ): Promise<number> {
    if (includeDeleted) {
      return repository.count({
        where,
        withDeleted: true,
      });
    }

    return repository.count({
      where,
    });
  }
}
