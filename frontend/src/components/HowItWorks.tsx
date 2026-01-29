import { ArrowRight, Plus, Play, CheckCircle } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Choose Your Apps",
      description:
        "Select from 5,000+ apps including Gmail, Slack, Shopify, and more.",
      icon: Plus,
    },
    {
      step: "02",
      title: "Set Your Trigger",
      description: "Define what event will start your automation workflow.",
      icon: Play,
    },
    {
      step: "03",
      title: "Add Actions",
      description:
        "Choose what happens next with unlimited action possibilities.",
      icon: ArrowRight,
    },
    {
      step: "04",
      title: "Activate & Relax",
      description: "Turn on your automation and watch it work 24/7.",
      icon: CheckCircle,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes with our simple 4-step process. No coding
            required!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-6">
                  {step.step}
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
