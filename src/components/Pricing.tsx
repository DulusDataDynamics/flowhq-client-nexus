
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  const plans = [
    {
      name: "Trial",
      price: "$0",
      period: "5 days",
      description: "Full access to test all features",
      features: [
        "30 active clients",
        "5GB storage",
        "All messaging features",
        "Email support",
        "FlowBot AI Assistant"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: isAnnual ? "$20" : "$20",
      period: isAnnual ? "/month (billed annually)" : "/month",
      description: "Everything you need to grow",
      features: [
        "150 active clients",
        "100GB storage",
        "Custom branding",
        "Advanced analytics",
        "Priority support",
        "FlowBot AI Assistant",
        "E-signature",
        "Payment processing"
      ],
      cta: "Start Professional",
      popular: true
    },
    {
      name: "Agency",
      price: isAnnual ? "$99" : "$119",
      period: isAnnual ? "/month (billed annually)" : "/month",
      description: "For agencies and large teams",
      features: [
        "Unlimited clients",
        "1TB storage",
        "Team collaboration",
        "White-label solution",
        "Advanced workflows",
        "API access",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Start Agency",
      popular: false
    }
  ];

  const handleGetStarted = (planName: string) => {
    if (user) {
      // Redirect to dashboard if already logged in
      window.location.href = '/dashboard';
    } else {
      // Redirect to auth page
      window.location.href = '/dashboard';
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your client management needs
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`${!isAnnual ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${isAnnual ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Annual
              <span className="ml-1 text-sm text-green-600">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {plan.period}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => handleGetStarted(plan.name)}
                >
                  {plan.name === 'Trial' && <Zap className="mr-2 h-4 w-4" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
