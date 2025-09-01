from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import ProductInfo, SearchRequest
from app.db.mock_database import mock_db

router = APIRouter()

@router.get("/", response_model=List[ProductInfo])
async def list_products(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    product_type: Optional[str] = None
):
    """List all products with optional filtering"""
    
    try:
        products = mock_db.products.copy()
        
        # Apply filters
        if category:
            products = [p for p in products if p.get('category') == category]
        
        if product_type:
            products = [p for p in products if p.get('product_type') == product_type]
        
        # Convert to ProductInfo format
        result = []
        for p in products[:limit]:
            product_info = ProductInfo(
                id=p['id'],
                name=p['name'],
                brand=p.get('brand', ''),
                description=p.get('description', ''),
                # Hemp fields (for NC/other states)
                cbd_mg=p.get('cbd_mg'),
                thc_mg=p.get('thc_mg'),
                cbg_mg=p.get('cbg_mg'),
                cbn_mg=p.get('cbn_mg'),
                cbc_mg=p.get('cbc_mg'),
                thca_percentage=p.get('thca_percentage'),
                # Cannabis fields (for NJ)
                thc_percentage=p.get('thc_percentage'),
                cbd_percentage=p.get('cbd_percentage'),
                cbda_percentage=p.get('cbda_percentage'),
                cbg_percentage=p.get('cbg_percentage'),
                cbga_percentage=p.get('cbga_percentage'),
                cbn_percentage=p.get('cbn_percentage'),
                dominant_terpene=p.get('dominant_terpene'),
                batch_number=p.get('batch_number'),
                harvest_date=p.get('harvest_date'),
                price=p['price'],
                effects=p.get('effects', []),
                terpenes=p.get('terpenes', {}),
                lab_tested=p.get('lab_tested', False),
                lab_report_url=p.get('lab_report_url'),
                product_type=p['product_type'],
                strain_type=p.get('strain_type'),
                in_stock=p.get('in_stock', True)
            )
            result.append(product_info)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@router.get("/{product_id}", response_model=ProductInfo)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    
    try:
        product = await mock_db.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return ProductInfo(
            id=product['id'],
            name=product['name'],
            brand=product.get('brand', ''),
            description=product.get('description', ''),
            # Hemp fields (for NC/other states)
            cbd_mg=product.get('cbd_mg'),
            thc_mg=product.get('thc_mg'),
            cbg_mg=product.get('cbg_mg'),
            cbn_mg=product.get('cbn_mg'),
            cbc_mg=product.get('cbc_mg'),
            thca_percentage=product.get('thca_percentage'),
            # Cannabis fields (for NJ)
            thc_percentage=product.get('thc_percentage'),
            cbd_percentage=product.get('cbd_percentage'),
            cbda_percentage=product.get('cbda_percentage'),
            cbg_percentage=product.get('cbg_percentage'),
            cbga_percentage=product.get('cbga_percentage'),
            cbn_percentage=product.get('cbn_percentage'),
            dominant_terpene=product.get('dominant_terpene'),
            batch_number=product.get('batch_number'),
            harvest_date=product.get('harvest_date'),
            price=product['price'],
            effects=product.get('effects', []),
            terpenes=product.get('terpenes', {}),
            lab_tested=product.get('lab_tested', False),
            lab_report_url=product.get('lab_report_url'),
            product_type=product['product_type'],
            strain_type=product.get('strain_type'),
            in_stock=product.get('in_stock', True)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@router.post("/search", response_model=List[ProductInfo])
async def search_products(search: SearchRequest):
    """Search products using natural language"""
    
    try:
        # Use mock database search
        products = await mock_db.search_products(
            search.query, 
            filters=search.filters.dict() if search.filters else None,
            limit=search.limit
        )
        
        # Convert to ProductInfo format
        result = []
        for p in products:
            product_info = ProductInfo(
                id=p['id'],
                name=p['name'],
                brand=p.get('brand', ''),
                description=p.get('description', ''),
                # Hemp fields (for NC/other states)
                cbd_mg=p.get('cbd_mg'),
                thc_mg=p.get('thc_mg'),
                cbg_mg=p.get('cbg_mg'),
                cbn_mg=p.get('cbn_mg'),
                cbc_mg=p.get('cbc_mg'),
                thca_percentage=p.get('thca_percentage'),
                # Cannabis fields (for NJ)
                thc_percentage=p.get('thc_percentage'),
                cbd_percentage=p.get('cbd_percentage'),
                cbda_percentage=p.get('cbda_percentage'),
                cbg_percentage=p.get('cbg_percentage'),
                cbga_percentage=p.get('cbga_percentage'),
                cbn_percentage=p.get('cbn_percentage'),
                dominant_terpene=p.get('dominant_terpene'),
                batch_number=p.get('batch_number'),
                harvest_date=p.get('harvest_date'),
                price=p['price'],
                effects=p.get('effects', []),
                terpenes=p.get('terpenes', {}),
                lab_tested=p.get('lab_tested', False),
                lab_report_url=p.get('lab_report_url'),
                match_score=p.get('match_score'),
                product_type=p['product_type'],
                strain_type=p.get('strain_type'),
                in_stock=p.get('in_stock', True)
            )
            result.append(product_info)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching products: {str(e)}")

@router.get("/categories/list")
async def list_categories():
    """Get all available product categories"""
    
    try:
        categories = set()
        for product in mock_db.products:
            if product.get('category'):
                categories.add(product['category'])
        
        return {"categories": sorted(list(categories))}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/types/list")  
async def list_product_types():
    """Get all available product types"""
    
    try:
        types = set()
        for product in mock_db.products:
            if product.get('product_type'):
                types.add(product['product_type'])
        
        return {"product_types": sorted(list(types))}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product types: {str(e)}")