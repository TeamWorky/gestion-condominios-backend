/**
 * Utility functions for soft delete operations
 */

export interface SoftDeleteQueryOptions {
  includeDeleted?: boolean;
}

/**
 * Creates FindOptions with soft delete support
 */
export function withSoftDelete<T>(
  options: any = {},
  includeDeleted = false,
): any {
  if (includeDeleted) {
    return {
      ...options,
      withDeleted: true,
    };
  }

  return options;
}

/**
 * Checks if an entity is soft deleted
 */
export function isSoftDeleted(entity: { deletedAt?: Date | null }): boolean {
  return entity.deletedAt !== null && entity.deletedAt !== undefined;
}

/**
 * Gets soft delete status message
 */
export function getSoftDeleteStatus(entity: { deletedAt?: Date | null }): {
  isDeleted: boolean;
  deletedAt: Date | null;
} {
  return {
    isDeleted: isSoftDeleted(entity),
    deletedAt: entity.deletedAt || null,
  };
}
