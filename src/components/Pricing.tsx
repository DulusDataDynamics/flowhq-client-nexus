
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 Active Client",
        "5GB Storage",
        "Basic Messaging",
        "File Sharing",
        "Mobile App Access",
        "Community Support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For growing freelancers",
      features: [
        "10 Active Clients",
        "100GB Storage",
        "Custom Branding",
        "Advanced Analytics",
        "E-Signature",
        "Payment Processing",
        "Priority Support",
        "FlowBot AI Assistant"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Agency",
      price: "$99",
      period: "/month",
      description: "For teams and agencies",
      features: [
        "Unlimited Clients",
        "1TB Storage",
        "Team Collaboration",
        "White-Label Solution",
        "Advanced Workflows",
        "API Access",
        "Dedicated Support",
        "Custom Integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Pricing for Everyone
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no long-term contracts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${
              plan.popular 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white transform scale-105' 
                : 'bg-white'
            }`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1">
                  <Zap className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-4 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>
                
                <Button 
                  className={`w-full py-3 text-lg font-semibold rounded-xl transition-all ${
                    plan.popular 
                      ? 'bg-white text-blue-600 hover:bg-blue-50' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={`${plan.popular ? 'text-blue-100' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
