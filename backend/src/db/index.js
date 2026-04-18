import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

// Obter DATABASE_URL do ambiente
const getDatabaseUrl = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            'DATABASE_URL não encontrada no .env. ' +
            'Adicione a connection string do PostgreSQL.'
        );
    }
    return process.env.DATABASE_URL;
};

// Criar cliente PostgreSQL otimizado para o runtime do Bun
export const client = postgres(getDatabaseUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: 'require' // Obrigatório para Supabase fora de localhost
});

// Criar instância do Drizzle
export const db = drizzle(client, { schema });
