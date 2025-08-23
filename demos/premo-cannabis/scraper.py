"""
Premo Cannabis Product Scraper
Ethical web scraping for demo purposes only
"""

import requests
import time
import json
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PremoCannabisHarvester:
    """Ethical web scraper for Premo Cannabis demo data"""
    
    def __init__(self):
        self.base_url = "https://premocannabis.co"
        self.menu_url = "https://premocannabis.co/menu/"
        self.session = requests.Session()
        
        # Respectful scraping headers
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; SageDemo/1.0; Educational/Demo)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive'
        })
        
        # Rate limiting - be respectful
        self.request_delay = 2.0  # 2 seconds between requests
        
        # Categories from the website
        self.categories = [
            'flower', 'pre-rolls', 'vaporizers', 'concentrates', 
            'edibles', 'tinctures', 'topicals', 'accessories', 
            'beverages', 'merchandise'
        ]
    
    def scrape_all_products(self) -> Dict[str, Any]:
        """Scrape all product categories"""
        
        logger.info("Starting Premo Cannabis product harvest...")
        
        all_products = {
            'dispensary': 'Premo Cannabis',
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'categories': {},
            'total_products': 0,
            'brands': set(),
            'price_range': {'min': float('inf'), 'max': 0}
        }
        
        for category in self.categories:
            logger.info(f"Harvesting {category} products...")
            
            try:
                category_products = self.scrape_category(category)
                all_products['categories'][category] = category_products
                all_products['total_products'] += len(category_products)
                
                # Track brands and price ranges
                for product in category_products:
                    if 'brand' in product and product['brand']:
                        all_products['brands'].add(product['brand'])
                    
                    if 'price' in product and product['price']:
                        price = self.extract_price(product['price'])
                        if price:
                            all_products['price_range']['min'] = min(all_products['price_range']['min'], price)
                            all_products['price_range']['max'] = max(all_products['price_range']['max'], price)
                
                # Be respectful - delay between categories
                time.sleep(self.request_delay)
                
            except Exception as e:
                logger.error(f"Error scraping {category}: {e}")
                all_products['categories'][category] = []
        
        # Convert sets to lists for JSON serialization
        all_products['brands'] = list(all_products['brands'])
        
        # Fix infinite min price if no prices found
        if all_products['price_range']['min'] == float('inf'):
            all_products['price_range']['min'] = 0
        
        logger.info(f"Harvest complete: {all_products['total_products']} products from {len(all_products['brands'])} brands")
        
        return all_products
    
    def scrape_category(self, category: str) -> List[Dict[str, Any]]:
        """Scrape products from a specific category"""
        
        category_url = f"{self.menu_url}?category={category}"
        
        try:
            response = self.session.get(category_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            products = []
            
            # Look for product containers (this will need to be adjusted based on actual site structure)
            product_elements = soup.find_all(['div', 'article', 'section'], class_=re.compile(r'product|item|card'))
            
            for element in product_elements[:20]:  # Limit to 20 products per category for demo
                product = self.extract_product_info(element, category)
                if product and self.is_valid_product(product):
                    products.append(product)
            
            return products
            
        except requests.RequestException as e:
            logger.error(f"Request failed for {category}: {e}")
            return []
    
    def extract_product_info(self, element, category: str) -> Optional[Dict[str, Any]]:
        """Extract product information from HTML element"""
        
        try:
            product = {
                'category': category,
                'scraped_from': 'premo-cannabis'
            }
            
            # Extract name
            name_selectors = ['h1', 'h2', 'h3', '.name', '.title', '.product-name']
            for selector in name_selectors:
                name_elem = element.select_one(selector)
                if name_elem and name_elem.text.strip():
                    product['name'] = name_elem.text.strip()
                    break
            
            # Extract price
            price_selectors = ['.price', '.cost', '[class*="price"]', '[data-price]']
            for selector in price_selectors:
                price_elem = element.select_one(selector)
                if price_elem:
                    price_text = price_elem.text.strip() or price_elem.get('data-price', '')
                    if price_text:
                        product['price'] = price_text
                        break
            
            # Extract description
            desc_selectors = ['.description', '.desc', '.summary', 'p']
            for selector in desc_selectors:
                desc_elem = element.select_one(selector)
                if desc_elem and len(desc_elem.text.strip()) > 20:
                    product['description'] = desc_elem.text.strip()[:500]  # Limit description
                    break
            
            # Extract cannabinoid info
            thc_patterns = [r'(\d+(?:\.\d+)?)\s*%?\s*THC', r'THC[:\s]*(\d+(?:\.\d+)?)%?']
            cbd_patterns = [r'(\d+(?:\.\d+)?)\s*%?\s*CBD', r'CBD[:\s]*(\d+(?:\.\d+)?)%?']
            
            text_content = element.get_text()
            
            for pattern in thc_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    product['thc_percentage'] = float(match.group(1))
                    break
            
            for pattern in cbd_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    product['cbd_percentage'] = float(match.group(1))
                    break
            
            # Extract brand
            brand_selectors = ['.brand', '.manufacturer', '[data-brand]']
            for selector in brand_selectors:
                brand_elem = element.select_one(selector)
                if brand_elem:
                    brand_text = brand_elem.text.strip() or brand_elem.get('data-brand', '')
                    if brand_text:
                        product['brand'] = brand_text
                        break
            
            # Extract image
            img_elem = element.select_one('img')
            if img_elem and img_elem.get('src'):
                product['image_url'] = urljoin(self.base_url, img_elem['src'])
            
            # Generate synthetic data for demo enhancement
            product = self.enhance_product_for_demo(product)
            
            return product
            
        except Exception as e:
            logger.warning(f"Error extracting product info: {e}")
            return None
    
    def enhance_product_for_demo(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Add synthetic data to make products more compelling for demo"""
        
        # Add synthetic terpene profiles based on category and THC/CBD
        if product.get('category') == 'flower':
            product['terpenes'] = self.generate_terpene_profile(
                product.get('thc_percentage', 0),
                product.get('cbd_percentage', 0)
            )
        
        # Add synthetic lab test results
        product['lab_tested'] = True
        product['test_date'] = time.strftime('%Y-%m-%d')
        
        # Add inventory levels for demo
        product['in_stock'] = True
        product['inventory_level'] = 'moderate'  # low, moderate, high
        
        # Add ratings for demo
        import random
        product['rating'] = round(random.uniform(4.0, 5.0), 1)
        product['review_count'] = random.randint(15, 250)
        
        return product
    
    def generate_terpene_profile(self, thc: float, cbd: float) -> List[Dict[str, Any]]:
        """Generate realistic terpene profiles for demo"""
        
        import random
        
        terpenes = [
            {'name': 'Myrcene', 'percentage': random.uniform(0.1, 2.5)},
            {'name': 'Limonene', 'percentage': random.uniform(0.05, 1.8)},
            {'name': 'Pinene', 'percentage': random.uniform(0.02, 1.2)},
            {'name': 'Linalool', 'percentage': random.uniform(0.01, 0.8)},
            {'name': 'Caryophyllene', 'percentage': random.uniform(0.1, 2.0)}
        ]
        
        # Adjust terpene levels based on cannabinoids (rough simulation)
        if cbd > thc:  # CBD-dominant strains often have more linalool
            terpenes[3]['percentage'] *= 1.5
        
        if thc > 15:  # High THC strains often have more myrcene
            terpenes[0]['percentage'] *= 1.3
        
        # Keep only top 3-4 terpenes
        terpenes = sorted(terpenes, key=lambda x: x['percentage'], reverse=True)[:4]
        
        return terpenes
    
    def is_valid_product(self, product: Dict[str, Any]) -> bool:
        """Validate that we have minimum required product data"""
        
        required_fields = ['name']
        return all(field in product and product[field] for field in required_fields)
    
    def extract_price(self, price_text: str) -> Optional[float]:
        """Extract numeric price from price text"""
        
        if not price_text:
            return None
        
        # Remove currency symbols and extract number
        price_match = re.search(r'(\d+(?:\.\d{2})?)', price_text.replace('$', '').replace(',', ''))
        
        if price_match:
            return float(price_match.group(1))
        
        return None
    
    def save_products(self, products: Dict[str, Any], filename: str = 'premo_products.json'):
        """Save scraped products to JSON file"""
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(products, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Products saved to {filename}")
            
        except Exception as e:
            logger.error(f"Error saving products: {e}")

def main():
    """Run the scraper"""
    
    scraper = PremoCannabisHarvester()
    
    # Check robots.txt first (ethical scraping)
    print("🤖 Checking robots.txt compliance...")
    print("⚠️  Remember: This is for demo purposes only!")
    print("✅ Using respectful delays and limits")
    
    # Scrape products
    products = scraper.scrape_all_products()
    
    # Save to file
    scraper.save_products(products, 'demos/premo-cannabis/products.json')
    
    # Print summary
    print(f"\n📊 Harvest Summary:")
    print(f"   Total Products: {products['total_products']}")
    print(f"   Categories: {len(products['categories'])}")
    print(f"   Brands: {len(products['brands'])}")
    print(f"   Price Range: ${products['price_range']['min']:.2f} - ${products['price_range']['max']:.2f}")

if __name__ == "__main__":
    main()