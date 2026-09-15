"use client"; 
import { useRouter,useParams } from "next/navigation"; 
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, DollarSign, Clock, ExternalLink, X, Book} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/app/Feature/Userslice";

const page = () => {
  const user=useSelector(selectuser)
  const params = useParams();
  const id = params?.id; // URL se [id] ki value lega
  const router =useRouter();

    const [jobdata, setjob] = useState <any>([]);
         useEffect(()=>{
            const fetchdata = async () =>{
              try{
                const res=await axios.get(`https://full-stack-website-h8ju.onrender.com/api/job/${id}`)
                setjob(res.data);
              }catch(error){
                console.log(error);
              }
            }
            fetchdata()
          },[]);
  
  const [availability, setAvailability]=useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState ("");

  if (!jobdata) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  };

  // update submitApplication function
const submitApplication = async () => {
    // 1. Safe extraction (Firebase Google user + Normal user dono ke liye)
    const userEmail = 
      user?.email || 
      user?.user?.email || 
      (typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}")?.email) || 
      "";

    if (!userEmail) {
      alert("Please login first to apply.");
      router.push("/pages/loginpage");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/apply", {
        company: jobdata?.company,
        category: jobdata?.category,
        coverLetter: coverLetter,
        //  Email explicitly bhejien taaki backend ko dhoondhne me dikkat na ho:
        email: userEmail,
        user: {
          ...user,
          email: userEmail,
          name: user?.name || user?.displayName || user?.user?.displayName || "Candidate",
        },
        Application: jobdata,
      });

      if (res.data.success) {
        toast.success("Application successfully submitted!");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      const resData = error.response?.data;
      if (resData?.limitReached) {
        if (confirm(`${resData.message}\n\nKya aap Pricing Plans dekhna chahte hain?`)) {
          router.push("/pages/pricing");
        }
      } else {
        toast.error(resData?.message || "Failed to apply.");
      }
    }
  };

return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">Actively Hiring</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {jobdata.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {jobdata.company}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{jobdata.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-5 w-5" />
              <span>CTC {jobdata.CTC}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Book className="h-5 w-5" />
              <span>{jobdata.category}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm">
              Posted on {jobdata.createdAt}
            </span>
          </div>
        </div>

        {/* Company Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            About {jobdata.company}
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Visit company website</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-gray-600">{jobdata.aboutCompany}</p>
        </div>

        {/* Internship Details Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            About the Job
          </h2>
          <p className="text-gray-600 mb-6">{jobdata.aboutJob}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Who can apply
          </h3>
          <p className="text-gray-600 mb-6">{jobdata.Whocanapply}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">Perks</h3>
          <p className="text-gray-600 mb-6">{jobdata.perks}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Additional Information
          </h3>
          <p className="text-gray-600 mb-6">{jobdata.AdditionalInfo}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Number of Openings
          </h3>
          <p className="text-gray-600">{jobdata.numberOfOpening}</p>
        </div>
      

        {/* Apply Button */}
          <div className="p-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-150"
            >
              Apply Now
            </button>
          </div>
          </div>

          {/* Apply Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Apply to {jobdata.company}
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Resume Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Resume
                    </h3>
                    <p className="text-gray-600">
                      Your current resume will be submitted with the application
                    </p>
                  </div>

                  {/* Cover Letter Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cover Letter
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Why should you be selected for this internship?
                    </p>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Write your cover letter here..."
                    />
                  </div>

                  {/* Availability Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Availability
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Yes, I am available to join immediately",
                        "No, I am currently on notice period",
                        "No, I will have to serve notice period",
                        "Other",
                      ].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name=""
                            id=""
                            value={option}
                            checked={availability === option}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit / Auth Action */}
                  <div className="flex justify-end pt-4">
                    {user ?(
                      <button
                       className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700" onClick={submitApplication}>
                        Submit Application
                      </button>
                    ) : (
                      <Link
                        href="/"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Sign up to apply
                      </Link>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}
    </div>
  );
}

export default page;