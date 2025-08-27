from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import requests
import json
import subprocess
import os
from .base import Agent, Task
from .registry import register

@register
@dataclass
class TestingQaExpert(Agent):
    name: str = "Testing/QA Expert"
    capabilities: List[str] = None
    cost_weight: float = 0.7

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = ['qa', 'testing', 'automation', 'api_testing', 'integration_testing']

    def suitability(self, task: Task) -> float:
        score = 0.0
        # Enhanced tag/goal matching for QA tasks
        qa_keywords = ['qa', 'testing', 'test', 'quality', 'bug', 'validation', 'verification']
        for t in qa_keywords:
            if t in task.tags:
                score += 0.25
        for g in task.goals:
            if any(k in g.lower() for k in qa_keywords):
                score += 0.20
        # Bonus for API-related tasks
        api_keywords = ['api', 'endpoint', 'backend', 'frontend', 'connection']
        for g in task.goals:
            if any(k in g.lower() for k in api_keywords):
                score += 0.15
        return min(score, 1.0)

    def test_api_endpoints(self, base_url: str = "http://localhost:8000") -> Dict[str, Any]:
        """Test all API endpoints and return results"""
        test_results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": [],
            "endpoint_results": {}
        }
        
        # Define API endpoints to test
        endpoints = {
            "health_check": {"method": "GET", "url": f"{base_url}/health", "expected_status": 200},
            "root": {"method": "GET", "url": f"{base_url}/", "expected_status": 200},
            "products_list": {"method": "GET", "url": f"{base_url}/api/v1/products/", "expected_status": 200},
            "sage_health": {"method": "GET", "url": f"{base_url}/api/v1/sage/health", "expected_status": 200},
            "sage_ask": {
                "method": "POST", 
                "url": f"{base_url}/api/v1/sage/ask",
                "data": {"query": "test sleep products", "experience_level": "curious"},
                "expected_status": 200
            }
        }
        
        for test_name, config in endpoints.items():
            test_results["total_tests"] += 1
            try:
                if config["method"] == "GET":
                    response = requests.get(config["url"], timeout=10)
                elif config["method"] == "POST":
                    response = requests.post(
                        config["url"], 
                        json=config.get("data", {}), 
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                
                success = response.status_code == config["expected_status"]
                test_results["endpoint_results"][test_name] = {
                    "status": "PASS" if success else "FAIL",
                    "status_code": response.status_code,
                    "expected_status": config["expected_status"],
                    "response_time_ms": response.elapsed.total_seconds() * 1000,
                    "has_json_response": self._is_json_response(response)
                }
                
                if success:
                    test_results["passed"] += 1
                else:
                    test_results["failed"] += 1
                    test_results["errors"].append(f"{test_name}: Expected {config['expected_status']}, got {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                test_results["failed"] += 1
                test_results["errors"].append(f"{test_name}: Connection error - {str(e)}")
                test_results["endpoint_results"][test_name] = {
                    "status": "ERROR",
                    "error": str(e)
                }
        
        return test_results

    def _is_json_response(self, response) -> bool:
        """Check if response contains valid JSON"""
        try:
            response.json()
            return True
        except:
            return False

    def test_frontend_backend_integration(self) -> Dict[str, Any]:
        """Test frontend-backend integration"""
        integration_results = {
            "frontend_running": False,
            "backend_running": False,
            "api_connectivity": False,
            "env_configuration": False
        }
        
        # Check if backend is running
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            integration_results["backend_running"] = response.status_code == 200
        except:
            pass
        
        # Check if frontend is accessible
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            integration_results["frontend_running"] = response.status_code == 200
        except:
            pass
        
        # Test API connectivity
        if integration_results["backend_running"]:
            try:
                response = requests.post(
                    "http://localhost:8000/api/v1/sage/ask",
                    json={"query": "test", "experience_level": "curious"},
                    timeout=10
                )
                integration_results["api_connectivity"] = response.status_code == 200
            except:
                pass
        
        # Check environment configuration
        env_file_path = "/Users/wallymo/sage/frontend/.env.local"
        if os.path.exists(env_file_path):
            with open(env_file_path, 'r') as f:
                env_content = f.read()
                integration_results["env_configuration"] = "localhost:8000" in env_content
        
        return integration_results

    def generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        api_results = self.test_api_endpoints()
        integration_results = self.test_frontend_backend_integration()
        
        return {
            "test_timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
            "api_testing": api_results,
            "integration_testing": integration_results,
            "overall_status": "PASS" if api_results["failed"] == 0 and integration_results["api_connectivity"] else "FAIL",
            "recommendations": self._generate_recommendations(api_results, integration_results)
        }

    def _generate_recommendations(self, api_results: Dict, integration_results: Dict) -> List[str]:
        """Generate actionable recommendations based on test results"""
        recommendations = []
        
        if api_results["failed"] > 0:
            recommendations.append("Fix failing API endpoints before deployment")
            recommendations.extend([f"- {error}" for error in api_results["errors"][:3]])
        
        if not integration_results["backend_running"]:
            recommendations.append("Ensure backend server is running on port 8000")
            
        if not integration_results["frontend_running"]:
            recommendations.append("Ensure frontend server is running on port 3000")
            
        if not integration_results["api_connectivity"]:
            recommendations.append("Check API connectivity between frontend and backend")
            
        if not integration_results["env_configuration"]:
            recommendations.append("Update frontend .env.local to point to localhost:8000")
            
        if len(recommendations) == 0:
            recommendations.append("All tests passing! System is ready for deployment")
            
        return recommendations

    def plan(self, task: Task) -> Dict[str, Any]:
        """Enhanced planning for QA tasks"""
        qa_plan = {
            "steps": [
                "Analyze current testing infrastructure",
                "Identify critical API endpoints",
                "Run comprehensive API tests",
                "Test frontend-backend integration",
                "Generate test report with recommendations",
                "Set up automated testing pipeline"
            ],
            "deliverables": [
                "API test results",
                "Integration test report", 
                "QA recommendations",
                "Testing automation scripts"
            ],
            "testing_scope": {
                "api_endpoints": ["health", "products", "sage", "chat"],
                "integration_points": ["frontend-backend", "database", "external APIs"],
                "test_types": ["unit", "integration", "end-to-end", "performance"]
            }
        }
        return qa_plan

    def act(self, task: Task, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute QA testing with real functionality"""
        
        # Run comprehensive testing
        test_report = self.generate_test_report()
        
        # Determine action based on results
        if test_report["overall_status"] == "PASS":
            outcome = "✅ All QA tests passed - System ready for deployment"
        else:
            outcome = f"⚠️  QA tests failed - {test_report['api_testing']['failed']} API issues found"
            
        return {
            "key_outcome": outcome,
            "test_results": test_report,
            "next_steps": [
                "Address failing tests",
                "Set up CI/CD pipeline",
                "Add performance testing",
                "Implement error monitoring"
            ],
            "quality_metrics": {
                "api_test_coverage": f"{test_report['api_testing']['total_tests']} endpoints tested",
                "pass_rate": f"{(test_report['api_testing']['passed'] / test_report['api_testing']['total_tests'] * 100):.1f}%",
                "integration_status": "✅ Connected" if test_report['integration_testing']['api_connectivity'] else "❌ Disconnected"
            }
        }
