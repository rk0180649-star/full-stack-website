"use client"
import { useEffect, useState } from "react";
import NextLink from 'next/link';
import { ArrowUpRight, Book, Calendar, Clock, DollarSign, Filter, Pin, PlayCircle, X } from 'lucide-react';
import axios from "axios";
/*
export const filteredJobs = [
  {
    _id: "101",
    title: "Frontend Developer",
    company: "Amazon",
    location: "Remote",
    CTC: "$100k/years",
    Experience: "2+ years",
    category: "Engineering",
    Duration: "3 Months",
    StartDate: "March 15, 2025",
    aboutCompany:
      "Tech Innovators is a leading software development company specializing in modern web applications.",
    aboutJob:
      "As a Frontend Developer Job, you will work on real-world projects using React.js and Tailwind CSS.",
    Whocanapply:
      "Students and fresh graduates with knowledge of HTML, CSS, JavaScript, and React.js.",
    perks: "Certificate, Letter of Recommendation, Flexible Work Hours",
    AdditionalInfo: "This is a remote internship with flexible working hours.",
    numberOfOpening: "2",
  },
  {
    _id: "102",
    title: "Backend Developer",
    company: "Cloud Systems",
    location: "San Francisco",
    CTC: "$90k/years",
    Experience: "1+ years",
    category: "Engineering",
    Duration: "4 Months",
    StartDate: "April 1, 2025",
    aboutCompany:
      "Cloud Systems focuses on scalable backend solutions and cloud-based applications.",
    aboutJob:
      "As a Backend Developer Job, you will work with Node.js, Express, and MongoDB.",
    Whocanapply:
      "Students with experience in backend technologies and databases.",
    perks: "Certificate, Networking Opportunities, Paid Internship",
    AdditionalInfo: "A strong foundation in databases is required.",
    numberOfOpening: "3",
  },
  {
    _id: "103",
    title: "Data Analyst",
    company: "Microsoft",
    location: "New York",
    CTC: "$100k/years",
    Experience: "1+ years",
    category: "Data Science",
    Duration: "6 Months",
    StartDate: "May 10, 2025",
    aboutCompany:
      "Creative Minds is a design agency focused on user experience and interface design.",
    aboutJob:
      "As a UI/UX Designer Job, you will work with Figma, Adobe XD, and design systems.",
    Whocanapply:
      "Students passionate about designing intuitive user experiences.",
    perks: "Mentorship, Hands-on Projects, Letter of Recommendation",
    AdditionalInfo: "A portfolio is required for application.",
    numberOfOpening: "1",
  },
];
*/

const page = () =>{

  const [filteredjob, setFilteredJobs] = useState<any>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filter, setFilters] = useState({
    category: "",
    location: "",
    workFromHome: false,
    partTime: false,
    Salary: 50,
    Experience: ""
  });

    const [filteredJobs, setjob] = useState <any>([]);
       useEffect(()=>{
          const fetchdata = async () =>{
            try{
              const res=await axios.get("https://full-stack-website-h8ju.onrender.com/api/job")
              setjob(res.data);
              setFilteredJobs(res.data);
            }catch(error){
              console.log(error);
            }
          }
          fetchdata()
        },[]);


  useEffect(() => {
    const filtered = filteredJobs.filter((job: any) => {
      const matchesCategory = job.category
        .toLowerCase()
        .includes(filter.category.toLowerCase());
      const matchesLocation = job.location
        .toLowerCase()
        .includes(filter.location.toLowerCase());
      return matchesCategory && matchesLocation;
    });
    setFilteredJobs(filtered);
  }, [filter, filteredJobs]);

  const handleFilterChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearFilters=()=>{
    setFilters({
        category: "",
        location: "",
        workFromHome: false,
        partTime:  false,
        Salary: 50,
        Experience: ""
    })
  }


    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter */}
          <div className="hidden md:block w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-black">Filters</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            </div>
            <div className='space-y-6'>
                {/* Profile/Category Filter */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
            </label>
            <input
                type="text"
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="e.g. Marketing Intern"
            />
            </div>
            {/* Location Filter */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
            </label>
            <input
                type="text"
                name="location"
                value={filter.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="e.g. Mumbai"
            />
            </div>

              {/* experians filter */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Experince
            </label>
            <input
                type="text"
                name="Experience"
                value={filter.Experience}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="e.g. Mumbai"
            />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
            <label className="flex items-center space-x-2">
                <input
                type="checkbox"
                name="workFromHome"
                checked={filter.workFromHome}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">Work from home</span>
            </label>

            <label className="flex items-center space-x-2">
                <input
                type="checkbox"
                name="partTime"
                checked={filter.partTime}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">Part-time</span>
            </label>
            </div>

            {/* Stipend Range */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Salary (₹ in lakhs)
            </label>

            <input
                type="range"
                name="salary"
                min="0"
                max="100"
                value={filter.Salary}
                onChange={handleFilterChange}
                className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
                <span>₹0L</span>
                <span>₹50L</span>
                <span>₹100L</span>
            </div>
            </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="md:hidden mb-4">
                <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="w-full flex items-center justify-center space-x-2 bg-white p-3 rounded-lg shadow-sm text-blue"
                >
                <Filter className="h-5 w-5" />
                <span>Show Filters</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <p className="text-center font-medium text-black">
                {filteredjob.length} Jobs found
                </p>
            </div>

            <div>
                  {filteredjob.map((job: any) => (
                  <div 
                    key={job._id} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-1 text-blue-600 mb-2 text-sm font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Actively Hiring</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {job.title}
                    </h2>

                    <p className="text-gray-500 text-sm mb-6">
                      {job.company}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Book className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Category</p>
                          <p className="text-sm font-medium text-gray-800">{job.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Pin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm font-medium text-gray-800">{job.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">CTC</p>
                          <p className="text-sm font-medium text-gray-800">{job.CTC}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Jobs
                        </span>

                        <div className="flex items-center space-x-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-medium">Posted recently</span>
                        </div>
                      </div>

                      <NextLink
                        href={`/pages/detailjob/${job._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap shrink-0"
                      >
                        View Details
                      </NextLink>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Filters Modal */}
       {isFilterVisible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
    <div className="bg-white h-full w-full max-w-sm ml-auto p-6 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-lg text-black">Filters</span>
        </div>

        <button
          onClick={() => setIsFilterVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>

          <input
            type="text"
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="e.g. Marketing Intern"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>

          <input
            type="text"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="e.g. Mumbai"
          />
        </div>

               {/* experians filter */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Experince
            </label>
            <input
                type="text"
                name="Experience"
                value={filter.Experience}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="e.g. Mumbai"
            />
            </div>


        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="workFromHome"
              checked={filter.workFromHome}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Work from home</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="partTime"
              checked={filter.partTime}
              onChange={handleFilterChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Part-time</span>
          </label>
        </div>

        {/* Stipend */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Salary (₹ in lakhs)
          </label>

          <input
            type="range"
            name="salary"
            min="0"
            max="100"
            value={filter.Salary}
            onChange={handleFilterChange}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-gray-600">
            <span>₹0L</span>
            <span>₹50L</span>
            <span>₹100L</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={clearFilters}
            className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg"
          >
            Clear
          </button>

          <button
            onClick={() => setIsFilterVisible(false)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  </div>
)}
          
    </div>
  );

}

export default page;