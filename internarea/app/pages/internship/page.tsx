"use client"
import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { ArrowUpRight,  Clock, DollarSign, Filter, Pin, PlayCircle, X } from 'lucide-react';
import axios from 'axios';
/*
const internshipData = [
  {
    _id: "1",
    title: "Frontend Developer Intern",
    company: "TechCorp",
    StartDate: "April 2025",
    Duration: "3 Months",
    stipend: "$500/month",
    category: "Web Development",
    location: "New York",
  },
  {
    _id: "2",
    title: "Data Science Intern",
    company: "DataTech",
    StartDate: "May 2025",
    Duration: "6 Months",
    stipend: "$800/month",
    category: "Data Science",
    location: "San Francisco",
  },
  {
    _id: "3",
    title: "Marketing Intern",
    company: "MarketPro",
    StartDate: "June 2025",
    Duration: "4 Months",
    stipend: "$400/month",
    category: "Marketing",
    location: "Los Angeles",
  },
];*/

const page = () => {
  const [filteredInternships, setFilteredInternships] = useState<any>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filter, setFilters] = useState({
    category: "",
    location: "",
    workFromHome: false,
    partTime: false,
    stipend: 50,
  });

  const [internshipData, setinternship] = useState <any>([]);
       useEffect(()=>{
          const fetchdata = async () =>{
            try{
              const res=await axios.get("http://localhost:5000/api/internship")
              setinternship(res.data);
              setFilteredInternships(res.data);
            }catch(error){
              console.log(error);
            }
          }
          fetchdata()
        },[]);


  useEffect(() => {
    const filtered = internshipData.filter((internship: any) => {
      const matchesCategory = internship.category
        .toLowerCase()
        .includes(filter.category.toLowerCase());
      const matchesLocation = internship.location
        .toLowerCase()
        .includes(filter.location.toLowerCase());
      return matchesCategory && matchesLocation;
    });
    setFilteredInternships(filtered);
  }, [filter, internshipData]);

  const handleFilterChange = (e:any) => {
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
        stipend: 50,})
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
                Monthly Stipend (₹)
            </label>

            <input
                type="range"
                name="stipend"
                min="0"
                max="100"
                value={filter.stipend}
                onChange={handleFilterChange}
                className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
                <span>₹0</span>
                <span>₹50k</span>
                <span>₹100k</span>
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
                {filteredInternships.length} Internships found
                </p>
            </div>

            <div>
                  {filteredInternships.map((internship: any) => (
                  <div 
                    key={internship._id} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-1 text-blue-600 mb-2 text-sm font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Actively Hiring</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {internship.title}
                    </h2>

                    <p className="text-gray-500 text-sm mb-6">
                      {internship.company}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <PlayCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Start Date</p>
                          <p className="text-sm font-medium text-gray-800">{internship.StartDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Pin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">location</p>
                          <p className="text-sm font-medium text-gray-800">{internship.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Stipend</p>
                          <p className="text-sm font-medium text-gray-800">{internship.stipend}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Internship
                        </span>

                        <div className="flex items-center space-x-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-medium">Posted recently</span>
                        </div>
                      </div>

                      <NextLink
                        href={`/pages/detailinternship/${internship._id}`}
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
            Monthly Stipend (₹)
          </label>

          <input
            type="range"
            name="stipend"
            min="0"
            max="100"
            value={filter.stipend}
            onChange={handleFilterChange}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-gray-600">
            <span>₹0</span>
            <span>₹50k</span>
            <span>₹100k</span>
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
};



export default page;
