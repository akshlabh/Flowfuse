"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, Zap, GitBranch, Workflow } from "lucide-react";

export const Hero = () => {

  const router = useRouter();

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Automate Everything, Connect Anything
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Connect Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Apps{" "}
            </span>
            <br />
            Automate Your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Workflow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Build powerful automations without code. Connect 5,000+ apps and
            services to streamline your business processes in minutes, not
            hours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto"
              onClick={() => {
                router.push("/signup");
              }}
            >
              Start Automating Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Visual Elements */}
        <div className="mt-20 relative">
          <div className="flex justify-center items-center space-x-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              <GitBranch className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-4xl text-gray-400">→</div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              <Workflow className="w-12 h-12 text-purple-600" />
            </div>
            <div className="text-4xl text-gray-400">→</div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
              <Zap className="w-12 h-12 text-pink-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
