"""
Research Cache System
Provides fast caching for research papers and queries with automatic expiration
"""

import sqlite3
import json
import hashlib
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path
import threading

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from mcp_types import ResearchPaper, ResearchQuery

logger = logging.getLogger(__name__)


class ResearchCache:
    """High-performance cache for research papers with SQLite persistence"""
    
    def __init__(self, cache_dir: str = None, max_memory_entries: int = 1000):
        self.cache_dir = Path(cache_dir) if cache_dir else Path(__file__).parent / "data"
        self.cache_dir.mkdir(exist_ok=True)
        
        self.db_path = self.cache_dir / "research_cache.db"
        self.max_memory_entries = max_memory_entries
        
        # In-memory cache for hot data
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.access_times: Dict[str, datetime] = {}
        self.cache_lock = threading.RLock()
        
        # Initialize database
        self._init_database()
        
        # Cache statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'memory_hits': 0,
            'disk_hits': 0
        }
        
        logger.info(f"Research cache initialized at {self.db_path}")
    
    def _init_database(self):
        """Initialize SQLite database schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS research_papers (
                    id TEXT PRIMARY KEY,
                    query_hash TEXT,
                    paper_data TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS query_results (
                    query_hash TEXT PRIMARY KEY,
                    query_data TEXT,
                    result_paper_ids TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_papers_query_hash ON research_papers(query_hash)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_papers_expires ON research_papers(expires_at)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_queries_expires ON query_results(expires_at)
            """)
            
            conn.commit()
    
    def _generate_query_hash(self, query: ResearchQuery) -> str:
        """Generate consistent hash for research query"""
        query_str = f"{query.query}|{query.intent}|{sorted(query.compounds)}|{query.max_results}"
        return hashlib.sha256(query_str.encode()).hexdigest()
    
    def _generate_paper_hash(self, paper: ResearchPaper) -> str:
        """Generate consistent hash for research paper"""
        paper_str = f"{paper.title}|{paper.journal}|{paper.year}|{paper.doi}"
        return hashlib.sha256(paper_str.encode()).hexdigest()
    
    async def get_query_results(self, query: ResearchQuery) -> Optional[List[ResearchPaper]]:
        """Retrieve cached results for a research query"""
        query_hash = self._generate_query_hash(query)
        
        # Check memory cache first
        with self.cache_lock:
            if query_hash in self.memory_cache:
                self.stats['hits'] += 1
                self.stats['memory_hits'] += 1
                self.access_times[query_hash] = datetime.now()
                
                cache_entry = self.memory_cache[query_hash]
                if datetime.now() < cache_entry['expires_at']:
                    logger.debug(f"Memory cache hit for query: {query.query[:50]}...")
                    return [ResearchPaper(**paper_data) for paper_data in cache_entry['papers']]
                else:
                    # Expired, remove from memory
                    del self.memory_cache[query_hash]
                    del self.access_times[query_hash]
        
        # Check disk cache
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT result_paper_ids, expires_at, access_count 
                    FROM query_results 
                    WHERE query_hash = ? AND expires_at > CURRENT_TIMESTAMP
                """, (query_hash,))
                
                row = cursor.fetchone()
                if row:
                    self.stats['hits'] += 1
                    self.stats['disk_hits'] += 1
                    
                    # Update access statistics
                    conn.execute("""
                        UPDATE query_results 
                        SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP
                        WHERE query_hash = ?
                    """, (query_hash,))
                    
                    # Get associated papers
                    paper_ids = json.loads(row['result_paper_ids'])
                    papers = []
                    
                    for paper_id in paper_ids:
                        paper_cursor = conn.execute("""
                            SELECT paper_data FROM research_papers 
                            WHERE id = ? AND expires_at > CURRENT_TIMESTAMP
                        """, (paper_id,))
                        
                        paper_row = paper_cursor.fetchone()
                        if paper_row:
                            paper_data = json.loads(paper_row['paper_data'])
                            papers.append(ResearchPaper(**paper_data))
                    
                    # Cache in memory for future access
                    if papers:
                        self._cache_in_memory(query_hash, papers, datetime.fromisoformat(row['expires_at']))
                        logger.debug(f"Disk cache hit for query: {query.query[:50]}...")
                        return papers
        
        except Exception as e:
            logger.error(f"Error reading from cache: {e}")
        
        self.stats['misses'] += 1
        return None
    
    async def cache_query_results(self, query: ResearchQuery, papers: List[ResearchPaper], 
                                ttl_hours: int = 24) -> bool:
        """Cache research query results"""
        if not papers:
            return False
        
        query_hash = self._generate_query_hash(query)
        expires_at = datetime.now() + timedelta(hours=ttl_hours)
        
        try:
            paper_ids = []
            
            # Cache individual papers
            with sqlite3.connect(self.db_path) as conn:
                for paper in papers:
                    paper_id = self._generate_paper_hash(paper)
                    paper_ids.append(paper_id)
                    
                    paper_data = {
                        'id': paper.id,
                        'title': paper.title,
                        'authors': paper.authors,
                        'year': paper.year,
                        'journal': paper.journal,
                        'abstract': paper.abstract,
                        'doi': paper.doi,
                        'pubmed_id': paper.pubmed_id,
                        'url': paper.url,
                        'source': paper.source,
                        'study_type': paper.study_type,
                        'credibility_score': paper.credibility_score,
                        'relevance_score': paper.relevance_score,
                        'citation_count': paper.citation_count,
                        'full_citation': paper.full_citation,
                        'keywords': paper.keywords
                    }
                    
                    conn.execute("""
                        INSERT OR REPLACE INTO research_papers 
                        (id, query_hash, paper_data, metadata, expires_at)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        paper_id,
                        query_hash,
                        json.dumps(paper_data),
                        json.dumps({'cached_at': datetime.now().isoformat()}),
                        expires_at
                    ))
                
                # Cache query result
                query_data = {
                    'query': query.query,
                    'intent': query.intent,
                    'compounds': query.compounds,
                    'max_results': query.max_results
                }
                
                conn.execute("""
                    INSERT OR REPLACE INTO query_results
                    (query_hash, query_data, result_paper_ids, metadata, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    query_hash,
                    json.dumps(query_data),
                    json.dumps(paper_ids),
                    json.dumps({'paper_count': len(papers), 'cached_at': datetime.now().isoformat()}),
                    expires_at
                ))
                
                conn.commit()
            
            # Cache in memory
            self._cache_in_memory(query_hash, papers, expires_at)
            
            logger.info(f"Cached {len(papers)} papers for query: {query.query[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error caching results: {e}")
            return False
    
    def _cache_in_memory(self, query_hash: str, papers: List[ResearchPaper], expires_at: datetime):
        """Cache query results in memory with LRU eviction"""
        with self.cache_lock:
            # Evict oldest entries if memory cache is full
            if len(self.memory_cache) >= self.max_memory_entries:
                self._evict_oldest_entries()
            
            paper_data = []
            for paper in papers:
                paper_dict = {
                    'id': paper.id,
                    'title': paper.title,
                    'authors': paper.authors,
                    'year': paper.year,
                    'journal': paper.journal,
                    'abstract': paper.abstract,
                    'doi': paper.doi,
                    'pubmed_id': paper.pubmed_id,
                    'url': paper.url,
                    'source': paper.source,
                    'study_type': paper.study_type,
                    'credibility_score': paper.credibility_score,
                    'relevance_score': paper.relevance_score,
                    'citation_count': paper.citation_count,
                    'full_citation': paper.full_citation,
                    'keywords': paper.keywords
                }
                paper_data.append(paper_dict)
            
            self.memory_cache[query_hash] = {
                'papers': paper_data,
                'expires_at': expires_at,
                'cached_at': datetime.now()
            }
            self.access_times[query_hash] = datetime.now()
    
    def _evict_oldest_entries(self):
        """Evict oldest memory cache entries to maintain size limit"""
        if len(self.access_times) > self.max_memory_entries * 0.1:  # Evict 10% when full
            # Sort by access time and remove oldest
            sorted_entries = sorted(self.access_times.items(), key=lambda x: x[1])
            entries_to_remove = int(len(sorted_entries) * 0.1)
            
            for query_hash, _ in sorted_entries[:entries_to_remove]:
                if query_hash in self.memory_cache:
                    del self.memory_cache[query_hash]
                if query_hash in self.access_times:
                    del self.access_times[query_hash]
    
    async def cleanup_expired(self) -> int:
        """Remove expired entries from cache"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Count expired entries
                cursor = conn.execute("""
                    SELECT COUNT(*) FROM research_papers WHERE expires_at <= CURRENT_TIMESTAMP
                """)
                expired_papers = cursor.fetchone()[0]
                
                cursor = conn.execute("""
                    SELECT COUNT(*) FROM query_results WHERE expires_at <= CURRENT_TIMESTAMP
                """)
                expired_queries = cursor.fetchone()[0]
                
                # Delete expired entries
                conn.execute("DELETE FROM research_papers WHERE expires_at <= CURRENT_TIMESTAMP")
                conn.execute("DELETE FROM query_results WHERE expires_at <= CURRENT_TIMESTAMP")
                conn.commit()
                
                total_expired = expired_papers + expired_queries
                if total_expired > 0:
                    logger.info(f"Cleaned up {total_expired} expired cache entries")
                
                return total_expired
                
        except Exception as e:
            logger.error(f"Error during cache cleanup: {e}")
            return 0
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        with self.cache_lock:
            total_requests = self.stats['hits'] + self.stats['misses']
            hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
            memory_entries = len(self.memory_cache)
        
        # Get disk statistics
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("SELECT COUNT(*) FROM research_papers")
                disk_papers = cursor.fetchone()[0]
                
                cursor = conn.execute("SELECT COUNT(*) FROM query_results")
                disk_queries = cursor.fetchone()[0]
        except:
            disk_papers = 0
            disk_queries = 0
        
        return {
            'hit_rate_percent': round(hit_rate, 2),
            'total_hits': self.stats['hits'],
            'total_misses': self.stats['misses'],
            'memory_hits': self.stats['memory_hits'],
            'disk_hits': self.stats['disk_hits'],
            'memory_entries': memory_entries,
            'disk_papers': disk_papers,
            'disk_queries': disk_queries,
            'max_memory_entries': self.max_memory_entries
        }
    
    async def close(self):
        """Clean shutdown of cache"""
        try:
            await self.cleanup_expired()
            logger.info("Research cache shutdown complete")
        except Exception as e:
            logger.error(f"Error during cache shutdown: {e}")


# Global cache instance (singleton pattern)
_global_cache: Optional[ResearchCache] = None


def get_research_cache() -> ResearchCache:
    """Get or create global research cache instance"""
    global _global_cache
    if _global_cache is None:
        _global_cache = ResearchCache()
    return _global_cache


async def clear_cache():
    """Clear all cache data"""
    cache = get_research_cache()
    with cache.cache_lock:
        cache.memory_cache.clear()
        cache.access_times.clear()
    
    try:
        with sqlite3.connect(cache.db_path) as conn:
            conn.execute("DELETE FROM research_papers")
            conn.execute("DELETE FROM query_results")
            conn.commit()
        logger.info("All cache data cleared")
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")