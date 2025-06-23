import { useState, useEffect } from 'react';

interface SuperIntelligentAnalysisRequest {
  productName: string;
  brand: string;
  modelNumber?: string;
  country: string;
  brandWebsiteUrl?: string;
}

interface AgentStatus {
  status: string;
  specialization?: string;
  capabilities: string[];
  efficiency?: number;
  accuracy?: number;
}

interface AnalysisResult {
  success: boolean;
  analysis_type: string;
  traditional_analysis: any;
  enhanced_analysis: any;
  super_intelligent_insights: any;
  actionable_plan: any;
  metadata: any;
  error?: string;
}

export default function SuperIntelligentAnalysisPage() {
  const [request, setRequest] = useState<SuperIntelligentAnalysisRequest>({
    productName: '',
    brand: '',
    modelNumber: '',
    country: 'Global',
    brandWebsiteUrl: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatus>>({});
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  // Load agent status on component mount
  useEffect(() => {
    loadAgentStatus();
  }, []);

  const loadAgentStatus = async () => {
    try {
      const response = await fetch('/api/super-intelligent/agent-status');
      const data = await response.json();
      setAgentStatus(data.agents || {});
    } catch (error) {
      console.error('Failed to load agent status:', error);
    }
  };

  const handleInputChange = (field: keyof SuperIntelligentAnalysisRequest, value: string) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const runSuperIntelligentAnalysis = async () => {
    if (!request.productName || !request.brand) {
      alert('Please enter both product name and brand');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentPhase('Initializing super-intelligent analysis...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev < 90) {
            const phases = [
              'Activating multi-agent system...',
              'Running traditional competitive analysis...',
              'Coordinating agent collaboration...',
              'Market researcher analyzing competitors...',
              'Price analyzer optimizing pricing strategy...',
              'Brand strategist developing positioning...',
              'Trend analyst predicting market movements...',
              'Competitive intelligence gathering insights...',
              'Synthesizing 10X smarter insights...',
              'Generating actionable recommendations...'
            ];
            const phaseIndex = Math.floor(prev / 10);
            if (phaseIndex < phases.length) {
              setCurrentPhase(phases[phaseIndex]);
            }
            return prev + 2;
          }
          return prev;
        });
      }, 500);

      const response = await fetch('/api/super-intelligent/super-intelligent-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setCurrentPhase('Analysis complete!');
      setAnalysisResult(result);

    } catch (error) {
      console.error('Super-intelligent analysis failed:', error);
      setAnalysisResult({
        success: false,
        error: 'Failed to complete super-intelligent analysis',
        analysis_type: 'super_intelligent_competitive_analysis',
        traditional_analysis: {},
        enhanced_analysis: {},
        super_intelligent_insights: {},
        actionable_plan: {},
        metadata: {}
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#10b981'; // green
      case 'active': return '#3b82f6'; // blue
      case 'busy': return '#f59e0b'; // yellow
      case 'error': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🧠 Super-Intelligent Competitive Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              10X smarter insights through multi-agent AI collaboration
            </p>
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            ⚡ 10X Intelligence Amplification
          </div>
        </div>

        {/* Agent Status Panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📊 Multi-Agent System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(agentStatus).map(([agentType, status]) => (
              <div key={agentType} className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                <div className="text-2xl">
                  {agentType === 'coordinator' && '🎯'}
                  {agentType === 'market_researcher' && '👥'}
                  {agentType === 'price_analyzer' && '💰'}
                  {agentType === 'brand_strategist' && '🎨'}
                  {agentType === 'trend_analyst' && '📈'}
                  {agentType === 'competitive_intelligence' && '🛡️'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {agentType.replace('_', ' ')}
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getAgentStatusColor(status.status) }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{status.specialization}</p>
                  {status.efficiency && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs">Efficiency:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${status.efficiency}%` }}
                        />
                      </div>
                      <span className="text-xs">{status.efficiency}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Input Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Product Analysis Request</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={request.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={request.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Number
                </label>
                <input
                  type="text"
                  value={request.modelNumber}
                  onChange={(e) => handleInputChange('modelNumber', e.target.value)}
                  placeholder="Enter model number (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country/Region
                </label>
                <input
                  type="text"
                  value={request.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Global"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Website URL
              </label>
              <input
                type="url"
                value={request.brandWebsiteUrl}
                onChange={(e) => handleInputChange('brandWebsiteUrl', e.target.value)}
                placeholder="https://example.com (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button 
              onClick={runSuperIntelligentAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                isAnalyzing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isAnalyzing ? (
                <>🧠 Running Super-Intelligent Analysis...</>
              ) : (
                <>⚡ Start 10X Smarter Analysis</>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Progress</span>
                <span className="text-sm text-gray-600">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                ⏰ {currentPhase}
              </p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {analysisResult.success ? '✅' : '❌'} Super-Intelligent Analysis Results
            </h2>
            
            {analysisResult.success ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Market Intelligence</h3>
                    <p className="text-sm text-blue-700">
                      Comprehensive competitive landscape analysis completed
                    </p>
                    <div className="mt-2 text-lg font-bold text-blue-600">
                      Attractiveness: {analysisResult.super_intelligent_insights?.market_intelligence?.market_attractiveness || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-green-800 mb-2">💡 Strategic Opportunities</h3>
                    <p className="text-sm text-green-700">
                      {analysisResult.super_intelligent_insights?.strategic_opportunities?.length || 0} opportunities identified
                    </p>
                    <div className="mt-2 text-sm">
                      {analysisResult.super_intelligent_insights?.strategic_opportunities?.slice(0, 2).map((opp: any, index: number) => (
                        <div key={index} className="text-green-600">
                          • {opp.opportunity || opp}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h3 className="font-semibold text-purple-800 mb-2">🎯 Confidence Score</h3>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-200 rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full"
                            style={{ width: `${(analysisResult.super_intelligent_insights?.confidence_score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-purple-600">
                          {((analysisResult.super_intelligent_insights?.confidence_score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">💰 Pricing Analysis</h3>
                  {analysisResult.traditional_analysis?.retailers?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.traditional_analysis.retailers.slice(0, 6).map((retailer: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                          <div>
                            <span className="font-medium">{retailer.retailer}</span>
                            {retailer.officialsite && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Official
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-green-600">{retailer.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🚀 Actionable Recommendations</h3>
                  {analysisResult.actionable_plan?.immediate_actions?.length > 0 && (
                    <div className="space-y-2">
                      {analysisResult.actionable_plan.immediate_actions.slice(0, 5).map((action: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50">
                          <span className="text-green-500 mt-1">✅</span>
                          <div>
                            <div className="font-medium">{action.action}</div>
                            <div className="text-sm text-gray-600">
                              Priority: {action.priority} | Timeline: {action.timeline}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">📈 Success Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResult.actionable_plan?.success_metrics?.map((metric: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg text-center bg-green-50">
                        <div className="font-medium text-gray-700">{metric.metric}</div>
                        <div className="text-2xl font-bold text-green-600">{metric.target}</div>
                        <div className="text-sm text-gray-600">{metric.timeline}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  {analysisResult.error || 'Analysis failed. Please try again.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
