-- BudGuide Initial Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    description TEXT,
    
    -- Cannabinoid content
    cbd_mg DECIMAL(10,2),
    thc_mg DECIMAL(10,2),
    cbg_mg DECIMAL(10,2),
    cbn_mg DECIMAL(10,2),
    cbc_mg DECIMAL(10,2),
    thca_percentage DECIMAL(5,2),
    
    -- Product details
    price DECIMAL(10,2),
    size VARCHAR(50),
    product_type VARCHAR(50), -- flower, edible, tincture, topical
    strain_type VARCHAR(50), -- indica, sativa, hybrid, NA
    
    -- Effects and metadata
    effects JSONB, -- ["relaxing", "energizing", "pain-relief"]
    terpenes JSONB, -- {"limonene": 2.1, "myrcene": 1.5}
    lab_tested BOOLEAN DEFAULT false,
    lab_report_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    
    -- Embeddings for semantic search
    embedding vector(384),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector
);

-- Create indexes for products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_effects ON products USING GIN(effects);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID, -- Optional, for registered users
    
    -- Conversation state
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB DEFAULT '{}',
    intent VARCHAR(100),
    
    -- Preferences learned
    preferences JSONB DEFAULT '{}',
    recommended_products UUID[] DEFAULT '{}',
    
    -- Analytics
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    conversion BOOLEAN DEFAULT false,
    
    -- Privacy level (1-4)
    privacy_level INTEGER DEFAULT 1
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_started ON conversations(started_at);

-- User preferences (optional accounts)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    
    -- Preferences
    preferred_cannabinoids JSONB DEFAULT '{}',
    avoided_ingredients TEXT[],
    preferred_effects TEXT[],
    dosage_preferences JSONB DEFAULT '{}',
    
    -- Medical considerations (encrypted)
    medical_notes_encrypted TEXT,
    
    -- Settings
    privacy_settings JSONB DEFAULT '{"share_data": false, "analytics": false}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    user_id UUID,
    
    -- Event data
    properties JSONB DEFAULT '{}',
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Product reviews (for future use)
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    user_id UUID,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.effects)), ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER trigger_product_search_vector
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();