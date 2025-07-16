
-- Create invoices table to store invoice data
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  due_date DATE,
  status TEXT DEFAULT 'draft',
  items JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own invoices" ON public.invoices
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own invoices" ON public.invoices
  FOR DELETE
  USING (user_id = auth.uid());
