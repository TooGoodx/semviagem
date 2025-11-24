-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    accept_marketing BOOLEAN DEFAULT false,
    provider VARCHAR(50) NOT NULL, -- google-oauth2, facebook, github, linkedin, auth0
    stripe_customer_id VARCHAR(255), -- Para integração com Stripe
    subscription_status VARCHAR(50) DEFAULT 'free', -- free, premium, enterprise
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth0_id ON user_profiles(auth0_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth0_id = auth.jwt() ->> 'sub');

-- Política para permitir que usuários atualizem apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth0_id = auth.jwt() ->> 'sub');

-- Política para permitir inserção de novos perfis (via service role)
CREATE POLICY "Service role can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Tabela para armazenar perfis completos de usuários autenticados via Auth0';
COMMENT ON COLUMN user_profiles.auth0_id IS 'ID único do usuário no Auth0 (formato: provider|id)';
COMMENT ON COLUMN user_profiles.provider IS 'Provedor de autenticação usado (google-oauth2, facebook, github, linkedin, auth0)';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'ID do cliente no Stripe para processamento de pagamentos';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Status da assinatura do usuário (free, premium, enterprise)';
