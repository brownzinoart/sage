from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

# Try to import enhanced service, fallback to advanced
try:
    from app.services.enhanced_sage_service import EnhancedSageService
    sage_service = EnhancedSageService()
    ENHANCED_AVAILABLE = True
except ImportError as e:
    print(f"Enhanced service not available, using fallback: {e}")
    from app.services.advanced_gemini_service import AdvancedGeminiService
    sage_service = AdvancedGeminiService()
    ENHANCED_AVAILABLE = False

router = APIRouter()

class SageQuery(BaseModel):
    query: str
    experience_level: Optional[str] = "curious"

class SageResponse(BaseModel):
    explanation: str
    products: List[Dict[str, Any]]
    intent: Optional[str] = None
    persona: Optional[str] = None
    follow_up_questions: Optional[List[str]] = None
    educational_resources: Optional[Dict[str, Any]] = None
    educational_summary: Optional[Dict[str, Any]] = None

@router.post("/ask", response_model=SageResponse)
async def ask_sage(query: SageQuery):
    """
    Enhanced Sage endpoint with AI reasoning and educational research
    """
    
    try:
        # Use enhanced service if available, otherwise fallback
        if ENHANCED_AVAILABLE and hasattr(sage_service, 'generate_enhanced_sage_response'):
            response_data = await sage_service.generate_enhanced_sage_response(
                query.query, 
                experience_level=query.experience_level
            )
        else:
            # Fallback to standard response
            response_data = sage_service.generate_sage_response(
                query.query, 
                experience_level=query.experience_level
            )
        
        return SageResponse(
            explanation=response_data['explanation'],
            products=response_data['products'],
            intent=response_data.get('intent'),
            persona=response_data.get('persona'),
            follow_up_questions=response_data.get('follow_up_questions', []),
            educational_resources=response_data.get('educational_resources'),
            educational_summary=response_data.get('educational_summary')
        )
        
    except Exception as e:
        print(f"Error processing Sage query: {e}")
        raise HTTPException(status_code=500, detail="Error processing query")

@router.get("/health")
async def sage_health():
    """Health check for Sage service"""
    health_info = {
        "status": "healthy",
        "service": "Enhanced Sage AI with Educational Research" if ENHANCED_AVAILABLE else "Advanced Sage AI",
        "gemini_available": sage_service.is_available(),
        "enhanced_features": ENHANCED_AVAILABLE
    }
    
    # Check educational MCP if available
    if ENHANCED_AVAILABLE and hasattr(sage_service, 'educational_mcp') and sage_service.educational_mcp:
        health_info["educational_research"] = True
        health_info["mcp_server"] = "Educational MCP Server Online"
    else:
        health_info["educational_research"] = False
        health_info["mcp_server"] = "Educational MCP Server Unavailable"
    
    return health_info

@router.get("/cache-stats")
async def get_cache_stats():
    """Get cache performance statistics"""
    try:
        if ENHANCED_AVAILABLE and hasattr(sage_service, 'educational_mcp') and sage_service.educational_mcp:
            if hasattr(sage_service.educational_mcp.aggregator, 'get_cache_stats'):
                cache_stats = sage_service.educational_mcp.aggregator.get_cache_stats()
                return {
                    "cache_available": True,
                    "statistics": cache_stats
                }
        
        return {
            "cache_available": False,
            "message": "Cache statistics not available"
        }
    except Exception as e:
        return {
            "cache_available": False,
            "error": str(e)
        }

# New specialized endpoints

class StrainQuery(BaseModel):
    strain_name: Optional[str] = None
    effects: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    max_results: Optional[int] = 5

@router.post("/strains")
async def search_strains(query: StrainQuery):
    """Search for cannabis strains by name, effects, or medical conditions"""
    try:
        if not ENHANCED_AVAILABLE:
            raise HTTPException(status_code=503, detail="Enhanced Sage service not available")
        
        results = []
        
        # Search by specific strain name
        if query.strain_name:
            if hasattr(sage_service.educational_mcp, 'aggregator'):
                leafly_client = sage_service.educational_mcp.aggregator.leafly_client
                strain_details = await leafly_client.get_strain_details(query.strain_name)
                if strain_details:
                    results.append({
                        "type": "strain_profile",
                        "data": strain_details
                    })
        
        # Search by effects
        if query.effects:
            if hasattr(sage_service.educational_mcp, 'aggregator'):
                leafly_client = sage_service.educational_mcp.aggregator.leafly_client
                terpene_aggregator = sage_service.educational_mcp.aggregator.terpene_aggregator
                
                # Get strains from Leafly
                strains = await leafly_client.search_by_effects(query.effects, query.max_results)
                results.extend([{"type": "strain", "data": strain} for strain in strains])
                
                # Get relevant terpenes
                terpenes = terpene_aggregator.search_by_effects(query.effects)
                results.extend([{"type": "terpene", "data": terpene} for terpene in terpenes[:3]])
        
        return {
            "query": query.dict(),
            "results": results,
            "total_found": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in strain search: {e}")
        raise HTTPException(status_code=500, detail="Error searching strains")

class TerpeneQuery(BaseModel):
    terpene_name: Optional[str] = None
    terpenes: Optional[List[str]] = None
    effects: Optional[List[str]] = None
    analysis_type: Optional[str] = "profile"  # profile, combination, effects

@router.post("/terpenes")
async def analyze_terpenes(query: TerpeneQuery):
    """Analyze terpenes individually or in combination"""
    try:
        if not ENHANCED_AVAILABLE:
            raise HTTPException(status_code=503, detail="Enhanced Sage service not available")
        
        if not hasattr(sage_service.educational_mcp, 'aggregator'):
            raise HTTPException(status_code=503, detail="Terpene aggregator not available")
        
        terpene_aggregator = sage_service.educational_mcp.aggregator.terpene_aggregator
        
        # Single terpene profile
        if query.terpene_name:
            profile = terpene_aggregator.get_terpene_profile(query.terpene_name)
            if not profile:
                raise HTTPException(status_code=404, detail="Terpene not found")
            
            return {
                "query": query.dict(),
                "result_type": "single_profile",
                "terpene_profile": profile
            }
        
        # Terpene combination analysis
        if query.terpenes and query.analysis_type == "combination":
            analysis = terpene_aggregator.analyze_terpene_combination(query.terpenes)
            return {
                "query": query.dict(),
                "result_type": "combination_analysis",
                "analysis": analysis
            }
        
        # Search by effects
        if query.effects:
            matching_terpenes = terpene_aggregator.search_by_effects(query.effects)
            return {
                "query": query.dict(),
                "result_type": "effects_search",
                "matching_terpenes": matching_terpenes
            }
        
        # Default: return summary stats
        stats = terpene_aggregator.get_terpene_summary_stats()
        all_terpenes = terpene_aggregator.get_all_terpenes()
        
        return {
            "query": query.dict(),
            "result_type": "database_overview",
            "available_terpenes": all_terpenes,
            "database_stats": stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in terpene analysis: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing terpenes")

class CompoundQuery(BaseModel):
    compound: str
    analysis_type: Optional[str] = "profile"  # profile, interactions, safety

@router.post("/compounds")
async def analyze_compounds(query: CompoundQuery):
    """Analyze chemical compounds (cannabinoids, terpenes)"""
    try:
        if not ENHANCED_AVAILABLE:
            raise HTTPException(status_code=503, detail="Enhanced Sage service not available")
        
        if not hasattr(sage_service.educational_mcp, 'aggregator'):
            raise HTTPException(status_code=503, detail="Chemical analysis not available")
        
        pubchem_client = sage_service.educational_mcp.aggregator.pubchem_client
        
        if query.analysis_type == "interactions":
            interactions = await pubchem_client.get_compound_interactions(query.compound)
            return {
                "query": query.dict(),
                "result_type": "interactions",
                "interactions": interactions
            }
        
        # Default: compound profile
        compound_data = await pubchem_client._get_compound_data(query.compound)
        if not compound_data:
            raise HTTPException(status_code=404, detail="Compound not found")
        
        return {
            "query": query.dict(),
            "result_type": "compound_profile", 
            "compound_data": compound_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in compound analysis: {e}")
        raise HTTPException(status_code=500, detail="Error analyzing compound")

class ResearchQuery(BaseModel):
    topic: str
    source_priority: Optional[str] = "balanced"  # academic, industry, government, balanced
    max_results: Optional[int] = 10

@router.post("/research")
async def specialized_research(query: ResearchQuery):
    """Perform specialized research with source prioritization"""
    try:
        if not ENHANCED_AVAILABLE:
            raise HTTPException(status_code=503, detail="Enhanced research not available")
        
        # Create a research query with source prioritization
        from backend.mcp_educational.mcp_types import ResearchQuery as MCPResearchQuery
        
        research_query = MCPResearchQuery(
            query=query.topic,
            intent="research",
            compounds=["CBD"],  # Default, will be extracted from query
            max_results=query.max_results
        )
        
        # Get research results
        results = await sage_service.educational_mcp._fetch_research_evidence(
            research_query.query,
            research_query.intent,
            research_query.compounds,
            query.max_results
        )
        
        return {
            "query": query.dict(),
            "research_results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in specialized research: {e}")
        raise HTTPException(status_code=500, detail="Error performing research")