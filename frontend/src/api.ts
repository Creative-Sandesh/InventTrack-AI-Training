import { API_URL } from './config';
import {
  User, DashboardStats, Inventory, Category, Item,
  ItemCreate, ItemUpdate
} from './types';

const TOKEN_KEY = 'inventrack_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'An error occurred');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as any;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {} as any;
}

// Auth
export async function register(email: string, password: string, name?: string) {
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', email); // standard OAuth2 field
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }
  return response.json();
}

export async function getMe(): Promise<User> {
  return fetchWithAuth('/auth/me');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchWithAuth('/dashboard/stats');
}

// Inventories
export async function getInventories(): Promise<Inventory[]> {
  return fetchWithAuth('/inventories');
}

export async function createInventory(name: string, description?: string): Promise<Inventory> {
  return fetchWithAuth('/inventories', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateInventory(id: string, name: string, description?: string): Promise<Inventory> {
  return fetchWithAuth(`/inventories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteInventory(id: string): Promise<void> {
  return fetchWithAuth(`/inventories/${id}`, {
    method: 'DELETE',
  });
}

export async function getInventory(id: string): Promise<Inventory> {
  return fetchWithAuth(`/inventories/${id}`);
}

// Categories
export async function getCategories(invId: string): Promise<Category[]> {
  return fetchWithAuth(`/inventories/${invId}/categories`);
}

export async function createCategory(invId: string, name: string, description?: string): Promise<Category> {
  return fetchWithAuth(`/inventories/${invId}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateCategory(invId: string, catId: string, name: string, description?: string): Promise<Category> {
  return fetchWithAuth(`/inventories/${invId}/categories/${catId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteCategory(invId: string, catId: string): Promise<void> {
  return fetchWithAuth(`/inventories/${invId}/categories/${catId}`, {
    method: 'DELETE',
  });
}

// Items
export async function getItems(params?: { cat_id?: string; inv_id?: string }): Promise<Item[]> {
  let queryString = '';
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.cat_id) searchParams.append('category_id', params.cat_id);
    if (params.inv_id) searchParams.append('inventory_id', params.inv_id);
    if (searchParams.toString()) {
      queryString = `?${searchParams.toString()}`;
    }
  }
  return fetchWithAuth(`/items${queryString}`);
}

export async function createItem(data: ItemCreate): Promise<Item> {
  return fetchWithAuth('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateItem(id: string, data: ItemUpdate): Promise<Item> {
  return fetchWithAuth(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteItem(id: string): Promise<void> {
  return fetchWithAuth(`/items/${id}`, {
    method: 'DELETE',
  });
}
