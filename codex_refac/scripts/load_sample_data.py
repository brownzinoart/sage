#!/usr/bin/env python3
"""
Load sample product data into the BudGuide database
"""

import asyncio
import json
import uuid
from pathlib import Path
import asyncpg
from sentence_transformers import SentenceTransformer

# Database connection
DATABASE_URL = "postgresql://budguide:password@localhost:5432/budguide"

async def load_sample_products():
    """Load sample products with embeddings into database"""
    
    # Load sample data
    data_file = Path(__file__).parent.parent / "data" / "sample_products.json"
    with open(data_file, 'r') as f:
        products = json.load(f)
    
    # Initialize sentence transformer for embeddings
    print("🤖 Loading sentence transformer model...")
    encoder = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Connect to database
    print("🔗 Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Clear existing products
        await conn.execute("DELETE FROM products")
        print("🗑️  Cleared existing products")
        
        # Insert products with embeddings
        for product in products:
            # Generate embedding from name and description
            text_for_embedding = f"{product['name']} {product.get('description', '')} {' '.join(product.get('effects', []))}"
            embedding = encoder.encode(text_for_embedding)
            
            # Insert product
            product_id = str(uuid.uuid4())
            await conn.execute("""
                INSERT INTO products (
                    id, external_id, name, brand, category, subcategory, description,
                    cbd_mg, thc_mg, cbg_mg, cbn_mg, cbc_mg, thca_percentage,
                    price, size, product_type, strain_type, effects, terpenes,
                    lab_tested, lab_report_url, in_stock, embedding
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
                )
            """, 
                product_id,
                product['external_id'],
                product['name'],
                product['brand'],
                product['category'],
                product['subcategory'],
                product['description'],
                product['cbd_mg'],
                product['thc_mg'],
                product['cbg_mg'],
                product['cbn_mg'],
                product['cbc_mg'],
                product.get('thca_percentage'),
                product['price'],
                product['size'],
                product['product_type'],
                product.get('strain_type'),
                json.dumps(product['effects']),
                json.dumps(product['terpenes']),
                product['lab_tested'],
                product.get('lab_report_url'),
                product['in_stock'],
                embedding.tolist()
            )
            
            print(f"✅ Loaded: {product['name']}")
        
        # Get count
        count = await conn.fetchval("SELECT COUNT(*) FROM products")
        print(f"🎉 Successfully loaded {count} products!")
        
    except Exception as e:
        print(f"❌ Error loading products: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(load_sample_products())