import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  UserGroupIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"

export default function AboutPage() {
  const stats = [
    { label: "Active Job Seekers", value: "10,000+", icon: UserGroupIcon },
    { label: "Job Opportunities", value: "5,000+", icon: BriefcaseIcon },
    { label: "Partner Companies", value: "500+", icon: BuildingOfficeIcon },
    { label: "Successful Placements", value: "2,500+", icon: ChartBarIcon },
  ]

  const features = [
    {
      title: "AI-Powered Matching",
      description:
        "Our advanced AI technology analyzes your CV and matches you with the most relevant job opportunities.",
      icon: LightBulbIcon,
    },
    {
      title: "Secure & Private",
      description:
        "Your data is protected with enterprise-grade security. We never share your information without consent.",
      icon: ShieldCheckIcon,
    },
    {
      title: "Local Focus",
      description:
        "Specialized in the Tunisian job market with deep understanding of local industries and requirements.",
      icon: GlobeAltIcon,
    },
    {
      title: "Personalized Experience",
      description:
        "Tailored job recommendations and career insights based on your skills, experience, and preferences.",
      icon: HeartIcon,
    },
  ]

  const team = [
    {
      name: "Ahmed Ben Ali",
      role: "CEO & Founder",
      description: "10+ years in HR technology and talent acquisition in Tunisia.",
    },
    {
      name: "Fatima Trabelsi",
      role: "CTO",
      description: "AI and machine learning expert with focus on recruitment technology.",
    },
    {
      name: "Mohamed Karray",
      role: "Head of Partnerships",
      description: "Building relationships with top employers across Tunisia.",
    },
    {
      name: "Leila Mansouri",
      role: "Head of Product",
      description: "Designing user experiences that connect talent with opportunity.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About JobVector</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Connecting talented professionals with amazing opportunities across Tunisia through the power of AI and
              technology.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              To revolutionize the job search experience in Tunisia by leveraging artificial intelligence to create
              meaningful connections between job seekers and employers, fostering career growth and business success.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why JobVector?</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Founded in 2024, JobVector emerged from a simple observation: the traditional job search process in
                  Tunisia was outdated and inefficient. Job seekers were spending countless hours applying to irrelevant
                  positions, while employers struggled to find qualified candidates.
                </p>
                <p className="text-gray-600">
                  We built JobVector to solve this problem using cutting-edge AI technology that understands both
                  candidate skills and employer needs, creating perfect matches that benefit everyone.
                </p>
                <p className="text-gray-600">
                  Today, we're proud to be Tunisia's leading AI-powered job platform, helping thousands of professionals
                  advance their careers while enabling companies to build exceptional teams.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-full p-2">
                    <LightBulbIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation First</h4>
                    <p className="text-gray-600 text-sm">Cutting-edge AI technology</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 rounded-full p-2">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trust & Security</h4>
                    <p className="text-gray-600 text-sm">Your data is always protected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 rounded-full p-2">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">People Focused</h4>
                    <p className="text-gray-600 text-sm">Every decision puts users first</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Makes Us Different</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine advanced technology with deep market knowledge to deliver an unparalleled job search experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate professionals dedicated to transforming the job market in Tunisia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The principles that guide everything we do at JobVector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <LightBulbIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-blue-100">
                We continuously push the boundaries of what's possible in recruitment technology.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Empathy</h3>
              <p className="text-blue-100">
                We understand the challenges of job searching and hiring, and we're here to help.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-blue-100">We operate with transparency, honesty, and respect for all our users.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about JobVector? We'd love to hear from you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">contact@jobvector.tn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600">+216 70 123 456</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-gray-600">Tunis, Tunisia</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
