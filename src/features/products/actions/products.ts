'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

import { insertProduct, updateProduct as updateProductDb, deleteProduct as deleteProductDb } from '../db/products';
import { getCurrentUser } from '../../../services/clerk';
import { productSchema } from '../schema/products';
import { canCreateProducts, canUpdateProducts, canDeleteProducts } from '../permissions/products';

export async function createProduct(unsafeData: z.infer<typeof productSchema>) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data when creating your product'
    };
  }

  if (!canCreateProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'You do not have permission to create a product'
    };
  }

  await insertProduct(data);

  redirect(`/admin/products`);
}

export async function updateProduct(id: string, unsafeData: z.infer<typeof productSchema>) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data when updating your product'
    };
  }

  if (!canUpdateProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'You do not have permission to update a product'
    };
  }

  await updateProductDb(id, data);

  redirect(`/admin/products`);
}

export async function deleteProduct(id: string) {
  if (!canDeleteProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error deleting your product',
    };
  }

  await deleteProductDb(id);

  return {
    error: false,
    message: 'Successfully deleted product'
  };
}