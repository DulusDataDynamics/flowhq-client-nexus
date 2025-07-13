
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, FileText, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Bot className="w-4 h-4 mr-2" />
            Powered by Advanced AI Technology
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Complete
            <span className="text-blue-600 block">Client Collaboration</span>
            & AI Workspace
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            FlowHQ combines premium client portals with powerful AI assistance. 
            Generate documents, analyze data, create images, and automate workflows - all in one elegant platform.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/dashboard')}
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-gray-300"
              onClick={() => navigate('/dashboard')}
            >
              Try AI Assistant
            </Button>
          </div>
          
          {/* Feature icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Smart Document Generation</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Bot className="h-5 w-5 text-blue-600" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero image/demo mockup */}
      <div className="container mx-auto px-4 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
                <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Meet Sparky - Your AI Assistant</h3>
                <p className="text-gray-600 mb-6">
                  Generate documents, create images, analyze data, build spreadsheets, and automate your entire workflow
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <span>Document Generation</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <span>Data Analysis</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <Bot className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <span>Image Creation</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <ArrowRight className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <span>Workflow Automation</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-blue-600 text-white p-3 rounded-xl shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div className="absolute -top-4 -right-4 bg-green-600 text-white p-3 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white p-3 rounded-xl shadow-lg">
              <Bot className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
