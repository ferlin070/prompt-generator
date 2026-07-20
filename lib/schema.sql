CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  business_type VARCHAR(50),
  plan VARCHAR(20) DEFAULT 'free',
  plan_billing_cycle VARCHAR(10) DEFAULT 'monthly',
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  ai_credits_left INTEGER DEFAULT 5,
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  affiliate_code VARCHAR(20) UNIQUE,
  affiliate_enabled BOOLEAN DEFAULT false,
  affiliate_balance DECIMAL(10,2) DEFAULT 0,
  affiliate_total_earned DECIMAL(10,2) DEFAULT 0,
  referred_by UUID REFERENCES profiles(id),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  business_type_label VARCHAR(100),
  form_data JSONB DEFAULT '{}'::jsonb,
  generated_prompt TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favourite BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(10) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  promo_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  payment_method VARCHAR(30),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL DEFAULT 0.30,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(20) NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  bank_name VARCHAR(50),
  account_number VARCHAR(30),
  account_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

INSERT INTO promo_codes (code, type, value, max_uses, description) VALUES
  ('MULAKAN30', 'percentage', 30, 100, '30% diskaun untuk pengguna baru'),
  ('JIMAT50', 'fixed', 50, 50, 'RM50 off untuk pelan Pro'),
  ('AGENSI2025', 'percentage', 20, NULL, '20% off untuk pelan Agency')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_affiliate_id ON affiliate_earnings(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
