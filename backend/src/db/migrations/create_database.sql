
-- ============================================
-- FUNÇÃO: uuid_generate_v7
-- Gera UUIDs v7 (ordenados por tempo) para melhor performance de índices.
-- ============================================
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid AS $$
DECLARE
  v_time timestamp with time zone:= clock_timestamp();
  v_msec bigint := floor(extract(epoch from v_time) * 1000);
  v_uuid_hex text;
BEGIN
  -- 48 bits para o timestamp (ms) + Versão 7 + 12 bits random + Variant + 62 bits random
  v_uuid_hex := lpad(to_hex(v_msec), 12, '0') || '7' || substr(to_hex(floor(random() * 4096)::int), 1, 3) || 
                encode(gen_random_bytes(8), 'hex');
  
  -- Ajustar a variante (RFC 4122) para os bits 64-65 serem 10 (8, 9, a, ou b em hex)
  -- Simplificando: o 17º caractere (índice 16) deve ser 8, 9, a ou b.
  -- Aqui pegamos o hex gerado e forçamos a variante correta.
  RETURN (substr(v_uuid_hex, 1, 16) || 
          CASE WHEN (floor(random()*4)::int) = 0 THEN '8' 
               WHEN (floor(random()*4)::int) = 1 THEN '9' 
               WHEN (floor(random()*4)::int) = 2 THEN 'a' 
               ELSE 'b' END || 
          substr(v_uuid_hex, 18, 15))::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE SET search_path = public;

-- Criação dos ENUMs
DO $$ BEGIN
    CREATE TYPE otp_type AS ENUM ('registration', 'password_reset');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- TABELA: keep_alive
-- ============================================
CREATE TABLE IF NOT EXISTS keep_alive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabela de Códigos OTP
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    type otp_type NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Log de Atividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action     TEXT NOT NULL,
    source_app TEXT NOT NULL DEFAULT 'unknown',
    ip_address TEXT,
    user_agent TEXT,
    metadata   JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
