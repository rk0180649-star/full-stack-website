"use client"
import React, {useEffect, useState} from "react";
import { Building2, Calendar, CheckCircle2, XCircle, User, Tag, Mail } from "lucide-react";
import Link from "next/link";
import { selectuser } from "@/app/Feature/Userslice";
import { useSelector } from "react-redux";
import axios from "axios";

interface User{
    name: string;
    email: string;
    photo: string;
}

const Applications = [
  {
    _id: "1",
    company: "Tech Corp",
    category: "Software",
    user: { name: "Rupesh", email: "john@example.com" },
    createAt: "2024-03-10T12:00:00Z",
    status: "approved",
  },
  {
    _id: "2",
    company: "Health Solutions",
    category: "Healthcare",
    user: { name: "Rupesh", email: "jane@example.com" },
    createAt: "2024-03-08T10:30:00Z",
    status: "pending",
  },
  {
    _id: "3",
    company: "EduLearn",
    category: "Education",
    user: { name: "Rupesh", email: "alice@example.com" },
    createAt: "2024-03-05T09:15:00Z",
    status: "rejected",
  },
];

const getStatusColor = (status: any) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-100 text-emerald-600";
    case "rejected":
      return "bg-rose-100 text-rose-500";
    default:
      return "bg-amber-100 text-amber-600";
  }
};


const page = () => {
   const [searchTerm, setSearchTerm] = useState("");
   const [filter, setFilter] = useState("all");
   const user=useSelector(selectuser)
   //const[user, setuser] = useState<User|null>({
    //name: "Rupesh",
    //email: 'rk0180649@gmail.com',
    //photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&h=640&fit=crop&crop=faces"
    //});
 
    const [data, setdata] = useState <any>([]);
           useEffect(()=>{
              const fetchdata = async () =>{
                try{
                  const res=await axios.get("http://localhost:5000/api/application")
                  setdata(res.data);
                
                }catch(error){
                  console.log(error);
                }
              }
              fetchdata()
            },[]);

    const userapplication = data.filter(
    (app: any) => app.user?.name === user?.name
    );

    

    const filteredApplications = data.filter((application: any) => {
    const searchMatch =
      application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.category.toLowerCase().includes(searchTerm.toLowerCase());
      

    if (filter === "all") return searchMatch;
    return searchMatch && application.status.toLowerCase() === filter;
  });

   return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      {/* Centralized Card Container */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">My Applications</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track and Manage your job and internship applications
          </p>
        </div>

        {/* Filter & Search Bar Section */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Input field with icon */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, category, or applicant..."
                className="w-full text-xs text-gray-700 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === "approved"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === "rejected"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-y border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-6">Company & Category</th>
                <th className="py-3 px-6">Applicant</th>
                <th className="py-3 px-6">Applied Date</th>
                <th className="py-3 px-6">Status</th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredApplications.map((application: any) => (
                <tr key={application._id} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* Company & Category */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{application.company}</div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <Tag className="h-3 w-3" />
                          {application.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Applicant */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{application.user.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{application.user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Applied Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(application.createdAt).toISOString().split("T")[0]}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                     <span
                      className={`px-2.5 py-1 inline-block text-[11px] font-semibold rounded-full capitalize ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </td>

                  {/* Actions */}
         
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};


export default page;