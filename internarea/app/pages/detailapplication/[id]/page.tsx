"use client";
import axios from "axios";
import { Building2, Calendar, FileText, Loader2, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const params = useParams();
  const id = params?.id;
  const [loading, setloading] = useState(false);
  const [data, setdata] = useState<any>(null);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        setloading(true);
        const res = await axios.get(`http://localhost:5000/api/application/${id}`);
        console.log("Fetched Data:", res.data);
        // Agar backend { application: {...} } bhej raha ho ya direct object bhej raha ho:
        setdata(res.data.application || res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    if (id) {
      fetchdata();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading application details...</span>
      </div>
    );
  }

  const application = data;

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No application found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative">
              <img
                alt="Applicant photo"
                className="w-full h-full object-cover"
                src={application?.user?.photo || "/placeholder.jpg"}
              />
              {application.status && (
                <div
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full ${
                    application.status === "accepted"
                      ? "bg-green-100 text-green-600"
                      : application.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <span className="font-semibold capitalize">
                    {application.status}
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-sm font-medium text-gray-500">Company</h2>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {application.company}
                </h1>
              </div>

              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-sm font-medium text-gray-500">
                    Cover Letter
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {application.coverLetter}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-500">
                      Application Date
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-500">
                      Applied By
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {application.user?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;