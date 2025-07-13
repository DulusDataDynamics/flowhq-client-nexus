
import { Card } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  MessageCircle, 
  Upload, 
  FileText, 
  Smartphone, 
  Shield, 
  Zap,
  Globe,
  Palette,
  Bell,
  BarChart3
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Centralize all client interactions with personalized, branded portals for each client."
    },
    {
      icon: CreditCard,
      title: "Global Payments",
      description: "Accept payments in USD, GBP, EUR, ZAR with PayFast, Stripe, and PayPal integration."
    },
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Built-in chat system with real-time notifications and file sharing capabilities."
    },
    {
      icon: Upload,
      title: "Secure File Sharing",
      description: "Encrypted document storage with easy upload/download for clients and teams."
    },
    {
      icon: FileText,
      title: "Digital Contracts",
      description: "Create, send, and manage contracts with e-signature functionality."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Fully responsive interface that works perfectly on all devices."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and security measures to protect sensitive data."
    },
    {
      icon: Zap,
      title: "FlowBot AI Assistant",
      description: "Sparky AI helps automate workflows and provides intelligent insights."
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Auto-switching currencies based on client location with real-time rates."
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "White-label solution with custom logos, colors, and welcome messages."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated reminders for invoices, deadlines, and project updates."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights and custom reports for business growth tracking."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Scale Your Business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FlowHQ brings together all the tools freelancers and agencies need to deliver 
            a premium client experience and grow their business efficiently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-gray-50">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
