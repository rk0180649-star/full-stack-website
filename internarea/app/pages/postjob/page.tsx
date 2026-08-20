"use client";
import axios from "axios";
import {
  User, Building, DollarSign, Calendar, Info, MapPin, Tags, Briefcase, Users, Gift} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  const [formData, setformdata] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
    aboutCompany: "",
    aboutJob: "",
    Whocanapply: "",
    perks: "",
    numberOfOpening: "",
    CTC: "",
    StartDate: "",
    AdditionalInfo: "",
  });

  const router=useRouter();
  const[isloading, setisloading]=useState(false);
  const handlechange = (e: any) => {
    const { name, value } = e.target;

    setformdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlsubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    const hasemptyfields = Object.values(formData).some(val=>!val.trim())

    if ( hasemptyfields){
      toast.error("please fill in all detailts")
      return
    }
    try{
      setisloading(true)
      const res=await axios.post("https://full-stack-website-h8ju.onrender.com/api/job", formData)
      toast.success("job posted succefully")
      router.push("/pages/adminpanel")

    }catch (error){
      console.log(error);
      toast.error("error posting job")
     
    }finally{
      setisloading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container Size Max-w-4xl for wider layout */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Post New Job
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a new JOb opportunity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handlsubmit}>
            
            {/* Grid 1: Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <User className="h-4 w-4 text-gray-500" />
                    Title*
                  </div>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handlechange}
                  placeholder="e.g. Fullstack Developer"
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Location*
                  </div>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handlechange}
                  placeholder="e.g. Mumbai, India"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Grid 2: Company & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    Company Name*
                  </div>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handlechange}
                  placeholder="e.g. Tech Solutions Inc"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Tags className="h-4 w-4 text-gray-500" />
                    Category*
                  </div>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handlechange}
                  placeholder="e.g. Software Development"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* About Company (Full Width Textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center mb-1 gap-1">
                  <Info className="h-4 w-4 text-gray-500" />
                  About Company*
                </div>
              </label>
              <textarea
                name="aboutCompany"
                rows={3}
                value={formData.aboutCompany}
                onChange={handlechange}
                placeholder="Describe your company"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              />
            </div>

            {/* About Internship (Full Width Textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center mb-1 gap-1">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  About Job*
                </div>
              </label>
              <textarea
                name="aboutJob"
                rows={3}
                value={formData.aboutJob}
                onChange={handlechange}
                placeholder="Describe the job role"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              />
            </div>

            {/* Grid 3: Who Can Apply & Perks (Textareas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    Who Can Apply*
                  </div>
                </label>
                <textarea
                  name="Whocanapply"
                  rows={2}
                  value={formData.Whocanapply}
                  onChange={handlechange}
                  placeholder="Eligibility criteria"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Gift className="h-4 w-4 text-gray-500" />
                    Perks*
                  </div>
                </label>
                <textarea
                  name="perks"
                  rows={2}
                  value={formData.perks}
                  onChange={handlechange}
                  placeholder="List the perks"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                />
              </div>
            </div>

            {/* Grid 4: Number of Openings & Stipend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    Number of Openings*
                  </div>
                </label>
                <input
                  type="number"
                  name="numberOfOpening"
                  value={formData.numberOfOpening}
                  onChange={handlechange}
                  placeholder="e.g. 5"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    CTC*
                  </div>
                </label>
                <input
                  type="text"
                  name="CTC"
                  value={formData.CTC}
                  onChange={handlechange}
                  placeholder="e.g. ₹10 LPAn"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Grid 5: Start Date & Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Start Date*
                  </div>
                </label>
                <input
                  type="date"
                  name="StartDate"
                  value={formData.StartDate}
                  onChange={handlechange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1 gap-1">
                    <Info className="h-4 w-4 text-gray-500" />
                    Additional Information*
                  </div>
                </label>
                <input
                  type="text"
                  name="AdditionalInfo"
                  value={formData.AdditionalInfo}
                  onChange={handlechange}
                  placeholder="Any additional details"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isloading}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                {isloading ? (
                  <div>
                    <div></div>
                    posting job....
                  </div>
                ) : (
                  "Post Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;