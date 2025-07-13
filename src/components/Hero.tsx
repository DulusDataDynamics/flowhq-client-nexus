
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, DollarSign, MessageSquare, Upload, FileIcon } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                All-in-One Client Portal
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  for Freelancers & Agencies
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Streamline your workflow with client management, invoicing, messaging, and more. 
                Turn every interaction into a premium experience.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl transition-all text-lg font-semibold"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Card className="bg-white shadow-2xl rounded-2xl p-8 border-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">Client Name</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-700">Contract</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-700">Invoice</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-6 h-6 text-gray-600" />
                      <span className="font-medium text-gray-700">Messages</span>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Upload file</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2 p-3 bg-blue-50 rounded-lg">
                      <FileIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">sample.pdf</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
